# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source code
COPY . .

# Expose API port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
