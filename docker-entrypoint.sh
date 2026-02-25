#!/bin/sh
set -e

# ── Validar variables requeridas ────────────────────────────────────────────────
if [ -z "$BACKEND_URL" ]; then
    echo "ERROR: La variable de entorno BACKEND_URL es obligatoria."
    echo "Ejemplo: BACKEND_URL=https://mi-backend-xxxxx-uc.a.run.app"
    exit 1
fi

# Quitar trailing slash si lo tiene
BACKEND_URL="${BACKEND_URL%/}"

echo "Iniciando frontend con BACKEND_URL=${BACKEND_URL}"

# ── Generar nginx.conf a partir de la plantilla ─────────────────────────────────
# envsubst solo reemplaza ${BACKEND_URL}; las variables propias de nginx ($uri, $host, etc.) quedan intactas.
envsubst '${BACKEND_URL}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/conf.d/default.conf

# ── Generar config.json de runtime para Angular ──────────────────────────────────
# AppConfigService carga este archivo antes de arrancar la app (APP_INITIALIZER).
# - apiUrl: referencia al backend (útil si algún servicio lo usa directamente)
# - wsUrl:  URL del backend para la conexión WebSocket (SockJS/STOMP)
cat > /usr/share/nginx/html/assets/config.json << EOF
{
  "apiUrl": "${BACKEND_URL}",
  "wsUrl": "${BACKEND_URL}"
}
EOF

echo "config.json generado correctamente."
echo "nginx listo."

# ── Ejecutar el comando pasado como CMD (nginx) ─────────────────────────────────
exec "$@"
