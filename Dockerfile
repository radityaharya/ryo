FROM oven/bun:latest
WORKDIR /app
COPY package.json .
RUN bun install
COPY . .
EXPOSE 3000
ENV PORT=3000
ENTRYPOINT ["bun", "docker-entrypoint.js"]