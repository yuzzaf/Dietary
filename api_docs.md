# 🥗 Dietary App — RESTful API & WebSocket Documentation

**Base URL**: `http://localhost:3000/api`  
**Production URL**: `https://api.muhammadyuzzaf.com/api` (or custom host)  
**WebSocket URL**: `ws://localhost:3000`  
**API Version**: `1.0.0`

---

## 📑 Table of Contents

1. [Architecture & Design Principles](#1-architecture--design-principles)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Standard Response Envelope & Error Codes](#3-standard-response-envelope--error-codes)
4. [Health Check](#4-health-check)
5. [Authentication Endpoints (`/auth`)](#5-authentication-endpoints-auth)
6. [User Profile Endpoints (`/users`)](#6-user-profile-endpoints-users)
7. [Dietary Goals Endpoints (`/goals`)](#7-dietary-goals-endpoints-goals)
8. [Foods Endpoints (`/foods`)](#8-foods-endpoints-foods)
9. [Food Logs Endpoints (`/logs`)](#9-food-logs-endpoints-logs)
10. [AI Insights & Chatbot Endpoints (`/ai`)](#10-ai-insights--chatbot-endpoints-ai)
11. [Real-time Socket.io Streaming Protocol](#11-real-time-socketio-streaming-protocol)

---

## 1. Architecture & Design Principles

The Dietary API is structured with the following patterns:
- **Stateless RESTful Design**: All user-specific requests authenticate via JWT Bearer tokens.
- **Consistent Response Envelopes**: Success responses use `{ status: "success", data: ..., meta: ... }` for structured data consistency.
- **Real-Time Duplexing**: Streaming AI responses rely on WebSocket (Socket.io) rooms targeted by client socket ID.
- **Multi-Tier Caching & AI Cascades**: Gemini AI calls implement an automated 3-tier model fallback (`gemini-2.5-flash-lite` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite`) to safeguard against quota spikes. External food searches cache transparently into the PostgreSQL database.

---

## 2. Authentication & Authorization

All protected endpoints require a valid JSON Web Token (JWT) sent via HTTP header:

```http
Authorization: Bearer <your_jwt_access_token>
```

Tokens are issued upon successful registration or login (`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google-login`, `POST /api/auth/github-login`).

---

## 3. Standard Response Envelope & Error Codes

### Standard Success Response
```json
{
  "status": "success",
  "data": { ... },
  "meta": { ... }
}
```

### Standard Error Response
```json
{
  "message": "Specific error explanation"
}
```

### HTTP Status Code Reference
| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | OK | Request succeeded. |
| `201` | Created | Resource successfully created. |
| `400` | Bad Request | Validation failure, missing required fields, or invalid payload. |
| `401` | Unauthorized | Missing, invalid, or expired JWT token. |
| `403` | Forbidden | Attempted access or modification of a resource owned by another user. |
| `404` | Not Found | Requested entity ID does not exist. |
| `429` | Too Many Requests | Rate limit threshold exceeded (e.g., search spam protection). |
| `500` | Internal Server Error | Unhandled server error or external provider failure. |

---

## 4. Health Check

### `GET /`
Verifies server availability.

- **Access**: Public
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "API is ready!"
  }
  ```

---

## 5. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Creates a new user profile with encrypted credentials.

- **Access**: Public
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
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
- **Error Responses:**
  - `400 Bad Request`: Validation error (e.g., `Email is required`, `Email already registered`).

---

### `POST /auth/login`
Authenticates a user via email and password, returning an access token.

- **Access**: Public
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Email and password are required`
  - `401 Unauthorized`: `Invalid email/password`

---

### `POST /auth/google-login`
Authenticates or registers a user via Google OAuth ID token.

- **Access**: Public
- **Request Header or Body:**
  - Header: `google_token: <google_id_token>`
  - OR Body: `{ "google_token": "<google_id_token>" }`
- **Success Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Invalid Google token`

---

### `POST /auth/github-login`
Exchanges a GitHub OAuth authorization code for a platform JWT access token.

- **Access**: Public
- **Request Body:**
  ```json
  {
    "code": "78a9c2e0f4381bc9d4"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `GitHub code is required` or OAuth exchange failure.

---

### `POST /auth/forgot-password`
Dispatches a secure 1-hour password reset token link to the user's email via Nodemailer.

- **Access**: Public
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "If that email is registered, a reset link has been sent."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Email required`

---

### `POST /auth/reset-password`
Resets the user's password using the token sent via email.

- **Access**: Public
- **Request Body:**
  ```json
  {
    "token": "a1b2c3d4e5f6...",
    "newPassword": "NewStrongPassword456!"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Password has been successfully reset"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Token and new password required` or `Invalid or expired password reset token`

---

## 6. User Profile Endpoints (`/users`)

### `GET /users/profile`
Fetches the authenticated user's profile and biological biometric parameters.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": "https://res.cloudinary.com/.../profile.jpg",
    "weight": 72.5,
    "height": 178,
    "age": 26,
    "gender": "male",
    "activityLevel": "moderate",
    "createdAt": "2026-03-01T10:00:00.000Z",
    "updatedAt": "2026-03-24T12:00:00.000Z"
  }
  ```

---

### `PATCH /users/profile`
Updates the user's biological biometric values used for caloric expenditure calculations (Harris-Benedict / Mifflin-St Jeor).

- **Access**: Protected (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "weight": 70.0,
    "height": 178,
    "age": 26,
    "gender": "male",
    "activityLevel": "active"
  }
  ```
  *Allowed values*:
  - `gender`: `"male"` | `"female"`
  - `activityLevel`: `"sedentary"` | `"light"` | `"moderate"` | `"active"` | `"very_active"`
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Profile updated",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "weight": 70,
      "height": 178,
      "age": 26,
      "gender": "male",
      "activityLevel": "active"
    }
  }
  ```

---

### `PATCH /users/profile-picture`
Uploads and updates the user's avatar image via Cloudinary CDN.

- **Access**: Protected (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `image`: File (JPEG, PNG, WEBP, max 5MB)
- **Success Response (`200 OK`):**
  ```json
  {
    "message": "Profile picture updated",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v12345/profile_pictures/avatar.jpg"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Image is required`

---

## 7. Dietary Goals Endpoints (`/goals`)

### `GET /goals`
Retrieves the user's current dietary goal.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "userId": 1,
      "goalType": "cutting",
      "targetCalories": 1850,
      "createdAt": "2026-03-10T08:00:00.000Z",
      "updatedAt": "2026-03-20T14:30:00.000Z"
    },
    "meta": null
  }
  ```
  *Note: If no goal has been configured, `data` is `null`.*

---

### `POST /goals`
Creates or updates (upserts) the user's calorie and dietary target.

- **Access**: Protected (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "goalType": "bulking",
    "targetCalories": 2600
  }
  ```
  *Allowed `goalType`*: `"cutting"` | `"maintaining"` | `"bulking"`
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "userId": 1,
      "goalType": "bulking",
      "targetCalories": 2600,
      "updatedAt": "2026-03-24T15:00:00.000Z"
    },
    "meta": null
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `goalType and targetCalories are required`

---

## 8. Foods Endpoints (`/foods`)

### `GET /foods/search?q={query}`
Searches food nutrition details. Searches the internal database cache first; if empty or requested, queries the external **FatSecret Platform API** and caches results automatically.

- **Access**: Public
- **Rate Limit**: 20 requests per 10 seconds per IP
- **Query Parameters:**
  - `q` (required): Food search term (e.g., `chicken breast`, `banana`).
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "total": 2,
      "options": [
        {
          "id": 12,
          "name": "Chicken Breast",
          "calories": 165,
          "protein": 31.0,
          "fat": 3.6,
          "carbs": 0.0,
          "source": "fatsecret"
        },
        {
          "id": 13,
          "name": "Grilled Chicken Breast",
          "calories": 151,
          "protein": 30.5,
          "fat": 3.2,
          "carbs": 0.0,
          "source": "fatsecret"
        }
      ]
    },
    "meta": null
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Query is required`
  - `429 Too Many Requests`: `Too many requests from this IP, please try again later`

---

### `GET /foods/:id`
Retrieves detailed macronutrient metrics of a specific food item by database ID.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 12,
      "name": "Chicken Breast",
      "calories": 165,
      "protein": 31.0,
      "fat": 3.6,
      "carbs": 0.0,
      "source": "fatsecret"
    },
    "meta": null
  }
  ```
- **Error Responses:**
  - `404 Not Found`: `Food not found`

---

### `POST /foods/detect`
Visual AI recognition powered by Google Gemini Vision. Identifies the food from an uploaded image buffer and returns verified nutritional data.

- **Access**: Public
- **Content-Type**: `multipart/form-data`
- **Request Body:**
  - `image`: File (JPEG, PNG, WEBP, max 5MB)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 45,
      "name": "Nasi Goreng",
      "calories": 380,
      "protein": 12.5,
      "fat": 14.0,
      "carbs": 52.0,
      "source": "gemini"
    },
    "meta": {
      "ai": "gemini",
      "cached": false
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Image is required`

---

## 9. Food Logs Endpoints (`/logs`)

### `GET /logs`
Retrieves the full historical log of consumed foods for the authenticated user in descending order.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 104,
        "userId": 1,
        "foodId": 12,
        "quantity": 1.5,
        "mealType": "lunch",
        "consumedAt": "2026-03-24T12:30:00.000Z",
        "Food": {
          "id": 12,
          "name": "Chicken Breast",
          "calories": 165,
          "protein": 31.0,
          "fat": 3.6,
          "carbs": 0.0
        }
      }
    ],
    "meta": {
      "total": 1
    }
  }
  ```

---

### `GET /logs/today`
Retrieves meal logs logged today (from midnight local server time to present) and aggregates total calories consumed.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "logs": [
        {
          "id": 104,
          "userId": 1,
          "foodId": 12,
          "quantity": 2,
          "mealType": "lunch",
          "consumedAt": "2026-03-24T12:30:00.000Z",
          "Food": {
            "name": "Chicken Breast",
            "calories": 165
          }
        }
      ],
      "totalCalories": 330
    },
    "meta": {
      "total": 1
    }
  }
  ```

---

### `POST /logs`
Logs a food item into today's diary.

- **Access**: Protected (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "foodId": 12,
    "quantity": 2,
    "mealType": "lunch"
  }
  ```
  *Allowed `mealType`*: `"breakfast"` | `"lunch"` | `"dinner"` | `"snack"`
- **Success Response (`201 Created`):**
  ```json
  {
    "status": "success",
    "data": {
      "id": 105,
      "userId": 1,
      "foodId": 12,
      "quantity": 2,
      "mealType": "lunch",
      "consumedAt": "2026-03-24T12:45:00.000Z",
      "Food": {
        "id": 12,
        "name": "Chicken Breast",
        "calories": 165
      }
    },
    "meta": null
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `Invalid foodId or quantity`
  - `404 Not Found`: `Food not found`

---

### `DELETE /logs/:id`
Deletes an existing food log entry. Enforces ownership authorization.

- **Access**: Protected (`Bearer <token>` + Resource Ownership)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "message": "Deleted",
    "meta": null
  }
  ```
- **Error Responses:**
  - `403 Forbidden`: `Forbidden` (attempting to delete another user's log)
  - `404 Not Found`: `Log not found`

---

## 10. AI Insights & Chatbot Endpoints (`/ai`)

### `GET /ai/insight`
Generates an AI nutritional analysis based on the user's daily consumed calories vs. target goal. Automatically cached per user per day.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "targetCalories": 2000,
      "consumedCalories": 1650,
      "remaining": 350,
      "status": "deficit",
      "insight": "You are currently in a steady calorie deficit with 350 kcal remaining. Consider having a protein-rich Greek yogurt or boiled eggs to hit your amino acid requirements before sleep."
    },
    "meta": {
      "cached": false
    }
  }
  ```
  *Status outcomes*: `"deficit"` | `"balanced"` | `"excess"` | `"unknown"`

---

### `GET /ai/insight/weekly`
Fetches a historical 7-day timeline of AI insights and caloric metrics.

- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": 18,
        "userId": 1,
        "date": "2026-03-24",
        "insight": "Great discipline on keeping under your target...",
        "caloriesConsumed": 1650,
        "caloriesTarget": 2000,
        "status": "deficit"
      }
    ],
    "meta": {
      "total": 7,
      "timeframe": "7 days",
      "totalWeeklyCalories": 12450,
      "averageDailyCalories": 1778
    }
  }
  ```

---

### `GET /ai/insight/export`
Generates and downloads a formatted PDF document compiling the user's weekly nutrition evaluation.

- **Access**: Protected (`Bearer <token>`)
- **Response Headers:**
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `attachment; filename=Dietary_Weekly_Report_John.pdf`
- **Success Response (`200 OK`):** Binary PDF stream.

---

### `POST /ai/chat`
Conversational nutrition assistant powered by Google Gemini with multi-model failover support. Supports both real-time WebSocket streaming and synchronous JSON reply.

- **Access**: Protected (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "message": "What should I eat post-workout if I am cutting?",
    "history": [
      { "role": "user", "text": "Hello coach" },
      { "role": "model", "text": "Hi John! How can I assist your nutrition plan today?" }
    ],
    "socketId": "q8xLkP_91nZkAbc1AAAB"
  }
  ```
- **Success Response with `socketId` (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "reply": "Streaming started..."
    }
  }
  ```
- **Success Response without `socketId` (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "reply": "For a post-workout meal while cutting, prioritize lean protein with moderate carbs, such as grilled chicken breast with steamed sweet potato."
    }
  }
  ```

---

## 11. Real-time Socket.io Streaming Protocol

### 1. Connection Handshake
Connect client-side using `socket.io-client`:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"]
});

socket.on("connect", () => {
  console.log("Connected with Socket ID:", socket.id);
});
```

### 2. Stream Consumer Event (`chat-stream`)
The server targets emissions specifically to the caller's `socketId`:

```javascript
socket.on("chat-stream", (data) => {
  if (data.isDone) {
    console.log("Stream finished!");
  } else {
    // Append incremental chunk to current chat bubble
    process.stdout.write(data.text);
  }
});
```

### 3. Payload Structure
| Field | Type | Description |
| :--- | :--- | :--- |
| `text` | `string` | Incremental chunk of textual response produced by Gemini. |
| `isDone` | `boolean` | `true` when the final token has been sent; `false` during active stream. |

### 4. Automatic Model Resilience
The backend incorporates a multi-model fallback cascade:
1. `gemini-2.5-flash-lite` (Primary high-efficiency model)
2. `gemini-3.5-flash-lite` (Automatic failover 1)
3. `gemini-3.1-flash-lite` (Automatic failover 2)

If a stream encounters interruption or API rate exhaustion, the server automatically attempts standard generation and transitions through the backup cascade transparently.
