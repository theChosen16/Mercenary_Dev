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

## Other Software Engineering Tasks

- **Refactor: Improve configuration handling**
  - **Description:** The database connection string is currently hardcoded in `backend/app/db.py`. Refactor this to read the connection string from environment variables using a settings management library like Pydantic's `BaseSettings`.
  - **Acceptance Criteria:** The database connection is configured via environment variables, and the `README.md` is updated to document the required variables.

- **Testing: Increase test coverage for `auth` service**
  - **Description:** The `backend/app/services/auth.py` module has low test coverage. Add unit tests to cover the main logic for token creation and validation, aiming for at least 80% coverage for that file.
  - **Acceptance Criteria:** New unit tests are added, and code coverage for `auth.py` meets or exceeds 80%.
