# Path Disposition Carry-Forward Audit — 2026-10-19

## Inputs

- Previous pin: `35067fc2876d50980f1a8a3b8ea72b5467b69f60`; `path-dispositions-2026-10-17-35067fc.json`.
- Current pin: `c1c446914dc031feb331993c9da339cc524809d5`; `path-dispositions-2026-10-19-c1c4469.json`.
- Source entries are compared by relative path, Git blob SHA and Git mode. Content similarity alone is not sufficient for carrying a classification.

## Result

- Previous source blobs: 1,350.
- Current source blobs: 1,354.
- Exact path + SHA + mode matches: 1,341.
- Existing paths with changed SHA and/or mode: 9.
- New paths: 4.
- Current classified dispositions: 282.
- Current `UNCLASSIFIED`: 1,072.
- Exact-match carry-forward mismatches: 0.
- Changed existing paths incorrectly retaining an old classification: 0.
- New paths incorrectly assigned a non-default classification: 0.

The 1,341 exact-match paths preserve the previous disposition/reuse/license/closure fields exactly. All 9 changed paths and all 4 new paths reset to `disposition=UNCLASSIFIED`, `reuse_status=UNDECIDED`, `closure_status=UNMAPPED`. License status remains `UNREVIEWED` for those paths.

## Interpretation

The current path-disposition transition obeys the rule that an earlier assessment can be carried forward only when both Git blob SHA and mode are unchanged. This validates disposition carry-forward mechanics only; it does not clear licensing, provenance, redistribution or capability closure.
