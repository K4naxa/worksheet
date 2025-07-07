# --- Stage 1: Build Stage ---
FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the TypeScript code into JavaScript
RUN npm run build

# --- Stage 2: Production Stage ---
FROM node:alpine

WORKDIR /app

# Copy production dependencies and package files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy compiled code and Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate the Prisma client based on the production environment
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main"]