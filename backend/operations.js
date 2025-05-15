const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CRUD Operations für Todos
const todoOperations = {
  // Alle Todos abrufen
  getAllTodos: async () => {
    return await prisma.todos.findMany({
      where: {
        deleted: false
      }
    });
  },

  // Ein Todo erstellen
  createTodo: async (data) => {
    return await prisma.todos.create({
      data: {
        task: data.task,
        userId: data.userId,
      }
    });
  },

  // Ein Todo aktualisieren
  updateTodo: async (id, data) => {
    return await prisma.todos.update({
      where: { id },
      data: {
        task: data.task,
        completed: data.completed,
        updatedAt: new Date()
      }
    });
  },

  // Ein Todo löschen (Soft Delete)
  deleteTodo: async (id, userId) => {
    return await prisma.todos.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedById: userId
      }
    });
  }
};

module.exports = todoOperations;