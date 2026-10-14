# ---------------------------------------------------------------------------
# Dietary API - Express + Socket.io (Node 22 alpine)
# Multi-stage: dependencies are installed once and copied into a slim runtime
# image that runs as the non-root "node" user.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# Installed from the lockfile. Dev dependencies are intentionally kept because
# sequelize-cli (a devDependency) applies the DB migrations on container boot.
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# tini = PID 1 so SIGTERM/Docker stop is forwarded and zombies are reaped
RUN apk add --no-cache tini

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 3000

# Liveness probe hits the public health route registered in app.js ("/")
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get({host:'127.0.0.1',port:process.env.PORT||3000,path:'/',timeout:4000},r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini","--"]

# Apply pending migrations (set RUN_MIGRATIONS=false to skip, e.g. on a
# read-only replica) and then hand over to the HTTP + Socket.io server.
CMD ["sh","-c","if [ \"${RUN_MIGRATIONS:-true}\" = \"true\" ]; then echo '[entrypoint] sequelize-cli db:migrate'; npx --no-install sequelize-cli db:migrate || exit 1; fi; exec node ./bin/www"]
