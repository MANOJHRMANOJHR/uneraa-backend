# Use Bun official image
FROM oven/bun:1.0.21

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install


# Copy all source code
COPY . .

RUN bun run build

# Expose port 8000
EXPOSE 8000

# Start the server
CMD ["bun", "start"]
