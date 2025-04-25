FROM node:18-alpine as build

WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . ./

# Set API URL environment variable
ARG API_URL
ENV API_URL=${API_URL}

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Add nginx config for SPA routing
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE $PORT

# Configure for Railway's dynamic port
RUN echo 'sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"' > /start.sh
RUN chmod +x /start.sh

# Start nginx
CMD ["/start.sh"] 