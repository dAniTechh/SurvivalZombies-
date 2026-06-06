# ETAPA 1: Construcción de Angular (Actualizado a node:20-alpine)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# ETAPA 2: Servidor Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Ajustado para usar el nombre correcto del proyecto: zombies-frontend
COPY --from=build /app/dist/zombies-frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]