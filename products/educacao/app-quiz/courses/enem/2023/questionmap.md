# ENEM 2023 Question Source Plan

## Source of truth
- Use the question datasets available at [https://github.com/yunger7](https://github.com/yunger7) as the canonical source for ENEM items.
- Mirror the repository metadata (commit hash/date) in each import log to preserve traceability.

## Data structure
- Normalize every question into a single JSON object with the following required fields: `id`, `year`, `discipline`, `statement`, `alternatives` (array of labeled choices), `answer_key` (matches alternative label), and `source_meta` (original file path plus upstream commit hash).
- Optional fields: `image_urls` (array), `difficulty`, and `tags` (array of domain-specific labels).
- Example (JSON Lines friendly):
  ```json
  {"id":"2023-001","year":2023,"discipline":"matematica","statement":"…","alternatives":[{"label":"A","text":"…"},{"label":"B","text":"…"}],"answer_key":"B","source_meta":{"path":"raw/2023/math/q1.json","upstream_commit":"<sha>"}}
  ```
- Persist normalized records in `data/enem-2023/normalized/enem-2023.jsonl`; keep raw files read-only in `data/enem-2023/raw/` for auditability.

## Documentation and audit trail
- Document the schema and field expectations in `products/educacao/app-quiz/courses/enem/2023/SCHEMA.md`, including any optional fields used for a specific import.
- Record every batch run in `logs/enem-2023-import.log` with: timestamp, upstream commit, batch range, counts (processed, imported, skipped), and a pointer to the corresponding checkpoint file.
- When a schema change occurs, append a short changelog entry to `products/educacao/app-quiz/courses/enem/2023/SCHEMA.md` explaining the rationale and the first batch where it applies.

## List building workflow
1. Clone or fetch the upstream repository into a local `data/enem-2023` workspace.
2. Enumerate question files (JSON/CSV) and register their paths in a manifest (`manifests/enem-2023.json`).
3. Validate that each entry includes: question ID, discipline, year, and answer key.

## Batched import tasks
- Process questions in batches of 50 to keep memory usage low.
- After each batch, write a checkpoint file to `manifests/checkpoints/enem-2023-batch-<n>.json`.
- Log successes/failures per batch and aggregate a summary in `logs/enem-2023-import.log`.

## Quality checks
- Ensure no duplicate question IDs across batches before finalizing the manifest.
- Run schema validation on every batch using the shared validator in `scripts/validate_enem.py`.
