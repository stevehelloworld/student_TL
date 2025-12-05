# Use official Node.js 18 Alpine image
FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk -U upgrade && apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript code
# Assuming 'npm run build' isn't defined in package.json based on previous read, 
# but 'npm start' runs 'ts-node src/server.ts'. 
# For production, we should compile to JS.
# Let's check package.json again or just use ts-node for simplicity if build script is missing,
# but compiling is better. I'll add a build step if needed or use ts-node.
# Given the package.json viewed earlier: "start": "ts-node src/server.ts"
# I will stick to ts-node for now to match current behavior, or add a build script.
# Better to use ts-node in the container for consistency with current setup unless I modify package.json.
# However, for production, pre-compiling is recommended. 
# I will add a build script to package.json first? No, let's keep it simple.
# Actually, running ts-node in prod is fine for this scale.

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
