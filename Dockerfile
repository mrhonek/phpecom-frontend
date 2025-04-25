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

# Copy server.js to the build directory
COPY server.js ./

# Expose port
EXPOSE ${PORT:-3000}

# Start the Express server
CMD ["node", "server.js"] 