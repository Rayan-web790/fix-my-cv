# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Node.js backend
FROM node:20-alpine
WORKDIR /app/backend

# Copy backend dependency files
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source code
COPY backend/ ./

# Copy built frontend from Stage 1 to backend/public
COPY --from=frontend-build /app/frontend/dist ./public

# Hugging Face Spaces expect port 7860
EXPOSE 7860
ENV PORT=7860

# Start the application
CMD ["node", "server.js"]
