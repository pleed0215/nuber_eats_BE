export const SERVER_HOST =
  process.env.NODE_ENV === 'dev'
    ? 'http://localhost:3000'
    : 'http://localhost:3000';