# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
COPY package*.json ./

# Install production dependencies.
RUN npm install --omit=dev

# Create a non-root user for security
RUN useradd -m appuser

# Copy local code to the container image.
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Run the web service on container startup.
CMD [ "node", "customCredentialSupplierAws.js" ]
