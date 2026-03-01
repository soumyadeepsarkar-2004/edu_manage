# Contributing to EduManage

Thank you for your interest in contributing! All contributions — bug fixes, features, documentation, translations — are welcome and appreciated.

Please take a few minutes to read this guide before opening an issue or pull request.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](../CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards.

---

## How Can I Contribute?

### 🐛 Fix a Bug
Check the [Issues](https://github.com/tumansutradhar/edu-manage/issues) tab for open bugs. Issues labelled **`good first issue`** are a good place to start.

### ✨ Add a Feature
Look for issues labelled **`enhancement`** or **`help wanted`**, or open a new issue to discuss your idea before writing code.

### 📄 Improve Documentation
Typos, outdated examples, missing context — doc PRs are always welcome. No issue required for small fixes.

### 🧪 Write Tests
The project currently has no automated tests. Any Jest/Supertest or React Testing Library coverage is highly valued.

---

## Development Setup

See [docs/DEVELOPMENT.md](./DEVELOPMENT.md) for full local setup instructions.

Quick summary:

```bash
git clone https://github.com/YOUR_FORK/edu-manage.git
cd edu-manage
npm run install-all       # installs backend + frontend dependencies
# configure backend/.env (see docs/ENVIRONMENT.md)
npm run dev               # starts both servers concurrently
```

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. Direct pushes not allowed. |
| `feature/<name>` | New features or enhancements |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation-only changes |
| `refactor/<name>` | Code refactoring without behaviour change |
| `test/<name>` | Adding or updating tests |

Create your branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/my-feature
```

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification. This enables automated changelogs and semantic versioning.

**Format:**
```
<type>(<scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE or issue ref]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, whitespace (no logic change) |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates |

**Examples:**
```
feat(courses): add category filter to course list
fix(auth): handle expired JWT gracefully on refresh
docs(api): add pagination parameters to users endpoint
refactor(submissions): extract grading logic into service helper
```

---

## Pull Request Process

1. **Fork** the repository and create your branch from `main`.
2. **Follow the coding style** for the file you are editing (see below).
3. **Write or update tests** if your change affects application logic.
4. **Update documentation** if you are adding an endpoint, env var, or user-facing feature.
5. **Open the PR** against the `main` branch using the PR template.
6. **Address review feedback** — a maintainer will review within a few days.

### PR Checklist

- [ ] My branch is up to date with `main`
- [ ] I have described what and why in the PR description
- [ ] I have tested my changes locally (`npm run dev`)
- [ ] I have added/updated docs where appropriate
- [ ] No secrets or credentials are in the diff

---

## Style Guides

### JavaScript (Backend)

- CommonJS modules (`require` / `module.exports`)
- `async/await` for all async operations
- `express-validator` for input validation on all POST/PUT routes
- Route files export a single Express `Router`
- Error responses always return `{ message: "..." }`

### React (Frontend)

- Functional components with hooks only (no class components)
- One component per file; file name matches component name
- Tailwind CSS for all styling (no inline styles, no CSS modules)
- `useEffect` cleanup for any subscriptions or timers
- Axios via the shared `axios` instance in `AuthContext.js` (don't create new instances)

### Naming

| Thing | Convention | Example |
|---|---|---|
| Files (React) | PascalCase | `CourseDetail.js` |
| Files (Node) | camelCase | `courseHelpers.js` |
| Variables / functions | camelCase | `fetchCourseData` |
| Constants | UPPER_SNAKE | `MAX_FILE_SIZE` |
| MongoDB models | PascalCase | `Course`, `User` |
| API routes | kebab-case | `/api/course-materials` |

---

## Reporting Bugs

Use the **[Bug Report template](https://github.com/tumansutradhar/edu-manage/issues/new?template=bug_report.md)** and include:

1. What you were trying to do
2. What you expected to happen
3. What actually happened (include error messages and screenshots)
4. Steps to reproduce
5. Your environment (OS, Node version, browser)

---

## Requesting Features

Use the **[Feature Request template](https://github.com/tumansutradhar/edu-manage/issues/new?template=feature_request.md)** and include:

1. The problem or gap you are experiencing
2. Your proposed solution
3. Alternatives you considered
4. Who would benefit from this

---

## Questions?

If you are unsure about anything, feel free to open a [Discussion](https://github.com/tumansutradhar/edu-manage/discussions) or reach out via email at `connect.tuman@gmail.com`.
