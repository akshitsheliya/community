# Community App Onboarding

This document covers:
- Login and registration flow (frontend + backend)
- Local setup and run instructions for backend and frontend
- Required environment variables discovered from code

## 1) Repositories
- Backend: `community-app-backend`
- Frontend: `community-app-frontend`

## 2) High-level Architecture
- Frontend uses React + Vite and calls backend APIs under `/api`.
- Backend uses Express + TypeScript, MySQL (`mysql2/promise`), JWT auth, file uploads, and Swagger.
- Frontend API client is centralized in `src/Api/api.ts` and sends:
  - `Authorization: Bearer <token>`
  - `Accept-Language: <current i18n language>`

## 3) Auth and Registration Flow (End-to-End)

### 3.1 Community Selection (Register path)
- UI route: `/community`
- Frontend calls: `GET /api/community`
- Backend route: `src/routes/communityNumberRoutes.ts`

Purpose:
- User selects the community before registration.
- Selected `community_uuid` is stored in frontend local storage (`communityData`).

### 3.2 Register: Send OTP
- UI route: `/register`
- Frontend page: `community-app-frontend/src/Pages/auth/RegisterPage.tsx`
- Frontend call: `POST /api/register/mobile` with:
  - `phone_number`
  - `community_uuid`
- Backend route: `src/routes/authRoutes.ts`
- Backend controller: `registerMobile` in `src/controllers/authController.ts`

Backend behavior (summary):
- Validates phone number and community.
- Checks duplicate/member relationship constraints.
- Generates OTP.
- Sends OTP using WhatsApp API if configured.
- Falls back to static OTP behavior for configured test numbers.

### 3.3 Register: Verify OTP
- UI route: `/register/verify-otp`
- Frontend page: `community-app-frontend/src/Pages/auth/RegisterOtp.tsx`
- Frontend call: `POST /api/register/verify-otp`
- Backend controller: `verifyOTP` in `src/controllers/authController.ts`

Result:
- On success, token + registration state are prepared for profile completion.

### 3.4 Register: Create Profile
- UI route: `/profile-details`
- Frontend call: `POST /api/profile` (multipart/form-data)
- Backend route: `authRouter.post("/profile", verifyToken, uploadProfilePhoto, createProfile)`
- Backend controller: `createProfile` in `src/controllers/profileController.ts`

Backend behavior (summary):
- Reads user identity from JWT (`verifyToken`).
- Validates required profile fields.
- Optionally saves profile photo.
- Reuses existing member by phone or creates new member profile.
- Creates family record.
- Links member to selected community.
- Sends admin notification for approval workflow.

### 3.5 Login: Send OTP
- UI route: `/login`
- Frontend page: `community-app-frontend/src/Pages/auth/LoginPage2.tsx`
- Frontend call: `POST /api/login/mobile` with:
  - `phone_number`
  - optional `community_uuid` (if present in local storage)
- Backend controller: `loginWithMobile` in `src/controllers/authController.ts`

### 3.6 Login: Verify OTP
- UI route: `/otp-input`
- Frontend page: `community-app-frontend/src/Pages/auth/OtpInput.tsx`
- Frontend call: `POST /api/login/verify-otp`
- Backend controller: `verifyLoginOTP` in `src/controllers/authController.ts`

Result:
- Backend returns token.
- Frontend stores token in local storage and fetches profile via `GET /api/user`.

### 3.7 Authenticated User Bootstrap
- Frontend reads `authToken` from local storage.
- Frontend loads logged-in user data via `GET /api/user`.
- Backend route: `src/routes/updateProfileRoutes.ts` (`getLoggedInUserData`).

### 3.8 Logout / Session Expiry
- Axios response interceptor in frontend clears local/session storage on `401` or `403` and redirects to `/login`.

## 4) Local Setup

### 4.1 Backend (`community-app-backend`)

Install:
```bash
npm install
```

Run dev:
```bash
npm run dev
```

Build + run:
```bash
npm run build
npm start
```

Health check:
- `GET /status`

Swagger:
- Initialized from `src/server.ts` via `setupSwagger(app)`.

### 4.2 Frontend (`community-app-frontend`)

Install:
```bash
npm install
```

Run dev:
```bash
npm run dev
```

Build:
```bash
npm run build
```

Preview built app:
```bash
npm run serve
```

## 5) Environment Variables

### 5.1 Backend required/used vars
Core runtime:
- `PORT` (default: `3000`)
- `SWAGGER_HOST`
- `UPLOAD_PATH` (required by app startup)
- `LOG_PATH` (required by router startup)

Database:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Auth:
- `JWT_SECRET`

URL building / redirects:
- `BASE_URL`
- `DEV_URL`

OTP/WhatsApp:
- `WA_API_URL`
- `WA_USER_NAME`
- `WA_PASSWORD`
- `STATIC_OTP`

### 5.2 Frontend vars
- `VITE_API_URL` (backend base URL)
- `VITE_MARKSHEET_API_URL` (present in env helper)

## 6) Important Notes for Team
- Frontend currently references both `authToken` and `authtoken` in different places; standardize to one key.
- Most backend business routes require JWT via `verifyToken`.
- Media/file upload endpoints expect multipart requests and rely on `UPLOAD_PATH`.

## 7) Useful Files
Backend:
- `src/server.ts`
- `src/app.ts`
- `src/routes/authRoutes.ts`
- `src/controllers/authController.ts`
- `src/controllers/profileController.ts`
- `src/routes/updateProfileRoutes.ts`
- `src/config/db.ts`

Frontend:
- `community-app-frontend/src/main.tsx`
- `community-app-frontend/src/App.tsx`
- `community-app-frontend/src/Api/api.ts`
- `community-app-frontend/src/Pages/auth/LoginPage2.tsx`
- `community-app-frontend/src/Pages/auth/OtpInput.tsx`
- `community-app-frontend/src/Pages/auth/RegisterPage.tsx`
- `community-app-frontend/src/Pages/auth/RegisterOtp.tsx`
