# Contributing to Mercenary Backend

First off, thanks for taking the time to contribute! :tada: :+1:

The following is a set of guidelines for contributing to Mercenary Backend. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact@mercenary.example.com](mailto:contact@mercenary.example.com).

## How Can I Contribute?

### Reporting Bugs

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/yourusername/mercenary/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/yourusername/mercenary/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

- Use the GitHub issue tracker to submit enhancement suggestions
- Clearly describe the enhancement you are suggesting
- Explain why this enhancement would be useful
- Include any relevant code, screenshots, or mockups

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Setting Up the Development Environment

### Prerequisites

- Python 3.9 or higher
- PostgreSQL 13 or higher
- Redis (for caching and task queue)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mercenary.git
   cd mercenary/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

4. Set up pre-commit hooks:
   ```bash
   pre-commit install
   ```

5. Create a `.env` file based on `.env.example` and update the values as needed.

6. Set up the database:
   ```bash
   alembic upgrade head
   python -m app.initial_data
   ```

### Running the Application

- Development server:
  ```bash
  uvicorn app.main:app --reload
  ```

- Production server:
  ```bash
  gunicorn --worker-class uvicorn.workers.UvicornWorker --workers 4 --bind 0.0.0.0:8000 app.main:app
  ```

### Running Tests

```bash
pytest
```

### Code Style

- We use `black` for code formatting and `isort` for import sorting.
- Run `make format` to automatically format your code.
- Run `make lint` to check for style issues.

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages. This allows us to automatically generate changelogs and determine semantic version bumps.

### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

### Revert

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

Must be one of the following:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Scope

The scope could be anything specifying the place of the commit change. For example `users`, `auth`, `projects`, etc.

### Subject

The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize the first letter
- no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

### Examples

```
feat(auth): add password reset functionality

Add password reset functionality using JWT tokens sent via email.

Closes #123
```

```
fix(api): prevent race condition in user registration

Add a unique constraint to the email column to prevent race conditions during user registration.

Fixes #456
```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent. The versioning scheme we use is [SemVer](http://semver.org/).
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## Code Review Process

1. A pull request must be approved by at least one core team member before it can be merged.
2. All code must be reviewed by at least one other developer.
3. All code must pass the CI pipeline before it can be merged.
4. All code must be properly tested.
5. All code must follow the project's coding standards.

## Community

- [Join our Discord server](https://discord.gg/mercenary)
- Follow us on [Twitter](https://twitter.com/mercenaryapp)
- Read our [blog](https://blog.mercenary.example.com)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
