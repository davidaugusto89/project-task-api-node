import { app } from './server';

async function start() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API iniciada na porta :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Erro ao iniciar a API:', err);
  process.exit(1);
});
