# Contributing

1. Read the README, architecture, and decision register before starting a feature.
2. Work on a focused branch such as `codex/results-submission` or `feature/teacher-portal`.
3. Agree on the database/API contract before splitting related frontend/backend work.
4. Keep migrations, implementation, meaningful tests, and documentation together.
5. Use synthetic fixtures only. Never put private school records or credentials in issues, screenshots, logs, or commits.
6. Check every permission using accounts with different roles, assignments, and ownership.
7. Submit a pull request explaining the user-visible behaviour, validation, and migration impact. The other collaborator reviews it.
8. Commit completed, verified changes in focused increments and push them to GitHub. Never force-push shared history casually.
9. Regenerate Mermaid SVGs and PDFs when their source changes, then run the documentation checker.
10. Deploy changes through staging and obtain school acceptance of affected policies before production release.

Assign one owner per task. Avoid simultaneously editing the same migration or workflow. Keep a weekly demonstration with school representatives and capture policy decisions in `docs/DECISIONS.md`.
