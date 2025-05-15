const { PrismaClient } = require('@prisma/client');

// Initialisiere Prisma mit Logging für besseres Debugging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  try {
    console.log('Starting database initialization...');

    // Prüfe ob Verbindung zur Datenbank besteht
    await prisma.$connect();
    console.log('Database connection established');

    // Prüfe ob Test-User bereits existiert
    let user = await prisma.users.findUnique({
      where: {
        email: 'test@example.com'
      }
    });

    // Erstelle Test-User nur wenn er nicht existiert
    if (!user) {
      user = await prisma.users.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          role: 'user'
        }
      });
      console.log('Test user created:', user);
    } else {
      console.log('Test user already exists');
    }

    // Prüfe ob bereits Todos existieren
    const existingTodos = await prisma.todos.findMany({
      where: {
        userId: user.id
      }
    });

    // Erstelle Test-Todo nur wenn keine existieren
    if (existingTodos.length === 0) {
      const todo = await prisma.todos.create({
        data: {
          task: 'Beispiel Todo',
          userId: user.id
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

// Führe die Initialisierung aus
main()
  .catch((e) => {
    console.error('Failed to initialize database:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      process.exit(1);
    }
  });