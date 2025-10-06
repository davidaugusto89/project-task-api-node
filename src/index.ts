import { sequelize } from './models';
import { app } from './server';

async function start() {
  await sequelize.authenticate();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API running on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
