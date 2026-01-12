# habit-tracker-api/Dockerfile
FROM oven/bun:1.3.5
WORKDIR /app

# IMPORTANT: Add the * after bun.lockb
COPY package.json bun.lockb* ./ 
# To this (adding --no-save ensures it installs without complaining about lockfile changes):
RUN bun install --no-save
COPY . .

ENV PORT=3000
ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
