FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set up ARG variables to allow the build process to inject the environment values
ARG VITE_FACTORY_ADDRESS
ARG VITE_TOKEN_ADDRESS
ARG VITE_INFURA_RPC_URL
ARG VITE_FAUCET_URL

# Transform them to ENV so Vite detects them during the build process
ENV VITE_FACTORY_ADDRESS=$VITE_FACTORY_ADDRESS
ENV VITE_TOKEN_ADDRESS=$VITE_TOKEN_ADDRESS
ENV VITE_INFURA_RPC_URL=$VITE_INFURA_RPC_URL
ENV VITE_FAUCET_URL=$VITE_FAUCET_URL

RUN npm run build

# Nginx setup
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
