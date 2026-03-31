# Stage 1: Build the Angular application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the project (Angular 18 uses distribution folder dist/medi-care-ai/browser)
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy a custom nginx configuration to handle Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the build stage to the nginx html directory
COPY --from=build /app/dist/medi-care-ai/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
