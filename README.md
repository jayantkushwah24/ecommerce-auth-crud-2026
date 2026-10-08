# Prodhub

A full-stack product catalog and authentication application. Prodhub combines a
React storefront with an Express API for account management and product
operations. Product records are stored in MongoDB, and product images are
uploaded to ImageKit.

**Live API:** [prodhub-be.vercel.app](https://prodhub-be.vercel.app/)

## Features

- Account registration and login with server-side validation
- Short-lived access tokens and rotating refresh tokens in HttpOnly cookies
- Access tokens kept in client memory rather than browser storage
- Automatic access-token refresh and retry for expired authenticated requests
- Product listing and individual product retrieval
- Authenticated product creation, editing, and deletion
- Multiple product image uploads through ImageKit
- Responsive interface with inline product editing
- Toast notifications for success, validation, and API errors
- Vercel serverless deployment for the API and a same-origin frontend API proxy

## Technology

| Area              | Technologies                                  |
| ----------------- | --------------------------------------------- |
| Frontend          | React 19, Vite, React Router, React Hook Form |
| HTTP and feedback | Axios, React Toastify                         |
| Backend           | Node.js 22, Express 5                         |
| Data              | MongoDB, Mongoose                             |
| Authentication    | JSON Web Tokens, bcrypt, HttpOnly cookies     |
| Image storage     | ImageKit                                      |
| Deployment        | Vercel                                        |

## Project structure

```text
.
├── client/
│   ├── api/                 # Vercel same-origin API proxy
│   ├── src/
│   │   ├── components/      # Auth, navigation, and product UI
│   │   ├── config/          # Axios client and token refresh
│   │   └── utils/           # Shared API error formatting
│   └── vercel.json
├── server/
│   ├── api/                 # Vercel serverless Express entry point
│   ├── src/
│   │   ├── app/             # Express application
│   │   ├── config/          # Environment and MongoDB setup
│   │   ├── controllers/     # Auth and product handlers
│   │   ├── middlewares/     # Authentication
│   │   ├── model/           # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   └── validators/      # Request validation
│   └── vercel.json
└── README.md
```

## Requirements

- Node.js 22.x
- npm
- MongoDB instance accessible from the machine running the API
- ImageKit account and API credentials

## Run locally

### 1. Install dependencies

Open two terminals:

```powershell
cd client
npm install
```

```powershell
cd server
npm install
```

### 2. Configure the API

From the repository root, copy the example environment file:

```powershell
Copy-Item server\.env.example server\.env
```

Set the values in `server/.env`:

| Variable                | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `MONGO_URI`             | MongoDB connection string                                       |
| `JWT_ACCESS_SECRET`     | Private secret used to sign access tokens                       |
| `JWT_REFRESH_SECRET`    | Different private secret used to sign refresh tokens            |
| `IMAGEKIT_PRIVATE_KEY`  | ImageKit private API key                                        |
| `IMAGEKIT_PUBLIC_KEY`   | ImageKit public key                                             |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint                                           |
| `CLIENT_ORIGINS`        | Optional comma-separated list of allowed direct browser origins |

Keep credentials private. `.env` files are ignored by Git; never add real
secrets to the repository.

### 3. Start the API and frontend

In one terminal:

```powershell
cd server
npm run dev
```

In another terminal:

```powershell
cd client
npm run dev
```

Open the Vite URL shown in the client terminal (usually
`http://localhost:5173`). The development proxy target is configured in
`client/vite.config.js`; it currently points to the deployed API. To use a
local API instead, change the proxy target to `http://localhost:3000`.

## API

All endpoints are prefixed with `/api`. The deployed API origin is
`https://prodhub-be.vercel.app`.

### Authentication

| Method | Path                      | Access         | Description                                           |
| ------ | ------------------------- | -------------- | ----------------------------------------------------- |
| `POST` | `/api/auth/register`      | Public         | Create an account                                     |
| `POST` | `/api/auth/login`         | Public         | Sign in and issue tokens                              |
| `POST` | `/api/auth/refresh-token` | Refresh cookie | Rotate the refresh token and issue a new access token |
| `POST` | `/api/auth/logout`        | Access token   | Invalidate the session and clear the refresh cookie   |
| `GET`  | `/api/auth/me`            | Access token   | Return the current user's profile                     |

Registration expects JSON with `name`, `email`, `password`, and
`confirmPassword`. Passwords must satisfy the server's strong-password
validation.

### Products

| Method   | Path                | Access       | Description                               |
| -------- | ------------------- | ------------ | ----------------------------------------- |
| `GET`    | `/api/products`     | Public       | List products                             |
| `GET`    | `/api/products/:id` | Public       | Retrieve one product                      |
| `POST`   | `/api/products`     | Access token | Create a product with multipart form data |
| `PUT`    | `/api/products/:id` | Access token | Update product fields                     |
| `DELETE` | `/api/products/:id` | Access token | Delete a product                          |

Authenticated requests use:

```http
Authorization: Bearer <access-token>
```

Product creation accepts `title`, `description`, `price`, and `sizes` as form
fields (`price` and `sizes` are JSON strings), plus one to five `images` files.
The combined upload size is limited to 4 MB.

Updates accept a JSON object containing any of `title`, `description`, `price`,
`sizes`, and `published`. Example:

```json
{
  "title": "Everyday shirt",
  "description": "A soft cotton shirt.",
  "price": {
    "amount": 1200,
    "currency": "INR"
  },
  "sizes": {
    "size": "M",
    "stock": 12
  },
  "published": true
}
```

Allowed currencies are `INR` and `USD`; allowed sizes are `S`, `M`, `L`, `XL`,
and `XXL`.

## Deploy to Vercel

The frontend and API are separate Vercel projects from this repository. The
frontend's `/api/*` function forwards API requests to the API project so the
browser uses a same-origin path and refresh cookies remain first-party.

### API project

1. Import the repository as a Vercel project and set the **Root Directory** to
   `server`.
2. Set these environment variables in the Vercel environments you use:
   `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
   `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_PUBLIC_KEY`, and
   `IMAGEKIT_URL_ENDPOINT`.
3. Set `CLIENT_ORIGINS` only if browsers will call the API domain directly.
   Normal frontend traffic goes through the same-origin proxy.
4. Ensure your MongoDB provider permits connections from your Vercel
   deployment, using an appropriate network access configuration for your
   provider and plan.
5. Deploy the project.

### Frontend project

1. Import the same repository as another Vercel project and set the **Root
   Directory** to `client`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. The API proxy defaults to `https://prodhub-be.vercel.app`. To use a
   different API origin, set `BACKEND_API_URL` in the frontend Vercel project
   to the API origin only (no trailing slash and no `/api`).
4. Deploy or redeploy after changing environment variables.

Keep the API and frontend URLs in sync when changing project domains.
Environment-variable changes require a new deployment to take effect.

## Quality checks

Run from `client`:

```powershell
npm run lint
npm run build
```

Syntax-check the API source from `server`:

```powershell
Get-ChildItem -Path src,api -Filter *.js -Recurse |
  ForEach-Object { node --check $_.FullName }
```
