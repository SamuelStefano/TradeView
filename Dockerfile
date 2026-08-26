# Image for the strategy runner only. The Next app is deployed to Vercel and is
# not built here: this container has no port, no server, and nothing inbound.

FROM node:22.22.2-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# The runner reaches Postgres and public venue endpoints and nothing else. The
# front-end half of the dependency tree is dead weight in a process that renders
# nothing, and every package left in the image is one more thing to patch.
RUN rm -rf \
      node_modules/next \
      node_modules/@next \
      node_modules/@swc \
      node_modules/react \
      node_modules/react-dom \
      node_modules/lucide-react \
      node_modules/sharp \
      node_modules/@img \
      node_modules/caniuse-lite \
      node_modules/@anthropic-ai \
      node_modules/@supabase/ssr

FROM node:22.22.2-alpine

# Signals reach PID 1 unforwarded without an init, and the runner needs SIGTERM
# to finish the strategy in its hand and release the leases it holds.
RUN apk add --no-cache tini

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY runner ./runner
COPY lib ./lib

# The liveness file is written on every tick, so the runtime user needs a
# writable home of its own rather than the read-only application directory.
ENV TRADEVIEW_RUNNER_LIVENESS=/tmp/tradeview-runner-alive

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD node runner/healthcheck.mjs

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--import", "tsx", "runner/index.ts"]
