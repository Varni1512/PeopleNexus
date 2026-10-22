FROM node:20-alpine

WORKDIR /app

# Copy root and subpackage definitions
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN npm --prefix server install
RUN npm --prefix client install

# Copy application code
COPY . .

# Build frontend production bundle
RUN npm --prefix client run build

EXPOSE 8000

ENV PORT=8000
CMD ["npm", "run", "server"]
