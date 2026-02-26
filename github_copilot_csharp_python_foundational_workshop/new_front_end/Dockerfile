# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build arguments
ARG VITE_API_URL=http://localhost:8000
ARG VITE_AI_CHAT_URL=http://localhost:8002
ARG VITE_AUTH_URL=http://localhost:8003

# Set environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_CHAT_URL=$VITE_AI_CHAT_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
