# Use Bun official image
FROM oven/bun:1.0.21

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install


# Copy all source code
COPY . .

RUN npm run build

# Expose port 8000
EXPOSE 8000

# Start the server
CMD ["npm", "start"]
