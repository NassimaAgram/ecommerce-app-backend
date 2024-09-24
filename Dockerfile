FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your app runs on (e.g., 3000)
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]

