# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /vpn-app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS runner
WORKDIR /vpn-app
COPY . .
EXPOSE 8080
CMD ["yarn", "dev"]
