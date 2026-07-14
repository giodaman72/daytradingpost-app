# Contributing to DayTradingPost

## Local setup

Use Node.js 24, as pinned in `.nvmrc`:

```bash
nvm use
npm ci
```

Use `npm ci` when reproducing CI or installing from the committed lockfile. Use `npm install` only when intentionally changing dependencies.

## Branches and commits

Create a focused branch from the agreed base. Prefer names such as `feat/market-alerts`, `fix/auth-redirect`, or the assigned sprint branch.

Commit messages follow Conventional Commits:

```text
feat(dashboard): add market outlook widget
fix(auth): preserve session during redirect
docs: update deployment guide
```

Supported types are `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, and `revert`.

## Quality checks

Before pushing, run:

```bash
npm run check
```

Husky installs during `npm install`/`npm ci`. The pre-commit hook runs Prettier and safe ESLint fixes only on staged files. The commit-message hook validates Conventional Commits. Neither hook runs the full build.

## Pull requests

Open a pull request into `main`, complete the template, link the relevant issue, and describe the validation performed. Include screenshots for UI changes and review responsive behavior when applicable. Address review conversations and keep required CI checks green before merging.

Never commit `.env.local`, service-role keys, tokens, webhook secrets, personal data, or payment data. Sanitize logs and screenshots before adding them to issues or pull requests.
