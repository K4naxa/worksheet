<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/2f17079b-0078-43d7-8495-257a6e133c94" alt="Application Logo" width="120" height="120">
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
      <img src="YOUR_LOGIN_SCREENSHOT_URL_HERE" alt="Login Page Screenshot" width="400">
    </td>
    <td align="center">
      <strong>Home Page (Calendar)</strong><br>
      <img src="YOUR_HOME_SCREENSHOT_URL_HERE" alt="Home Page Screenshot" width="400">
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>Profile & Settings</strong><br>
      <img src="YOUR_PROFILE_SCREENSHOT_URL_HERE" alt="Profile Page Screenshot" width="400">
    </td>
    <td align-="center">
      <strong>Workday Modal</strong><br>
      <img src="YOUR_MODAL_SCREENSHOT_URL_HERE" alt="Workday Modal Screenshot" width="400">
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

Clone both the frontend and backend repositories to your local machine.

```bash
# Clone the frontend
git clone <your-frontend-repo-url>
cd frontend

# Clone the backend (in a separate terminal or directory)
git clone <your-backend-repo-url>
cd backend
```

### 2. Set Up Keycloak & Database with Docker

The easiest way to run Keycloak and PostgreSQL is with Docker Compose.

1.  Navigate to the frontend project directory.
2.  You will find a `docker-compose.yml` file. Before running it, open the file and change the default passwords for `POSTGRES_PASSWORD` and `KEYCLOAK_ADMIN_PASSWORD`.
3.  Run the following command to start the services in the background:

```bash
docker-compose up -d
```

This will start two containers:

- **Keycloak:** Accessible at `http://localhost:8080`
- **PostgreSQL:** The database for Keycloak.

### 3. Configure Keycloak

You need to configure a realm, a client, and users in Keycloak.

1.  **Go to the Keycloak Admin Console:** `http://localhost:8080`
2.  Log in with the admin credentials you set in `docker-compose.yml` (default: `admin/your_strong_admin_password_here`).
3.  **Create a new Realm:**
    - Click "Create Realm".
    - Give it a name (e.g., `my-app-realm`).
4.  **Create a Client:**
    - Go to "Clients" and click "Create client".
    - **Client ID:** `nextjs-client` (or as defined in your backend)
    - **Valid Redirect URIs:** `http://localhost:3000/*`
    - **Web Origins:** `http://localhost:3000`
    - Save the client.
5.  **Create Users:**
    - Go to "Users" and create one or more test users.
    - Set a password for each user in the "Credentials" tab.

### 4. Set Up Backend (NestJS)

1.  Navigate to your backend project directory.
2.  Install dependencies:

```bash
npm install
```

3.  Create a `.env` file and configure it with your database and Keycloak settings. It should look similar to this:

```env
# Database
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<db>?schema=public"

# Keycloak
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=my-app-realm
KEYCLOAK_CLIENT_ID=nextjs-client
```

4.  Run database migrations:

```bash
npx prisma migrate dev
```

5.  Start the backend server:

```bash
npm run start:dev
```

The backend API should now be running, typically on `http://localhost:3001`.

### 5. Set Up Frontend (Next.js)

1.  Navigate to your frontend project directory.
2.  Install dependencies:

```bash
npm install
```

3.  Create a `.env.local` file. This file contains the environment variables needed for the Next.js app to connect to the backend and Keycloak.

```env
# Backend API URL
BACKEND_URL=http://localhost:3001

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET= # Generate a strong secret key (e.g., using `openssl rand -base64 32`)

# Keycloak Credentials for NextAuth.js
KEYCLOAK_ID=nextjs-client
KEYCLOAK_SECRET= # Get this from the "Credentials" tab of your client in Keycloak
KEYCLOAK_ISSUER=http://localhost:8080/realms/my-app-realm

# Public Keycloak URLs for the client
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=my-app-realm
```

4.  Start the frontend development server:

```bash
npm run dev
```

Your application should now be running at `http://localhost:3000`.

---

## 🚢 Production Deployment

Deploying this application involves running the three main components (Frontend, Backend, Keycloak) as optimized, long-running services.

### Requirements

- A Virtual Private Server (VPS) or cloud instance (e.g., DigitalOcean, AWS EC2, Vultr) with at least 2GB RAM (4GB recommended).
- Docker and Docker Compose installed on the server.
- A domain name and a reverse proxy like Nginx or Caddy to handle SSL termination and routing.

### Deployment Steps (High-Level)

1.  **Prepare the Server:**

    - Set up your VPS and install Docker/Docker Compose.
    - Configure your firewall to allow traffic on ports 80 (HTTP) and 443 (HTTPS).

2.  **Use Docker for Everything:**

    - **Frontend & Backend:** Create a `Dockerfile` for both your Next.js and NestJS applications to build optimized production images.
    - **Keycloak & Database:** Use the `docker-compose.yml` file from development, but ensure it's configured for production.

3.  **Run with Docker Compose:**

    - Run docker build (remember to specify cpu architecture) to build an image of the
    - Transfer project files (or clone from Git) to the server.
    - Create production `.env` files for each service.
    - Run `docker-compose -f docker-compose.prod.yml up -d` to start all services.

4.  **Set Up a Reverse Proxy (Example with Nginx):**
    - Install Nginx on the server.
    - Configure Nginx to act as a reverse proxy. It will receive all traffic on port 443 (HTTPS) and route it to the correct Docker container based on the domain name.
      - `your-domain.com` -> `http://localhost:3000` (Next.js frontend)
      - `api.your-domain.com` -> `http://localhost:3001` (NestJS backend)
      - `auth.your-domain.com` -> `http://localhost:8080` (Keycloak)
    - Use Certbot to obtain and automatically renew free SSL certificates from Let's Encrypt.

This setup provides a secure, scalable, and manageable production environment.
