# Dietary App - Complete API Documentation

Base URL: `http://localhost:3000/api`

---

## 📋 Table of Contents

1. [General Concepts & Error Handling](#1-general-concepts--error-handling)
2. [Authentication](#2-authentication)
3. [User Profile](#3-user-profile)
4. [User Goals](#4-user-goals)
5. [Foods](#5-foods)
6. [Food Logs](#6-food-logs)
7. [AI Insights & Chatbot](#7-ai-insights--chatbot)

---

## 1. General Concepts & Error Handling

### Authentication Format

Most endpoints require a JWT token provided in the HTTP Header:
`Authorization: Bearer <your_jwt_access_token>`

### Standard Error Responses

The API uses standardized JSON error responses based on HTTP Status Codes:

- **`400 Bad Request`**: Validation errors, missing required fields.
  ```json
  { "message": "Email and password are required" }
  ```
- **`401 Unauthorized`**: Missing, invalid, expired JWT tokens, or incorrect password.
  ```json
  { "message": "Invalid email/password" }
  ```
  ```json
  { "message": "Invalid token" }
  ```
- **`403 Forbidden`**: Trying to access/modify resources owned by another user.
  ```json
  { "message": "Forbidden access" }
  ```
- **`404 Not Found`**: Resource ID does not exist in the database.
  ```json
  { "message": "Data not found" }
  ```
- **`429 Too Many Requests`**: Rate limiter blocks.
  ```json
  { "message": "Too many requests from this IP, please try again later" }
  ```
- **`500 Internal Server Error`**: Unexpected database or AI provider failures.
  ```json
  { "message": "Internal server error" }
  ```

---

## 2. Authentication

### `POST /auth/register`

Create a new user account.

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "email": "user@example.com"
  }
  ```
- **Error Responses:** `400` (Validation failed / Email must be unique).

### `POST /auth/login`

Authenticate user and receive a JWT token.

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```
- **Error Responses:** `401` (Invalid email/password).

### `POST /auth/google-login`

Login/Register via Google OAuth credential.

- **Request Header:** `google_token: eyJhb...` **OR Body:** `{ "google_token": "..." }`
- **Success Response (`200 OK`):** `{ "access_token": "..." }`
- **Error Responses:** `400` (Invalid Google token).

### `POST /auth/github-login`

Login/Register via GitHub OAuth Code.

- **Request Body:** `{ "code": "github_auth_code_123" }`
- **Success Response (`200 OK`):** `{ "access_token": "..." }`
- **Error Responses:** `400` (GitHub code required or failed to resolve code).

---

## 3. User Profile

**Requires Token**

### `GET /users/profile`

Get the current user's profile and biological information.

- **Success Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "weight": 70,
    "height": 175,
    "age": 25,
    "gender": "Male",
    "activityLevel": "Moderate"
  }
  ```

### `PATCH /users/profile`

Update biological profile for algorithmic calculations.

- **Request Body:**
  ```json
  {
    "weight": 75,
    "height": 175,
    "age": 25,
    "gender": "Male",
    "activityLevel": "Active"
  }
  ```
- **Success Response (`200 OK`):** Returns the full updated user object.
- **Error Responses:** `400` (Invalid enum for gender or activityLevel).

---

## 4. User Goals

**Requires Token**

### `GET /goals`

Get the user's active dietary goal.

- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "goalType": "cutting",
      "targetCalories": 1800
    }
  }
  ```
  _Note: `data` will be `null` if the user has never set a goal._

### `POST /goals`

Set or update the user's target manual goal.

- **Request Body:**
  ```json
  {
    "goalType": "bulking",
    "targetCalories": 2500
  }
  ```
- **Success Response (`200 OK`):** Returns the updated goal object.
- **Error Responses:** `400` (Missing fields).

---

## 5. Foods

**Requires Token**

### `GET /foods/search?q={query}&source={fatsecret}`

Search for food nutritional data. Automatically saves external searches into internal DB for caching.
_(Rate Limited: 20 requests per 10 seconds per IP)._

- **Query Params:**
  - `q` (required): Text search query e.g., `apple`.
  - `source` (optional): `fatsecret` to hit external provider instead of internal DB.
- **Success Response (`200 OK`):**
  ```json
  [
    {
      "id": 4,
      "name": "Apple",
      "calories": 95,
      "protein": 0.5,
      "fat": 0.3,
      "carbs": 25,
      "source": "fatsecret"
    }
  ]
  ```
- **Error Responses:** `400` (Query required), `429` (Rate limit exceeded), `500` (Third-party API down).

### `GET /foods/:id`

Get detailed nutritional data of a specific food by database ID.

- **Success Response (`200 OK`):** Food Object.
- **Error Responses:** `404` (Food not found).

### `POST /foods/detect`

Uses Google Gemini Vision AI to identify food from an uploaded image.

- **Request Headers:** `Content-Type: multipart/form-data`
- **Request Body:**
  - `image`: File (JPEG, PNG, WEBP) max 5MB.
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Based on the image, the food appears to be pepperoni pizza with approximately 285 calories per slice..."
  }
  ```
- **Error Responses:** `400` (No image uploaded, invalid file format), `500` (AI processing failed).

---

## 6. Food Logs

**Requires Token**

### `GET /logs`

Get all historical food logs of the user (descending order).

- **Success Response (`200 OK`):**
  ```json
  [
    {
      "id": 10,
      "quantity": 2,
      "mealType": "lunch",
      "consumedAt": "2026-03-24T05:00:00.000Z",
      "Food": { "name": "Apple", "calories": 95 }
    }
  ]
  ```

### `GET /logs/today`

Get logs specifically strictly for today's midnight up to current time.

- **Success Response (`200 OK`):** Array of logs similar to `/logs`.

### `POST /logs`

Add a food item to today's history.

- **Request Body:**
  ```json
  {
    "foodId": 4,
    "quantity": 1,
    "mealType": "breakfast"
  }
  ```
- **Success Response (`201 Created`):** Complete log record.
- **Error Responses:** `400` (Invalid foodId or negative quantity), `404` (FoodId doesn't exist).

### `DELETE /logs/:id`

Delete a specific food log.

- **Success Response (`200 OK`):** `{ "message": "Log deleted" }`
- **Error Responses:** `404` (Log not found), `403` (Forbidden, log belongs to another user).

---

## 7. AI Insights & Chatbot

**Requires Token**

### `GET /ai/insight`

Generates a daily contextual summary from Gemini AI based on today's logged food versus target goal.

- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "insight": "Great job! You are in a caloric deficit. Consider adding more protein tonight.",
      "status": "deficit",
      "caloriesConsumed": 1200,
      "caloriesTarget": 2000,
      "goalType": "cutting"
    },
    "meta": { "cached": false }
  }
  ```
  _Note: To prevent AI spamming, the result is cached per user per day. Re-fetching will return `meta.cached: true` unless a new log forces an update._
- **Soft Error Response (Incomplete Profile):** If the user doesn't have a weight/height configured, returns a fallback 200 OK demanding them to update profile.

### `GET /ai/insight/weekly`

Retrieves past 7 days of AI insights.

- **Success Response (`200 OK`):** Array of previous insights.

### `GET /ai/insight/export`

Generates a raw PDF Document stream containing a weekly dietary report.

- **Headers Expected in Response:**
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename=Dietary_Weekly_Report.pdf`
- **Success Response (`200 OK`):** Raw PDF byte stream.

### `POST /ai/chat` & Socket.io Streaming

Context-aware Chatbot for nutrition queries. Features real-time typing generation _(Socket.io)_.

1.  **Initialize Socket Connection (Client):**
    ```javascript
    const socket = io("http://localhost:3000");
    ```
2.  **Trigger AI Request (`POST /api/ai/chat`):**
    ```json
    {
      "message": "Is this too many carbs today?",
      "history": [
        { "role": "user", "text": "Hi" },
        { "role": "model", "text": "Hello!" }
      ],
      "socketId": "<socket_id_from_client>"
    }
    ```
3.  **Success HTTP Response (`200 OK`):** `{ "status": "success", "data": { "reply": "Streaming started..." } }`
4.  **Listen to Stream (Client):**
    The server will emit `chat-stream` events to the corresponding `socketId`:
    ```json
    { "text": "Yes, ", "isDone": false }
    { "text": "it is heavily ", "isDone": false }
    { "text": "carb-loaded.", "isDone": true }
    ```

- **Error Responses:** `400` (Message is required). AI processing errors will be quietly handled and logged by the server.
