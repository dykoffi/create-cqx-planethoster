FROM dykoffi/node:alpine

# Set ENV variables
ENV DATABASE_URL=

# Copy package.json file
RUN mkdir /App
COPY package.json /App
WORKDIR /App

# install all nodejs package
RUN yarn install --prod

COPY build /App
RUN prisma generate

# Expose port for communication
EXPOSE 80

# update database url info
CMD echo "DATABASE_URL=${DATABASE_URL}" > .env \
    && prisma migrate deploy \
    && NODE_ENV=production pm2-runtime index.js --name <%= apiname %>