FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

# The app starts with tsx and tsconfig has noEmit=true,
# so devDependencies are required inside the container.
RUN npm ci

COPY tsconfig.json ./
COPY ca.pem ./
COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

CMD ["npm", "start"]
