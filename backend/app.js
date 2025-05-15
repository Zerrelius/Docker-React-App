const express = require("express");
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');

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

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
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
    
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
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
    const todos = await prisma.todos.findMany({
      where: { deleted: false }
    });
    // Transformiere die Daten für das Frontend
    const transformedTodos = todos.map(todo => ({
      id: todo.id,
      title: todo.task,        // task -> title
      completed: todo.completed
    }));
    res.json(transformedTodos);
  } catch (error) {
    console.error('Error loading todos:', error);
    res.status(500).json({ message: "Error loading todos" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const todo = await prisma.todos.update({
      where: { id: parseInt(req.params.id) },
      data: {
        task: req.body.title,  // title -> task
        completed: req.body.completed,
        updatedAt: new Date()
      }
    });
    // Transformiere die Antwort
    const transformedTodo = {
      id: todo.id,
      title: todo.task,        // task -> title
      completed: todo.completed
    };
    res.json(transformedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: "Error updating todo" });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    if (!req.body.title || typeof req.body.title !== 'string') {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Title is required and must be a string' 
      });
    }

    const todo = await prisma.todos.create({
      data: {
        task: req.body.title,  // title -> task
        userId: 1
      }
    });
    // Transformiere die Antwort
    const transformedTodo = {
      id: todo.id,
      title: todo.task,        // task -> title
      completed: todo.completed
    };
    res.status(201).json(transformedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: "Error creating todo" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    await prisma.todos.update({
      where: { id: parseInt(req.params.id) },
      data: {
        deleted: true,
        deletedAt: new Date(),
        deletedById: 1 // Temporär fester User
      }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: "Error deleting todo" });
  }
});

// Not Found Handler
app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found'
    });
  });

// Server starten mit explizitem Host-Binding
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
