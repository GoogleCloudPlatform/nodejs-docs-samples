# This is the standard Node.js runtime image. It is essentially Debian with
# Node.js pre-installed.
FROM gcr.io/google_appengine/nodejs

# Install something custom
RUN apt-get update && apt-get install -y fortunes

# Install a particular version of Node.js
RUN install_node v4.2.3

# Copy application code.
COPY . /app/

# Install dependencies.
RUN npm --unsafe-perm install

# Run the app, default is "npm start"
CMD npm run start-on-prod
