# Builds the docs site (Next.js static export in out/) and serves it with nginx. The server only runs this image.
# Run: docker build -t design-med-o-de . && docker run --rm -p 8080:80 design-med-o-de   # http://localhost:8080
# Search engines: every response carries "X-Robots-Tag: noindex, nofollow" (ROBOTS_TAG below), so dev and preview
# need no setting. As production, run with -e ROBOTS_TAG= (empty): then no X-Robots-Tag is sent.
# Launch: the production resource in Coolify gets the environment variable ROBOTS_TAG with an empty value.
# Rollback: in Coolify, set the image tag to an earlier sha-<commit> and redeploy.
# Logs: nginx writes to stdout and stderr; the server's Docker daemon caps them (json-file, max-size 10m, max-file 3 –
# Coolify's default). The privacy policy relies on this cap, so keep it on any other host.
FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies first: this layer is reused as long as the lockfile does not change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:alpine
# X-Robots-Tag value; empty sends no header. The filter limits the template step to this one variable.
ENV ROBOTS_TAG="noindex, nofollow" \
    NGINX_ENVSUBST_FILTER="^ROBOTS_TAG\$"
# nginx.conf is a template: the image renders it at start (see nginx.conf). The stock default.conf is removed, so a
# skipped template step leaves no server and the health check fails instead of serving the nginx welcome page.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80

# 127.0.0.1, not localhost: localhost resolves to ::1 while nginx listens on IPv4.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
