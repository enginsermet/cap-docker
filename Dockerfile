FROM node:22-alpine3.21

RUN mkdir -p /root && \
    echo 'root:x:0:0:root:/root:/bin/sh' > /etc/passwd

WORKDIR /app

RUN npm install @sap/cds
RUN npm install -g @sap/cds-dk

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]


