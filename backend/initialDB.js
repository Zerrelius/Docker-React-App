const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Starting database initialization...');

    await prisma.$connect();
    console.log('Database connection established');

    // Prüfe ob bereits Todos existieren
    const existingTodos = await prisma.todos.findMany();

    // Erstelle Test-Todo nur wenn keine existieren
    if (existingTodos.length === 0) {
      const todo = await prisma.todos.create({
        data: {
          task: 'Beispiel Todo'
        }
      });
      console.log('Test todo created:', todo);
    } else {
      console.log('Todos already exist');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Failed to initialize database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });