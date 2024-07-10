FROM node:18-alpine
WORKDIR /app
RUN apk update && apk add curl git unzip
ADD "https://api.github.com/repos/Weebs-Kingdom/Yuki-Sora-Database/commits?per_page=1" latest_commit
RUN curl -sL "https://github.com/Weebs-Kingdom/Yuki-Sora-Database/archive/main.zip" -o yuki.zip && unzip yuki.zip
WORKDIR ./Yuki-Sora-Database-main
RUN npm install
ENTRYPOINT ["node", "index.js"]