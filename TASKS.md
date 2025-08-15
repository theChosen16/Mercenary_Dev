# Tasks for Jules (Async Development Agent)

This file contains a list of tasks suitable for Jules to work on asynchronously. Based on its capabilities, these tasks are focused on bug fixes, small feature requests, and other self-contained software engineering work.

## Bug Fixes

- **Issue #241: User profile picture not updating**
  - **Description:** When a user uploads a new profile picture, the old one is still displayed until they log out and log back in. The frontend cache needs to be invalidated correctly.
  - **Acceptance Criteria:** The new profile picture is displayed immediately after a successful upload without requiring a new login.

- **Issue #255: API endpoint `/api/v1/items/{id}` returns 500 error for invalid IDs**
  - **Description:** The endpoint should return a 404 Not Found error when an item with the specified ID does not exist, but it's currently throwing a 500 Internal Server Error.
  - **Acceptance Criteria:** A `GET` request to `/api/v1/items/{invalid_id}` returns a `404` status code with a clear error message.

## Small Feature Requests

- **Feature: Add 'Created At' and 'Updated At' timestamps to the item detail view**
  - **Description:** The UI for viewing a single item should display when the item was created and when it was last updated. These fields are already available in the backend API response.
  - **Acceptance Criteria:** The item detail page shows "Created: [timestamp]" and "Last Updated: [timestamp]".

- **Feature: Implement a basic search filter on the user list page**
  - **Description:** Add a search input field on the user list page that filters users by their name or email in real-time (or with a button click).
  - **Acceptance Criteria:** Typing in the search box filters the displayed list of users based on the input.

## Tasks for web-informative

- **Task: Correct Technology Stack Inconsistencies**
  - **Description:** The `index.html` file for the informational website mentions both `SQLAlchemy` and `Prisma ORM`. The project uses `Prisma ORM`. This task is to remove the mention of `SQLAlchemy` and ensure `Prisma ORM` is listed consistently.
  - **Acceptance Criteria:** The `web-informative/index.html` file should only mention `Prisma ORM`.

- **Task: Resolve Payment Provider Contradiction**
  - **Description:** The site mentions both `Stripe` and `MercadoPago`. The project has standardized on `MercadoPago`. This task is to remove all mentions of `Stripe` and replace them with `MercadoPago` where appropriate.
  - **Acceptance Criteria:** All references to payment providers in `web-informative/index.html` should be for `MercadoPago`.

- **Task: Implement 'Ver Demo' Button Functionality**
  - **Description:** The 'Ver Demo' button in the hero section is currently a non-functional `<button>`. This task is to convert it into a functional link.
  - **Acceptance Criteria:** The button should be an `<a>` tag pointing to a placeholder URL like `https://www.youtube.com/watch?v=placeholder` and open in a new tab.

- **Task: Improve Image Accessibility**
  - **Description:** The technology logos in `index.html` are missing descriptive `alt` attributes, which is bad for SEO and accessibility.
  - **Acceptance Criteria:** All `<img>` tags for technology logos must have descriptive alt text (e.g., `alt="Flutter Logo"`).

- **Task: Update Website Content to Current Year**
  - **Description:** The website content refers to the year 2025 for its launch and project status. This should be updated to the current year to reflect that the project is active.
  - **Acceptance Criteria:** All mentions of the year 2025 in `web-informative/index.html` should be updated to the current year.

## Other Software Engineering Tasks

- **Refactor: Improve configuration handling**
  - **Description:** The database connection string is currently hardcoded in `backend/app/db.py`. Refactor this to read the connection string from environment variables using a settings management library like Pydantic's `BaseSettings`.
  - **Acceptance Criteria:** The database connection is configured via environment variables, and the `README.md` is updated to document the required variables.

- **Testing: Increase test coverage for `auth` service**
  - **Description:** The `backend/app/services/auth.py` module has low test coverage. Add unit tests to cover the main logic for token creation and validation, aiming for at least 80% coverage for that file.
  - **Acceptance Criteria:** New unit tests are added, and code coverage for `auth.py` meets or exceeds 80%.
