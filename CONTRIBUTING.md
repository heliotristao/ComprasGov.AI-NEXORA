# Contributing

## Running E2E Tests

To run the E2E tests locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Install Playwright browsers:**
    ```bash
    npx playwright install --with-deps
    ```
3.  **Run the tests:**
    ```bash
    npm run test:e2e
    ```

## Pull Request Workflow

When you open a pull request, a series of automated checks will run to ensure the quality of the code. These checks include linting, unit tests, and end-to-end tests.

Additionally, a preview deployment will be automatically generated for each pull request that modifies the frontend. A link to the preview deployment will be posted as a comment on the pull request, allowing for visual review of the changes.

All status checks must pass before a pull request can be merged.
