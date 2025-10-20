# ReachInbox Backend Assignment

This project is a full implementation of the ReachInbox backend assignment, covering all six phases from real-time email synchronization to full containerization with Docker.

## Prerequisites

- Docker Desktop must be installed and running on your machine.

## How to Run the Project

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/BhuvaneshM11/reachinbox-assignment.git](https://github.com/BhuvaneshM11/reachinbox-assignment.git)
    cd reachinbox-assignment
    ```

2.  **Update Credentials:**
    Before running, you must add your email credentials in the `src/index.ts` file within the `imapConfig` object. It is highly recommended to use a dedicated test email account and an **App Password** for security.

3.  **Build the Docker Images:**
    This command builds the container images for the application server and the background worker.
    ```bash
    docker-compose build
    ```

4.  **Run the Entire Application Stack:**
    This single command will start all four services (app, worker, Elasticsearch, and Redis).
    ```bash
    docker-compose up
    ```
    The application will be running and available at `http://localhost:3000`.

## Project Features & API Endpoints

- **Real-time Email Sync:** The application connects to the configured IMAP server and syncs new emails automatically.
- **Real-time Frontend:** Open `http://localhost:3000` to see new emails appear instantly without reloading the page.
- **Search API (`GET /search`):** Searches the indexed emails.
  - **Example:** `http://localhost:3000/search?q=hello`
- **Task Queue API (`POST /send-email`):** Adds a job to a background queue.
  - **Example Body (JSON):**
    ```json
    {
      "from": "me@example.com",
      "to": "you@example.com",
      "subject": "Test Subject",
      "body": "This is a test email."
    }
    ```