# Builds the docs site (Next.js static export in out/) and serves it with nginx. The server only runs this image.
# Run: docker build -t design-med-o-de . && docker run --rm -p 8080:80 design-med-o-de   # http://localhost:8080
# Rollback: in Coolify, set the image tag to an earlier sha-<commit> and redeploy.
FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies first: this layer is reused as long as the lockfile does not change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80

# 127.0.0.1, not localhost: localhost resolves to ::1 while nginx listens on IPv4.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
