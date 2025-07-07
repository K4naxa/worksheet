# frontend/Dockerfile

# --- Stage 1: Build Stage ---
# Use a Node.js image to build the application
FROM node:alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# --- Define ALL Build-Time Arguments ---
# These will be passed in from our prod.env file
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM
ARG NEXTAUTH_URL
ARG KEYCLOAK_ISSUER
ARG KEYCLOAK_AUTH_URL
ARG BACKEND_URL

# --- Set Environment Variables for the Build Process ---
# This makes the ARG values available to `next build`
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV KEYCLOAK_ISSUER=$KEYCLOAK_ISSUER
ENV KEYCLOAK_AUTH_URL=$KEYCLOAK_AUTH_URL
ENV BACKEND_URL=$BACKEND_URL

# Set the NEXT_TELEMETRY_DISABLED environment variable to 1 during the build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application for production
RUN npm run build

# --- Stage 2: Production Stage ---
# Use a smaller, more secure Node.js image for the final image
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app will run on
EXPOSE 3000

# Set the command to start the production server
CMD ["npm", "start"]