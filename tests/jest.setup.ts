jest.setTimeout(30_000);

jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return RedisMock;
});
