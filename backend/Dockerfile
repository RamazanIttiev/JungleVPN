# syntax=docker/dockerfile:1

FROM node:20 AS deps
WORKDIR /vpn-app

# # Install WireGuard + networking tools
# RUN apt-get update && \
#   apt-get install -y wireguard-tools iproute2 iptables && \
#   rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS build
WORKDIR /vpn-app
COPY . .
RUN yarn build

FROM node:20 AS runner
WORKDIR /vpn-app
ENV NODE_ENV=production

# # Install WireGuard in runtime image too
# RUN apt-get update && \
#   apt-get install -y wireguard-tools iproute2 iptables && \
#   rm -rf /var/lib/apt/lists/*

COPY --from=build /vpn-app/package.json ./package.json
COPY --from=build /vpn-app/node_modules ./node_modules
COPY --from=build /vpn-app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]