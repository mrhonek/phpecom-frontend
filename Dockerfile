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

# Build the app using client-only configuration (no SSR)
RUN npm run build -- --configuration=client-only

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Create a health check file
RUN echo "HEALTH CHECK OK" > /usr/share/nginx/html/health.txt

# Create a simpler default.conf for Nginx
RUN echo 'server {\n\
    listen PORT_PLACEHOLDER default_server;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html index.htm;\n\
    location / {\n\
        try_files $uri $uri/ /index.html =404;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Expose port (Railway will override this)
EXPOSE 80

# Create a simpler startup script
RUN echo '#!/bin/sh\n\
sed -i -e "s/PORT_PLACEHOLDER/$PORT/g" /etc/nginx/conf.d/default.conf\n\
echo "Nginx config:"\n\
cat /etc/nginx/conf.d/default.conf\n\
echo "Starting nginx..."\n\
nginx -g "daemon off;"' > /start.sh

RUN chmod +x /start.sh

ENTRYPOINT ["/bin/sh"]
CMD ["/start.sh"] 