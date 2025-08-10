# ---- Build Stage ----
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    RUN npm run build
    
    
    # ---- Production Stage ----
    FROM node:20-alpine
    
    WORKDIR /app

    COPY package*.json ./
    RUN npm install --only=production
    
    COPY --from=builder /app/dist ./dist
    
    EXPOSE 3000
    
    CMD npx typeorm migration:run -d dist/config/typeorm-cli.config.js && node dist/main