import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Capture from Git objects rather than the working tree so Git LFS smudging or platform filters cannot silently change source bytes.\nconst repoRoot = process.cwd();
const sourceRoot = path.resolve(process.argv[2] || process.env.UPSTREAM_SOURCE_PATH || '../upstream-source');
const pinPath = path.join(repoRoot, 'extraction/source-pins/current.json');
const pin = JSON.parse(fs.readFileSync(pinPath, 'utf8'));
const git = (args, options = {}) => execFileSync('git', ['-C', sourceRoot, ...args], {
  encoding: options.encoding === undefined ? 'utf8' : options.encoding,
  maxBuffer: 1024 * 1024 * 1024,
  ...options
});
const commit = git(['rev-parse', 'HEAD']).trim();
const treeSha = git(['rev-parse', commit + '^{tree}']).trim();
if (!/^[0-9a-f]{40}$/.test(commit) || !/^[0-9a-f]{40}$/.test(treeSha)) {
  throw new Error('Could not resolve a full upstream commit and root tree SHA.');
}

const existingSnapshotSource = path.join(repoRoot, 'extraction/snapshots', commit, 'source');
if (pin.source.commit === commit && fs.existsSync(existingSnapshotSource)) {
  console.log('Upstream commit ' + commit + ' is already the current pinned snapshot; no update needed.');
  process.exit(0);
}

const capturedAt = new Date().toISOString();
const capturedDate = capturedAt.slice(0, 10);
const rawTree = git(['ls-tree', '-r', '-t', '-z', '--full-tree', commit], { encoding: null });
const records = rawTree.toString('utf8').split('\0').filter(Boolean);
const entries = [];
const blobs = [];
const gitlinks = [];

for (const record of records) {
  const tab = record.indexOf('\t');
  if (tab < 0) throw new Error('Malformed ls-tree record: ' + record.slice(0, 120));
  const [mode, type, sha] = record.slice(0, tab).split(' ');
  const relativePath = record.slice(tab + 1);
  if (!relativePath || relativePath.startsWith('/') || relativePath.split('/').includes('..')) {
    throw new Error('Unsafe source path in tree: ' + relativePath);
  }
  const entry = { path: relativePath, type, mode, sha };
  if (type === 'blob') {
    entry.size = Number(git(['cat-file', '-s', sha]).trim());
    blobs.push(entry);
  } else if (type === 'commit') {
    gitlinks.push(entry);
  }
  entries.push(entry);
}

const snapshotRoot = path.join(repoRoot, 'extraction/snapshots', commit);
const sourceDestination = path.join(snapshotRoot, 'source');
if (fs.existsSync(sourceDestination)) {
  throw new Error('Snapshot already exists at ' + sourceDestination + '; immutable snapshots are never overwritten.');
}
fs.mkdirSync(sourceDestination, { recursive: true });

let copied = 0;
for (const entry of blobs) {
  const destination = path.join(sourceDestination, entry.path);
  const resolved = path.resolve(destination);
  if (!resolved.startsWith(path.resolve(sourceDestination) + path.sep)) {
    throw new Error('Path escaped snapshot destination: ' + entry.path);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const content = git(['cat-file', 'blob', entry.sha], { encoding: null });
  if (entry.mode === '120000') {
    fs.symlinkSync(content.toString('utf8'), destination);
  } else {
    fs.writeFileSync(destination, content);
    fs.chmodSync(destination, entry.mode === '100755' ? 0o755 : 0o644);
  }
  const actual = entry.mode === '120000'
    ? execFileSync('git', ['hash-object', '--stdin'], { input: Buffer.from(fs.readlinkSync(destination)), encoding: 'utf8' }).trim()
    : execFileSync('git', ['hash-object', '--no-filters', '--', destination], { encoding: 'utf8' }).trim();
  if (actual !== entry.sha) {
    throw new Error('Exact blob SHA mismatch at ' + entry.path + ': expected ' + entry.sha + ', got ' + actual);
  }
  copied += 1;
}

const treeManifestPath = 'extraction/manifests/source-tree-' + capturedDate + '-' + commit.slice(0, 7) + '.json';
const dispositionManifestPath = 'extraction/manifests/path-dispositions-' + capturedDate + '-' + commit.slice(0, 7) + '.json';
const oldDispositionPath = pin.manifest_paths && pin.manifest_paths.dispositions
  ? path.join(repoRoot, pin.manifest_paths.dispositions)
  : path.join(repoRoot, 'extraction/manifests/path-dispositions-2026-10-14.json');
let oldDispositions = new Map();
if (fs.existsSync(oldDispositionPath)) {
  const old = JSON.parse(fs.readFileSync(oldDispositionPath, 'utf8'));
  oldDispositions = new Map(old.files.map((item) => [item.path, item]));
}

const dispositionFiles = blobs.map((entry) => {
  const previous = oldDispositions.get(entry.path);
  if (previous && previous.sha === entry.sha && previous.mode === entry.mode) return { ...previous };
  return {
    path: entry.path,
    sha: entry.sha,
    mode: entry.mode,
    size: entry.size,
    candidate_areas: previous ? (previous.candidate_areas || []) : [],
    disposition: 'UNCLASSIFIED',
    reuse_status: 'UNDECIDED',
    license_status: 'UNREVIEWED',
    closure_status: 'UNMAPPED',
    notes: previous
      ? 'Content or mode changed at upstream ' + commit + '; prior assessment reset and requires review.'
      : 'New path at upstream ' + commit + '; inspect content, provenance, license and dependency closure.'
  };
});

const sourceIdentity = { repository: 'maathimself/mailflow', commit, tree: treeSha };
const treeManifest = {
  schema_version: '1.0.0',
  source_pin: sourceIdentity,
  captured_at: capturedAt,
  complete: gitlinks.length === 0,
  entries
};
const dispositionManifest = {
  schema_version: '1.0.0',
  source_pin: sourceIdentity,
  created_at: capturedAt,
  status: 'DISCOVERY_IN_PROGRESS',
  files: dispositionFiles,
  removed_since_previous_pin: [...oldDispositions.keys()].filter((p) => !blobs.some((item) => item.path === p))
};
fs.mkdirSync(path.dirname(path.join(repoRoot, treeManifestPath)), { recursive: true });
fs.writeFileSync(path.join(repoRoot, treeManifestPath), JSON.stringify(treeManifest, null, 2) + '\n');
fs.writeFileSync(path.join(repoRoot, dispositionManifestPath), JSON.stringify(dispositionManifest, null, 2) + '\n');

const updatedPin = {
  ...pin,
  source: {
    repository: 'https://github.com/maathimself/mailflow',
    repository_full_name: 'maathimself/mailflow',
    branch: 'main',
    commit,
    tree: treeSha,
    commit_url: 'https://github.com/maathimself/mailflow/commit/' + commit,
    tree_url: 'https://github.com/maathimself/mailflow/tree/' + commit,
    captured_at: capturedAt,
    capture_method: 'Git object database; recursive ls-tree and exact blob extraction',
    tree_truncated: false,
    entry_count: entries.length,
    blob_count: blobs.length,
    directory_count: entries.filter((entry) => entry.type === 'tree').length,
    gitlink_count: gitlinks.length
  },
  manifest_paths: {
    tree: treeManifestPath,
    dispositions: dispositionManifestPath,
    snapshot: 'extraction/snapshots/' + commit + '/source'
  },
  state: {
    ...pin.state,
    phase: 'PHASE 2 - IMMUTABLE SOURCE SNAPSHOT AND VERIFICATION',
    source_copy_authorized: true,
    verification_status: gitlinks.length === 0
      ? 'EXACT BLOB SHA CHECKS PASSED DURING SNAPSHOT CAPTURE; CAPABILITY CLOSURE AND PER-PATH LICENSE CLASSIFICATION REMAIN OPEN'
      : 'SNAPSHOT CAPTURED WITH GITLINKS REQUIRING SEPARATE SUBMODULE CAPTURE; CLOSURE AND LICENSE REVIEW OPEN',
    baseline_type: 'IMMUTABLE_UPSTREAM_SNAPSHOT',
    status: gitlinks.length === 0
      ? 'SNAPSHOT_CAPTURED; EXTRACTION CLOSURE AND LICENSE REVIEW PENDING'
      : 'SNAPSHOT_PARTIAL_GITLINKS_PENDING; EXTRACTION CLOSURE AND LICENSE REVIEW PENDING'
  }
};
fs.writeFileSync(pinPath, JSON.stringify(updatedPin, null, 2) + '\n');

const snapshotManifest = {
  schema_version: '1.0.0',
  source: sourceIdentity,
  captured_at: capturedAt,
  snapshot_path: 'extraction/snapshots/' + commit + '/source',
  tree_manifest: treeManifestPath,
  disposition_manifest: dispositionManifestPath,
  entry_count: entries.length,
  blob_count: blobs.length,
  directory_count: entries.filter((entry) => entry.type === 'tree').length,
  gitlink_count: gitlinks.length,
  exact_blob_checks: { checked: copied, failed: 0 },
  license: {
    primary_declared: 'AGPL-3.0',
    commercial_license_notice_present: true,
    cla_notice_present: true,
    per_path_provenance_review: 'PENDING',
    redistribution_review: 'PENDING'
  },
  status: gitlinks.length === 0 ? 'EXACT_GIT_BLOB_SNAPSHOT_CAPTURED' : 'SNAPSHOT_CAPTURED_WITH_GITLINKS_PENDING',
  not_a_claim_of: ['complete capability closure', 'per-path license clearance', 'host-integration readiness', 'extraction PASS']
};
fs.writeFileSync(path.join(snapshotRoot, 'snapshot-manifest.json'), JSON.stringify(snapshotManifest, null, 2) + '\n');

console.log('Captured upstream ' + commit + ' (' + treeSha + ').');
console.log('Entries: ' + entries.length + '; blobs copied and SHA-checked: ' + copied + '; trees: ' + entries.filter((entry) => entry.type === 'tree').length + '; gitlinks: ' + gitlinks.length + '.');
console.log('Snapshot: extraction/snapshots/' + commit + '/source');
console.log('Tree manifest: ' + treeManifestPath);
console.log('Disposition manifest: ' + dispositionManifestPath);
console.log('Note: source snapshot integrity is not capability closure or license clearance.');
