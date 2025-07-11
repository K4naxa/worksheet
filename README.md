<div align="center">
  <img src="https://github.com/K4naxa/worksheet/blob/main/Other/applicationLogo.png" alt="Application Logo" width="120" height="120">
  <h1>Työharjoittelu Seuranta</h1>
  <p>
    Moderni ja intuitiivinen työpäiväkirja opiskelijoille työharjoittelun seurantaan.
  </p>
  <p>
    <strong>A Modern Internship Tracker for Students</strong>
  </p>
  
  <!-- Shields.io Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Keycloak-JWT-blue?style=for-the-badge&logo=keycloak" alt="Keycloak">
  </p>
</div>

---

## 🚀 Introduction

**Työharjoittelu Seuranta** (Internship Tracker) is a full-stack web application designed to help students track their daily activities, learnings, and progress during their internships. Built with a modern tech stack, it offers a seamless, responsive, and installable PWA experience.

The application provides an intuitive calendar interface for logging daily entries, a statistical overview of progress, and secure authentication via Keycloak. This project demonstrates best practices in modern web development, including server-side rendering, server actions, and a clean, maintainable codebase.

---

## ✨ Features

- **Daily Logging:** Easily add, view, and edit daily entries for work activities and learnings.
- **Interactive Calendar:** A visual, monthly overview of your workdays.
- **Statistical Analysis:** Automatically calculates total hours, workdays, and other key metrics.
- **Secure Authentication:** Robust user management and authentication powered by **Keycloak**.
- **Responsive Design:** A beautiful and functional UI on all devices, from mobile to desktop.
- **Progressive Web App (PWA):** Installable on mobile and desktop for a native-app feel and offline access.
- **Data Export:** Export your entire work log to an Excel (`.xlsx`) file for official reporting.
- **Glass Morphism UI:** A modern, visually appealing interface using gradient backgrounds and blurred glass effects.

---

## 📸 Screenshots

<table align="center">
  <tr>
    <td align="center">
      <strong>Login Page</strong><br>
      <img src="https://github.com/K4naxa/worksheet/blob/main/Other/LoginScreen.png" alt="Login Page Screenshot" width="400">
    </td>
    <td align="center">
      <strong>Home Page (Calendar)</strong><br>
      <img src="https://github.com/K4naxa/worksheet/blob/main/Other/Homepage.png" alt="Home Page Screenshot" width="400">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Profile & Settings</strong><br>
      <img src="https://github.com/K4naxa/worksheet/blob/main/Other/ProfilePage.png" alt="Profile Page Screenshot" width="400">
    </td>
    <td align-="center">
      <strong>Workday Modal</strong><br>
      <img src="https://github.com/K4naxa/worksheet/blob/main/Other/WorkdayModal.png" alt="Workday Modal Screenshot" width="400">
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [NestJS](https://nestjs.com/) (API)
- **Authentication:** [Keycloak](https://www.keycloak.org/) & [NextAuth.js](https://next-auth.js.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Deployment:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 📋 Requirements

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- A code editor like [VS Code](https://code.visualstudio.com/)

---

## ⚙️ Development Environment Setup

Follow these steps to get the full development environment running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/K4naxa/worksheet.git
cd worksheet
```

### 2. Set Up Keycloak & Database with Docker

The easiest way to run Keycloak and PostgreSQL is with Docker Compose.

1.  Navigate to the root of the project directory.
2.  You will find a `docker-compose.yml` file. The default credentials are suitable for local development.
3.  Run the following command to start the services in the background:

```bash
docker-compose up -d
```

This will start three containers:

- **Keycloak:** Accessible at `http://localhost:8080`
- **PostgreSQL:** The database for Keycloak and the application.
- **Adminer:** A database management tool accessible at `http://localhost:8081`

### 3. Configure Keycloak

You need to configure a realm and two clients (one for the frontend, one for the backend).

1.  **Go to the Keycloak Admin Console:** `http://localhost:8080`
2.  Log in with the default admin credentials: `admin` / `admin`.
3.  **Create a new Realm:**

    - Go to **"Manage realms"** and click **"Create Realm"**.
    - **Realm name:** `worksheet`
    - Click **"Create"**.

4.  **Create the Backend Client (NestJS):**

    - Go to **"Clients"** and click **"Create client"**.
    - **Client ID:** `nestjs-client`
    - Click **"Next"**.
    - **Client authentication:** `On`
    - **Authorization:** `Off`
    - **Standard flow:** `Off`
    - **Service accounts roles:** `On`
    - Click **"Next"**.
    - Click **"Save"**.
    - In the client settings, go to the **"Service account roles"** tab.
    - Click **"Assign role"**.
    - Filter by "clients" and select `manage-users`. Click **"Assign"**. This allows the backend to manage users.
    - Go to the **"Credentials"** tab.
    - Copy the **Client secret**. You will need this for the backend's `.env` file.

5.  **Create the Frontend Client (Next.js):**

    - Go to **"Clients"** and click **"Create client"**.
    - **Client ID:** `nextjs-client`
    - Click **"Next"**.
    - **Client authentication:** `On`
    - Click **"Next"**.
    - **Valid redirect URIs:** `http://localhost:3000/*`
    - **Valid post logout redirect URIs:** `http://localhost:3000/*`
    - **Web Origins:** `http://localhost:3000`
    - Click **"Save"**.
    - Go to the **"Credentials"** tab.
    - Copy the **Client secret**. You will need this for the backend's `.env` file.

6.  **Allow users to register:**
    - Go to **"Realm settings"** and click **"Login"**.
    - Set **User registration** `On`.
    - Set **Remember me** `On`.
    - Set **Login with email** `On`.

### 4. Set Up Backend (NestJS)

1.  Navigate to the backend project directory: `cd backend`
2.  Install dependencies:

```bash
npm install
```

3.  Create a `.env` file in the `backend` directory and add the following, replacing `<your-nestjs-client-secret>` with the secret you copied earlier:

```env
PORT=3001
# Database
DATABASE_URL="postgresql://root:root@localhost:5432/worksheet?schema=public"
# JWT Secret
JWT_SECRET= # Generate a strong secret (e.g., using `openssl rand -base64 32`)

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
# Keycloak
KEYCLOAK_REALM=worksheet
KEYCLOAK_CLIENT_ID=nestjs-client
KEYCLOAK_CLIENT_SECRET= # Get your Keycloak client secret from the Keycloak admin console
KEYCLOAK_AUTH_URL=http://localhost:8080
```

4.  Run database migrations:

```bash
npx prisma migrate dev && npx prisma generate
```

5.  Start the backend server:

```bash
npm run start:dev
```

The backend API will be running on `http://localhost:3001`.

### 5. Set Up Frontend (Next.js)

1.  Open a new terminal and navigate to the frontend project directory: `cd frontend`
2.  Install dependencies:

```bash
npm install
```

3.  Create a `.env` file in the `frontend` directory. Add the following, generating a strong secret for `NEXTAUTH_SECRET`.

```env
NODE_ENV=development
# Backend API URL
BACKEND_URL=http://localhost:3001

# NextAuth.js Configuration
NEXTAUTH_SECRET= # Generate a strong secret (e.g., using `openssl rand -base64 32`)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Keycloak Credentials for NextAuth.js
KEYCLOAK_CLIENT_SECRET= # Get your Keycloak client secret from the Keycloak admin console
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client
NEXT_PUBLIC_KEYCLOAK_REALM=worksheet
```

4.  Start the frontend development server:

```bash
npx next dev
```

Your application should now be running at `http://localhost:3000`.

---

## 🚢 Production Deployment

This guide outlines how to deploy the application to a production environment using Docker and Docker Compose.

### Requirements

- A server (VPS, cloud instance, etc.) with Docker and Docker Compose installed.
- A domain name.
- A reverse proxy (like Nginx or Caddy) to handle SSL and routing.
- **Running PostgreSQL and Keycloak instances** accessible from your server. This guide assumes these are already set up.

### 1. Build and Push Docker Images

The repository contains `Dockerfile`s for both the frontend and backend. You need to build these images and push them to a container registry (e.g., Docker Hub, GitHub Container Registry).

**A. Build the Backend Image**

```bash
# Navigate to the backend directory
cd backend

# Build the image (replace <your-username> with your registry username)
docker build -t <your-username>/worksheet-backend:latest .

# Push the image
docker push <your-username>/worksheet-backend:latest
```

**B. Build the Frontend Image**

The Next.js frontend requires public environment variables to be available at build time. You must pass them as build arguments.

```bash
# Navigate to the frontend directory
cd ../frontend

# Build the image, providing the necessary ARGs
docker build \
  --build-arg BACKEND_URL=https://api.your-domain.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.your-domain.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_REALM=worksheet \
  --build-arg NEXT_PUBLIC_BASE_URL=https://your-domain.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=<Your nextjs client id on server> \

  -t <your-username>/worksheet-frontend:latest .

# Push the image
docker push <your-username>/worksheet-frontend:latest
```

### 2. Prepare the Server

1.  **Clone the Repository:**

    - Create a folder to hold your worksheet instances files

2.  **Create Environment Files:**
    Create two files on your server: `.env.backend` and `.env.frontend`. Populate them with your production secrets and configuration.

    **`.env.backend`:**

    ```env
    # Backend Port
    PORT=3001

    # JWT Secret
    SECRET= # Generate a strong secret (e.g., using `openssl rand -base64 32`)

    # Database (points to your existing Postgres instance)
    DATABASE_URL="postgresql://<user>:<password>@<postgres-host>:<port>/<db>?schema=public"

    # Frontend URL for CORS
    FRONTEND_URL=https://your-domain.com

    # Keycloak (points to your existing Keycloak instance)
    KEYCLOAK_REALM=worksheet
    KEYCLOAK_CLIENT_ID=nestjs-client
    KEYCLOAK_CLIENT_SECRET=<your-nestjs-client-secret>
    KEYCLOAK_AUTH_URL=https://auth.your-domain.com
    ```

    **`.env.frontend`:**

    ```env
    # Public URLs
    NEXT_PUBLIC_KEYCLOAK_URL="https://auth.pohjosenpaja.fi"
    NEXT_PUBLIC_KEYCLOAK_REALM="worksheet"

    # NextAuth.js Configuration
    NEXTAUTH_URL=https://your-domain.com
    NEXTAUTH_SECRET=<generate-a-strong-secret-key>

    # Keycloak Credentials for NextAuth.js
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-client
    KEYCLOAK_CLIENT_SECRET=<your-nextjs-client-secret>
    KEYCLOAK_AUTH_URL=https://auth.your-domain.com
    KEYCLOAK_REALM=worksheet

    # Other
    BACKEND_URL="http://worksheet_backend:3001"
    ```

3.  **Create Production Docker Compose File:**
    Create a `docker-compose.prod.yml` file in the root of the project directory. This file will pull your pre-built images and connect them.

    ```yaml
    services:
      frontend:
        image: <your-username>/worksheet-frontend:latest
        container_name: worksheet_frontend
        restart: unless-stopped
        ports:
          - "9000:3000"
        env_file:
          - .env.frontend
        networks:
          - app_network

      backend:
        image: <your-username>/worksheet-backend:latest
        container_name: worksheet_backend
        restart: unless-stopped
        ports:
          - "9001:3001"
        env_file:
          - .env.backend
        networks:
          - db_network # For Keycloak/Postgres
          - app_network # For frontend
        extra_hosts:
          # Ensures backend can reach Keycloak if it's running on the host
          - "auth.your-domain.com:host-gateway"

    networks:
      app_network:
        driver: bridge
      db_network:
        # This network must already exist and be used by your
        # Keycloak and PostgreSQL containers.
        external: true
    ```

### 3. Run the Application

Start the services using your production compose file.

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Set Up a Reverse Proxy

Configure a reverse proxy (like Nginx) to route traffic to your containers and handle SSL.

#### YOUR REVERSE PROXY MUST BE ONLY ACCEPTING HTTPS REQUESTS

- `your-domain.com` -> `http://localhost:9000` (Frontend)
- `api.your-domain.com` -> `http://localhost:9001` (Backend)

Your reverse proxy should also be configured to handle traffic for `auth.your-domain.com` if it's routing to your Keycloak instance. Use a tool like Certbot to secure your domains with free SSL certificates.
