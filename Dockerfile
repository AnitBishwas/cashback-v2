# Base image
FROM node:20-alpine

# Set working directory

WORKDIR /app

# Copy everthing from app to root
COPY app/ ./

ARG SHOPIFY_API_KEY
ARG SHOPIFY_APP_URL
ARG VITE_SHOPIFY_API_KEY
# Accept token at build time
ARG NPM_TOKEN

ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
ENV SHOPIFY_APP_URL=$SHOPIFY_APP_URL
ENV VITE_SHOPIFY_API_KEY=$VITE_SHOPIFY_API_KEY


RUN npm install && npm run build

RUN ls -la
# Expose backend port
EXPOSE 8080

# Run backend server (adjust path if needed)
CMD ["npm", "start"]
