# Start from an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package files
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build

# Tell Docker that the container will listen on port 3000
EXPOSE 3000

# The command to run when the container starts
CMD [ "node", "dist/index.js" ]