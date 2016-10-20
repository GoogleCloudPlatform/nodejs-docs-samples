# Dockerfile extending the generic Node image with application files for a
# single application.
FROM gcr.io/google_appengine/nodejs

# Install something custom
RUN apt-get update && apt-get install -y fortunes

# Install Node.js
RUN /usr/local/bin/install_node '>=4.3.2'

# Copy application code.
COPY . /app/

# Install dependencies.
RUN npm --unsafe-perm install

# Run the app, default is "npm start"
CMD npm start
