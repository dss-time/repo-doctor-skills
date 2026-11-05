# Examples

User: "The CLI flag and return shape are implemented and tested. Sync affected README, examples, migration notes, and CHANGELOG; modify docs only."

Expected: search affected references, preserve document style, update only confirmed facts, and validate links and code blocks.

Non-trigger: "Fix the CLI implementation and update docs." Route production changes to `safe-fix-implementation` first.

## Concurrent edits in the same file
A user requests one confirmed parameter-name correction in a document containing preexisting edits. Recheck before writing. If the same region changed, reread and recompute the focused patch. Pause that file when both changes cannot safely be preserved; never overwrite it with a stale whole-file snapshot or revert user edits.
