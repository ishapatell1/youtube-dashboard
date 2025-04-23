# API Documentation

## Authentication

### 1. `/auth/google` 
- **Method**: `GET`
- **Description**: Redirects to Google for OAuth authentication.
- **Authentication**: No authentication required.
- **Response**:
  - Redirects to Google login page.

### 2. `/auth/google/callback`
- **Method**: `GET`
- **Description**: Google OAuth callback to save tokens.
- **Authentication**: No authentication required.
- **Response**:
  - `200 OK`: User successfully authenticated and tokens saved.
  - `500 Internal Server Error`: Failed to save tokens.

## Comments

### 3. `/comments`
- **Method**: `GET`
- **Description**: Fetches comments for a given YouTube video.
- **Authentication**: Requires Google OAuth tokens.
- **Query Parameters**:
  - `videoId`: The ID of the YouTube video for which to fetch comments.
- **Response**:
  - `200 OK`: An array of comments for the video.
  - `401 Unauthorized`: User is not logged in.

### 4. `/comments`
- **Method**: `POST`
- **Description**: Posts a comment on a YouTube video.
- **Authentication**: Requires Google OAuth tokens.
- **Request Body**:
  - `videoId`: The ID of the YouTube video.
  - `commentText`: The text of the comment.
- **Response**:
  - `200 OK`: The comment was successfully posted.
  - `401 Unauthorized`: User is not logged in.
  - `400 Bad Request`: Missing required parameters.

### 5. `/comments/:commentId`
- **Method**: `DELETE`
- **Description**: Deletes a comment by ID.
- **Authentication**: Requires Google OAuth tokens.
- **Params**:
  - `commentId`: The ID of the comment to delete.
- **Response**:
  - `200 OK`: The comment was successfully deleted.
  - `401 Unauthorized`: User is not logged in.
  - `500 Internal Server Error`: Failed to delete comment.

## Notes

### 6. `/notes`
- **Method**: `POST`
- **Description**: Save a note for a specific video.
- **Authentication**: Requires user login.
- **Request Body**:
  - `videoId`: The ID of the YouTube video.
  - `text`: The note content.
- **Response**:
  - `201 Created`: The note was successfully saved.
  - `400 Bad Request`: Missing required parameters.
  - `500 Internal Server Error`: Failed to save note.

### 7. `/notes/:videoId`
- **Method**: `GET`
- **Description**: Get all notes for a specific video.
- **Authentication**: Requires user login.
- **Params**:
  - `videoId`: The ID of the video for which to fetch notes.
- **Response**:
  - `200 OK`: An array of notes for the video.
  - `500 Internal Server Error`: Failed to fetch notes.
