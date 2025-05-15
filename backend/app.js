const express = require("express");
const cors = require("cors");
const logger = require('./utils/logger');
const { prisma, connectWithRetry } = require('./utils/dbConnection');
const { handlePrismaError } = require('./utils/errorHandler');

// Prisma Client initialisieren
const prisma = new PrismaClient();

// Initialisierung von Express
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost", "http://frontend"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

// Middleware für Form Data
app.use(cors(corsOptions));
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Initialisieren der Grund Route
app.get("/", (request, response) => {
  response.send("Nothing to see - go away!");
});

// Health Check Route
app.get("/api/health", async (req, res) => {
  try {
    // Prüfe Datenbankverbindung
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Health check passed');
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Database connection failed"
    });
  }
});

// API Endpunkte für Todos
app.get("/api/todos", async (req, res) => {
  try {
    logger.info('Fetching all todos');
    const todos = await prisma.todos.findMany({
      where: { deleted: false }
    });

    // Prüfe ob Todos existieren
    if (!todos || todos.length === 0) {
      logger.warn('No todos found');
      return res.status(404).json({
        error: 'No todos found',
        message: 'Es wurden keine Todos gefunden'
      });
    }

    // Transformiere die Daten für das Frontend
    const transformedTodos = todos.map(todo => ({
      id: todo.id,
      title: todo.task,        // task -> title
      completed: todo.completed
    }));
    logger.info('Successfully fetched todos', { count: todos.length });
    res.json(transformedTodos);

    // Error Handler
  } catch (error) {
    if (error.name === 'PrismaClientKnownRequestError') {
      const { status, message } = handlePrismaError(error);
      logger.error('Database error', { 
        code: error.code,
        message: error.message 
      });
      return res.status(status).json({ error: message });
    }

    logger.error('Unexpected error', { error });
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Ein unerwarteter Fehler ist aufgetreten' 
    });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    if (isNaN(todoId)) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Invalid ID format' 
      });
    }

    logger.info('Updating todo', { todoId, updates: req.body });

    const todo = await prisma.todos.update({
      where: { id: todoId },
      data: {
        task: req.body.title,
        completed: req.body.completed,
        updatedAt: new Date()
      }
    });

    // Transformiere die Daten für das Frontend
    const transformedTodo = {
      id: todo.id,
      title: todo.task,
      completed: todo.completed
    };
    logger.info('Successfully updated todo', { todoId });
    res.json(transformedTodo);

    // Error Handler
  } catch (error) {
    if (error.name === 'PrismaClientKnownRequestError') {
      const { status, message } = handlePrismaError(error);
      logger.error('Database error', { code: error.code, message: error.message });
      return res.status(status).json({ error: message });
    }
    
    logger.error('Failed to update todo', {
      todoId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Fehler beim Aktualisieren des Todos' 
    });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    logger.info('Creating new todo', { title: req.body.title });

    if (!req.body.title || typeof req.body.title !== 'string') {
      logger.warn('Invalid todo creation attempt', { 
        receivedData: req.body 
      });
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Title is required and must be a string' 
      });
    }

    const todo = await prisma.todos.create({
      data: {
        task: req.body.title
      }
    });

    const transformedTodo = {
      id: todo.id,
      title: todo.task,
      completed: todo.completed
    };
    logger.info('Successfully created todo', { todoId: todo.id });
    res.status(201).json(transformedTodo);
  } catch (error) {
    logger.error('Failed to create todo', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Error creating todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    logger.info('Soft deleting todo', { todoId });

    await prisma.todos.update({
      where: { id: todoId },
      data: {
        deleted: true,
        deletedAt: new Date()
      }
    });
    logger.info('Successfully deleted todo', { todoId });
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete todo', {
      todoId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: "Error deleting todo" });
  }
});

// Not Found Handler
app.use((req, res) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method
  });
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

const startServer = async () => {
  try {
    await connectWithRetry();
    
    app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
