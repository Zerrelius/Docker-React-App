# --- STAGE 1: Build ---
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

# Add build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
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
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy 404 page (from the dist directory)
COPY public/404.html /usr/share/nginx/html/404.html

# Define healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Expose port 80 for the web server
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
