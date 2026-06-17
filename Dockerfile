# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Instalar gettext para envsubst
RUN apk add --no-cache gettext

# Copiar los archivos estáticos del build de Angular
# Angular 17+ genera en dist/<app>/browser/
COPY --from=builder /app/dist/teia-frontend/browser /usr/share/nginx/html

# Copiar la plantilla de nginx (el entrypoint la procesa al iniciar)
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Copiar el entrypoint que inyecta las variables de entorno
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Cloud Run escucha en el puerto 8080 por defecto
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
