# Use Node.js 20 official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the app (if you have a build step)
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
