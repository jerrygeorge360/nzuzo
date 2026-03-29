FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Assume root .env is available in current or parent context? 
# In Docker Compose, we'll map it.
ENV SEPOLIA_RPC_URL=${SEPOLIA_RPC_URL}
ENV PRIVATE_KEY=${PRIVATE_KEY}
ENV FAUCET_PORT=3001

EXPOSE 3001

CMD ["npx", "ts-node", "server.ts"]
