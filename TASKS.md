# Mercenary_Dev Task List

This document outlines the development tasks for the Mercenary_Dev project, categorized by application. Each task includes a detailed description, step-by-step procedures, and clear acceptance criteria.

---

## Informational Website (`web-informative`)

Tasks related to the static informational website, focused on content, accessibility, and consistency.

### 1. Correct Technology Stack Inconsistencies
- **Description**: The `index.html` file incorrectly lists `SQLAlchemy` as a technology. The project exclusively uses `Prisma ORM`. This task is to remove the incorrect reference.
- **Procedure**:
  1. Open `web-informative/index.html`.
  2. Search for the term `SQLAlchemy`.
  3. Remove the logo and any text mentioning `SQLAlchemy`.
  4. Ensure `Prisma ORM` is correctly and prominently displayed as the ORM.
- **Acceptance Criteria**: The `web-informative/index.html` file must not contain any references to `SQLAlchemy`.

### 2. Standardize on a Single Payment Provider
- **Description**: The website mentions both `Stripe` and `MercadoPago`. The official payment provider is `MercadoPago`. All mentions of `Stripe` must be removed.
- **Procedure**:
  1. In `web-informative/index.html`, search for all occurrences of `Stripe`.
  2. Replace any mention or logo with `MercadoPago`.
- **Acceptance Criteria**: The informational site must exclusively reference `MercadoPago` as the payment provider.

### 3. Activate the 'Ver Demo' Button
- **Description**: The 'Ver Demo' button in the hero section is a non-functional `<button>` element. It needs to be converted into a hyperlink that opens a demo video in a new tab.
- **Procedure**:
  1. Locate the `<button>` element for 'Ver Demo' in `index.html`.
  2. Convert it to an `<a>` tag with `target="_blank"` and `rel="noopener noreferrer"`.
  3. Set the `href` attribute to a placeholder video URL, such as `https://www.youtube.com/watch?v=dQw4w9WgXcQ`.
- **Acceptance Criteria**: Clicking the 'Ver Demo' button opens the specified URL in a new browser tab.

### 4. Enhance Image Accessibility
- **Description**: The technology logos are missing descriptive `alt` attributes, which harms SEO and accessibility for screen readers.
- **Procedure**:
  1. Review all `<img>` tags within `web-informative/index.html`.
  2. Add a descriptive `alt` attribute to each image (e.g., `alt="Prisma ORM Logo"`).
- **Acceptance Criteria**: Every `<img>` tag for a technology logo must have a non-empty and descriptive `alt` attribute.

### 5. Update Content to the Current Year
- **Description**: The website text refers to the year 2025. This must be updated to the current year to reflect the project's active status.
- **Procedure**:
  1. Search for all instances of the year `2025` in `web-informative/index.html`.
  2. Replace them with the current year.
- **Acceptance Criteria**: The website content should reflect the current year, not 2025.

---

## Web App (Backend & Frontend)

Tasks related to the main web application, including API, database, and user interface.

### 1. Fix Profile Picture Cache Invalidation (Issue #241)
- **Description**: A user's profile picture does not update in the UI until they log out and back in. This indicates a frontend caching issue.
- **Procedure**:
  1. **Frontend**: After a successful image upload, implement a cache-busting mechanism. A common technique is to append a meaningless query parameter to the image URL (e.g., `profile.jpg?t=<timestamp>`).
  2. **Frontend**: Ensure the application state (e.g., in React Context or Redux) is updated immediately with the new image URL.
- **Acceptance Criteria**: The new profile picture is displayed instantly after upload without requiring a page reload or new login.

### 2. Correct API Error Handling for Invalid IDs (Issue #255)
- **Description**: The endpoint `/api/v1/items/{id}` returns a `500 Internal Server Error` for non-existent IDs instead of a `404 Not Found`.
- **Procedure**:
  1. **Backend**: In the controller/handler for this endpoint, add a check to see if the item was found in the database.
  2. If the item is `null` or `undefined`, return a `404` status code with a JSON error message like `{ "error": "Item not found" }`.
- **Acceptance Criteria**: A `GET` request to `/api/v1/items/{invalid_id}` returns a `404` status code.

### 3. Display Item Timestamps in UI
- **Description**: The item detail view should show the 'Created At' and 'Updated At' timestamps, which are already provided by the backend.
- **Procedure**:
  1. **Frontend**: In the component responsible for the item detail view, access the `createdAt` and `updatedAt` fields from the API response.
  2. Display these values in a user-friendly format (e.g., using a library like `date-fns` or `moment.js`).
- **Acceptance Criteria**: The item detail page clearly displays formatted creation and update timestamps.

### 4. Implement User Search Filter
- **Description**: Add a search bar to the user list page to filter users by name or email.
- **Procedure**:
  1. **Frontend**: Add an `<input type="text">` field to the user list component.
  2. Create a state variable to hold the search query.
  3. Filter the list of users based on the search query before rendering. The filtering logic should be case-insensitive and check against both user name and email.
- **Acceptance Criteria**: Typing in the search box dynamically filters the user list.

### 5. Refactor Configuration Handling
- **Description**: The database connection string is hardcoded. It should be moved to environment variables for better security and flexibility.
- **Procedure**:
  1. **Backend**: Integrate a settings management library like `pydantic-settings`.
  2. Define a settings class that reads `DATABASE_URL` from environment variables.
  3. Replace the hardcoded string in `backend/app/db.py` with the value from the settings object.
  4. Update `README.md` to document the new `DATABASE_URL` environment variable.
- **Acceptance Criteria**: The application retrieves the database connection string from environment variables.

### 6. Increase Auth Service Test Coverage
- **Description**: The `backend/app/services/auth.py` module has low test coverage. More tests are needed to ensure reliability.
- **Procedure**:
  1. **Backend**: Identify untested functions or code paths in `auth.py`.
  2. Write new unit tests for token creation, validation (including expired and invalid tokens), and any other core logic.
  3. Run a coverage report to verify the new coverage percentage.
- **Acceptance Criteria**: Code coverage for `auth.py` is at least 80%.

---

## Mobile App (`app-movil`)

Tasks related to the native mobile application.

- *(No tasks assigned yet. This section is ready for future mobile development work.)*
