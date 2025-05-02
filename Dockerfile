# --- STAGE 1: Build ---
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# --- STAGE 2: Serve the app with nginx ---
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the nginx configuration file
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck File for Checking the health of the container
RUN echo "OK" > /usr/share/nginx/html/healthcheck.html

# Expose port 80 for the web server
EXPOSE 80

# Define Healthcheck command
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl --fail http://localhost:80 || exit 1