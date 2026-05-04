# Use Node.js LTS
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

#Install dependencies
RUN npm install

#copy rest of the application
COPY . .

#Expose the port the app runs on
EXPOSE 3000

#Start the application
CMD ["npm", "start"]
