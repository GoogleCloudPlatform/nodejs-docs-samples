FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

RUN useradd -m appuser

COPY --chown=appuser:appuser . .

USER appuser

CMD [ "node", "customCredentialSupplierAws.js" ]
