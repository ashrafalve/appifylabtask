# --- Base Image ---
FROM node:22-alpine AS base

# Install build dependencies required for compiling native modules (like bcrypt)
RUN apk add --no-cache python3 make g++ openssl

WORKDIR /usr/src/app

# --- Development / Build Stage ---
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Production Dependencies State ---
FROM base AS production-deps
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma/
RUN npx prisma generate

# --- Final Production Image ---
FROM node:22-alpine AS production
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy production node_modules with compiled binaries
COPY --from=production-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["node", "dist/main"]
