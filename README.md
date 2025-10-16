# React Change Title Auth WP

This project is a React application integrated with WordPress for authentication and potentially other functionalities.

## Setup

1.  **Install Dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Environment Variables**

    Create a `.env.local` file in the root of the project with the following content:

    ```
    NEXT_PUBLIC_BASE_URL=http://localhost/simorq/wp-json
    ```

    Replace `http://localhost/simorq/wp-json` with the actual URL of your WordPress API.

3.  **Run the Development Server**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

-   `src/app`: Next.js application pages and layout.
-   `src/contexts`: React Contexts, e.g., for authentication.
-   `src/hooks`: Custom React hooks, e.g., for protected routes.
-   `src/lib`: Utility functions and API configurations.
-   `src/types`: TypeScript type definitions.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Runs the built application in production mode.
-   `npm run lint`: Runs ESLint to check for code quality issues.
