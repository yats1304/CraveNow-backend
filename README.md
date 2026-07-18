# CraveNow Backend Service

Production-grade backend system for the CraveNow food delivery application.

## GitHub Actions CI/CD Pipeline

This project includes a professional GitHub Actions automated pipeline split into three focused workflows:

### 1. Continuous Integration (CI) Workflow
- **File**: [.github/workflows/ci.yml](file:///c:/Users/Pratiksha/Desktop/CraveNow/services/.github/workflows/ci.yml)
- **Triggers**: Executed on every `push` and `pull_request` to the `main` and `develop` branches.
- **How it works**:
  1. Clones the repository.
  2. Sets up Node.js (v22) and configures dependency caching for faster execution times.
  3. Installs project dependencies cleanly using `npm ci`.
  4. Runs ESLint to check for code quality and syntax standards.
  5. Compiles TypeScript code using `npx tsc`.
  6. Verifies that the compiled build file (`dist/server.js`) was generated successfully.
  7. Uploads the build artifact (`dist/` directory) for downstream jobs and inspection.

### 2. Docker Build Workflow
- **File**: [.github/workflows/docker.yml](file:///c:/Users/Pratiksha/Desktop/CraveNow/services/.github/workflows/docker.yml)
- **Triggers**: Executed automatically upon the successful completion of the **CI** workflow on `main` and `develop` branches.
- **How it works**:
  1. Checks out the repository.
  2. Sets up Docker Buildx for enhanced build features and caching.
  3. Builds the Docker image based on the root `Dockerfile` (using multi-stage caching to optimize the build).
  4. Verifies the Docker image compilation completes correctly and registers in the local daemon.
  5. The workflow is pre-configured and commented out to support immediate transition to publishing to Docker Hub or GitHub Container Registry (GHCR) when deploy keys are ready.

### 3. Security Audit Workflow
- **File**: [.github/workflows/security.yml](file:///c:/Users/Pratiksha/Desktop/CraveNow/services/.github/workflows/security.yml)
- **Triggers**: Executed on every `push` and `pull_request` to `main` and `develop`, and runs automatically once a week on a **cron schedule (Monday at 06:00 UTC)**.
- **How it works**:
  1. Checks out the repository and sets up Node.js.
  2. Installs dependencies and runs `npm audit --audit-level=high`.
  3. The workflow only fails if **high** or **critical** vulnerabilities are discovered in project dependencies (low and moderate issues are ignored to prevent blocking development).
  4. Generates a detailed JSON vulnerability report and a Markdown summary, then uploads them as build artifacts (retained for 30 days) for review.
