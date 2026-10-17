import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const pin = readJson('extraction/source-pins/current.json');
const treePath = pin.manifest_paths?.tree || 'extraction/manifests/source-tree-2026-10-14.json';
const dispositionPath = pin.manifest_paths?.dispositions || 'extraction/manifests/path-dispositions-2026-10-14.json';
const tree = readJson(treePath);
const dispositions = readJson(dispositionPath);
const failures = [];
const warnings = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

assert(Boolean(pin.source.commit), 'source pin is missing commit SHA');
assert(Boolean(pin.source.tree), 'source pin is missing root tree SHA');
assert(pin.source.tree_truncated === false, 'source pin says the source tree was truncated');
assert(tree.complete === true, 'tree manifest is incomplete or has unresolved gitlinks');
assert(pin.source.commit === tree.source_pin.commit, 'pin commit differs from tree manifest');
assert(pin.source.tree === tree.source_pin.tree, 'pin tree differs from tree manifest');
assert(pin.source.entry_count === tree.entries.length, 'pin entry count differs from tree manifest');

const pathSet = new Set();
for (const entry of tree.entries) {
  assert(!pathSet.has(entry.path), 'duplicate source tree path: ' + entry.path);
  pathSet.add(entry.path);
}
const blobs = tree.entries.filter((entry) => entry.type === 'blob');
const blobByPath = new Map(blobs.map((entry) => [entry.path, entry]));
assert(dispositions.source_pin.commit === pin.source.commit, 'disposition register belongs to a different source commit');
assert(dispositions.source_pin.tree === pin.source.tree, 'disposition register belongs to a different source tree');
assert(dispositions.files.length === blobs.length, 'disposition register does not cover every current source blob');

for (const item of dispositions.files) {
  const source = blobByPath.get(item.path);
  assert(Boolean(source), 'disposition path is absent from current source tree: ' + item.path);
  if (source) {
    assert(source.sha === item.sha, 'blob SHA mismatch for disposition path: ' + item.path);
    assert(source.mode === item.mode, 'mode mismatch for disposition path: ' + item.path);
  }
}

const candidatesPath = 'extraction/manifests/capability-candidates-2026-10-14.json';
const architecturePath = 'extraction/manifests/architecture-map-initial.json';
for (const relative of [candidatesPath, architecturePath]) {
  if (!fs.existsSync(path.join(root, relative))) continue;
  const doc = readJson(relative);
  const recordedCommit = doc.source_pin?.commit || doc.source?.commit || doc.source_commit;
  if (recordedCommit && recordedCommit !== pin.source.commit) {
    warnings.push(relative + ' is historical evidence for ' + recordedCommit + '; re-trace against current pin ' + pin.source.commit + '.');
    continue;
  }
  const areas = doc.areas || doc.capabilities || [];
  for (const area of areas) {
    const items = [...(area.representative_paths || []), ...(area.paths || []), ...(area.tests || [])];
    for (const item of items) {
      const candidatePath = typeof item === 'string' ? item : item.path;
      if (!candidatePath) continue;
      const source = blobByPath.get(candidatePath);
      assert(Boolean(source), relative + ' references missing source path: ' + candidatePath);
      if (source && item.blob_sha) assert(source.sha === item.blob_sha, relative + ' blob SHA mismatch: ' + candidatePath);
    }
  }
}

const snapshotRelative = pin.manifest_paths?.snapshot;
if (snapshotRelative) {
  const snapshotRoot = path.join(root, snapshotRelative);
  if (!fs.existsSync(snapshotRoot)) {
    if (pin.state?.source_copy_authorized) failures.push('authorized source snapshot is missing: ' + snapshotRelative);
    else warnings.push('No immutable source snapshot exists yet; only discovery manifests are present.');
  } else {
    const actualFiles = [];
    const walk = (directory, prefix = '') => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const relative = prefix ? prefix + '/' + entry.name : entry.name;
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(full, relative);
        else actualFiles.push({ path: relative, full, symlink: entry.isSymbolicLink() });
      }
    };
    walk(snapshotRoot);
    const actualByPath = new Map(actualFiles.map((item) => [item.path, item]));
    assert(actualFiles.length === blobs.length, 'snapshot file count differs from source blob count');
    for (const source of blobs) {
      const actual = actualByPath.get(source.path);
      assert(Boolean(actual), 'snapshot is missing source path: ' + source.path);
      if (!actual) continue;
      const stat = fs.lstatSync(actual.full);
      assert((source.mode === '120000') === actual.symlink, 'symlink mode mismatch: ' + source.path);
      if (source.mode === '100755') assert((stat.mode & 0o111) !== 0, 'executable bit missing: ' + source.path);
      const bytes = actual.symlink ? Buffer.from(fs.readlinkSync(actual.full)) : fs.readFileSync(actual.full);
      const actualSha = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
      assert(actualSha === source.sha, 'snapshot blob SHA mismatch for ' + source.path + ': expected ' + source.sha + ', got ' + actualSha);
    }
    for (const actual of actualFiles) {
      assert(blobByPath.has(actual.path), 'unexpected file in snapshot: ' + actual.path);
    }
    if (pin.source.gitlink_count > 0) failures.push('source tree contains gitlinks that require separate submodule capture.');
  }
} else {
  warnings.push('Pin has no immutable snapshot path; snapshot capture has not yet been recorded.');
}

if (failures.length) {
  for (const message of failures) console.error('FAIL: ' + message);
  console.error('FAIL: inventory/source-snapshot consistency checks failed.');
  process.exitCode = 1;
} else {
  const unclassified = dispositions.files.filter((item) => item.disposition === 'UNCLASSIFIED').length;
  console.log('PASS: inventory consistency checks passed.');
  console.log('Source pin: ' + pin.source.commit + ' / ' + pin.source.tree);
  console.log('Tree entries: ' + tree.entries.length + '; blobs: ' + blobs.length + '; trees: ' + tree.entries.filter((entry) => entry.type === 'tree').length);
  console.log('Explicitly unclassified paths: ' + unclassified + '.');
  for (const message of warnings) console.warn('WARN: ' + message);
  console.log('This check does not prove capability closure, license clearance, or host-integration readiness.');
}
