# NEXORA DataHub Service

The `datahub-service` is a central microservice responsible for managing the storage, versioning, and retrieval of all document artifacts generated within the NEXORA platform, such as ETPs and TRs. It also provides a powerful semantic search capability to find relevant documents based on their content, not just their metadata.

## Core Features

-   **Artifact Storage:** Securely stores and versions all document artifacts.
-   **Metadata Management:** Tracks key metadata for each artifact, including the associated process, document type, and creator.
-   **Semantic Search:** Uses a vector database (Milvus) to provide intelligent search over the content of the stored artifacts.
-   **Asynchronous Processing:** Offloads heavy tasks like text extraction and embedding generation to a Celery worker to ensure fast API response times.

## API Documentation

### Artifacts

#### `POST /api/v1/artifacts/`

Uploads a new artifact and creates its first version.

-   **Request Body:**
    -   `process_id` (string): The ID of the process this artifact belongs to.
    -   `doc_type` (string): The type of document (e.g., "ETP", "TR").
    -   `created_by` (string): The ID of the user creating the artifact.
    -   `file` (file): The artifact file to upload.
-   **Response:** `200 OK` with the created `Artifact` object.

#### `POST /api/v1/artifacts/{artifact_id}/versions`

Uploads a new version of an existing artifact.

-   **Path Parameters:**
    -   `artifact_id` (UUID): The ID of the artifact to version.
-   **Request Body:**
    -   `file` (file): The new version of the artifact file.
-   **Response:** `200 OK` with the created `ArtifactVersion` object.

#### `GET /api/v1/artifacts/{artifact_id}`

Retrieves the metadata for an artifact, including all its versions.

-   **Path Parameters:**
    -   `artifact_id` (UUID): The ID of the artifact to retrieve.
-   **Response:** `200 OK` with the `Artifact` object.

#### `GET /api/v1/artifacts/{artifact_id}/versions/{version_num}`

Retrieves the metadata for a specific version of an artifact.

-   **Path Parameters:**
    -   `artifact_id` (UUID): The ID of the artifact.
    -   `version_num` (integer): The version number to retrieve.
-   **Response:** `200 OK` with the `ArtifactVersion` object.

#### `GET /api/v1/artifacts/{artifact_id}/versions/{version_num}/download`

Downloads the actual file for a specific version of an artifact.

-   **Path Parameters:**
    -   `artifact_id` (UUID): The ID of the artifact.
    -   `version_num` (integer): The version number to download.
-   **Response:** `200 OK` with the file content.

### Search

#### `GET /api/v1/search/`

Performs a semantic search for artifacts based on a text query.

-   **Query Parameters:**
    -   `q` (string): The text query to search for.
-   **Response:** `200 OK` with a list of search results, including the `artifact_version_id` and a similarity `score`.
