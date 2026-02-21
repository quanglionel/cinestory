FROM node:20-slim

WORKDIR /app

# Cài đặt các công cụ cần thiết toàn cục (để npx có thể tìm thấy nếu cần)
RUN npm install -g concurrently nodemon browser-sync

COPY package*.json ./
RUN npm install --include=dev

COPY . .

# Port 5000 cho API Express, 3000 cho BrowserSync (Hot Reload)
EXPOSE 5000 3000 3001

# Chạy server với nodemon
CMD ["npm", "run", "dev"]
