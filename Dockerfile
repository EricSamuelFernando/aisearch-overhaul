FROM node:24-alpine AS production

ARG NODE_ENV=production
ARG PORT=8001

ENV NODE_ENV=${NODE_ENV}
ENV PORT=${PORT}
ENV AWS_LWA_READINESS_CHECK_PORT=${PORT}
ENV AWS_LWA_ENABLE=true
EXPOSE ${PORT}

WORKDIR /app

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

COPY ./.next/standalone ./

CMD ["node", "server.js"]
