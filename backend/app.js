const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

// Initialisierung von Express
const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:8080", "http://localhost:80"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

// Middleware für Form Data
app.use(cors(corsOptions));
app.use(express.json());

// Hilfsfunktion zum Lesen/Schreiben der Todos
const todosPath = path.join(__dirname, "todos.json");

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  });

async function readTodos() {
  try {
    const data = await fs.readFile(todosPath, "utf8");
    return JSON.parse(data).todos;
  } catch (error) {
    return [];
  }
}

async function writeTodos(todos) {
  await fs.writeFile(todosPath, JSON.stringify({ todos }, null, 2), "utf8");
}

// Initialisieren der Grund Route
app.get("/", (request, response) => {
  response.send("Nothing to see - go away!");
});

// Health Check Route hinzufügen
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// API Endpunkte für Todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Error loading todos" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
    try {
      if (req.body.completed !== undefined && typeof req.body.completed !== 'boolean') {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Completed status must be a boolean'
        });
      }
  
      const todos = await readTodos();
      const id = parseInt(req.params.id);
      const todoIndex = todos.findIndex((t) => t.id === id);
  
      if (todoIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Todo not found'
        });
      }
  
      todos[todoIndex] = { 
        ...todos[todoIndex], 
        ...req.body,
        id: id // Verhindert Änderung der ID
      };
      
      await writeTodos(todos);
      res.json(todos[todoIndex]);
    } catch (error) {
      console.error('Error updating todo:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error updating todo'
      });
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
  
      const todos = await readTodos();
      const newTodo = {
        id: Date.now(),
        title: req.body.title.trim(),
        completed: false,
      };
      
      todos.push(newTodo);
      await writeTodos(todos);
      res.status(201).json(newTodo);
    } catch (error) {
      console.error('Error creating todo:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Error creating todo' 
      });
    }
  });

  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const todos = await readTodos();
      const id = parseInt(req.params.id);
      const todoExists = todos.some(t => t.id === id);
  
      if (!todoExists) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Todo not found'
        });
      }
  
      const newTodos = todos.filter((t) => t.id !== id);
      await writeTodos(newTodos);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting todo:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error deleting todo'
      });
    }
  });

// Not Found Handler
app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found'
    });
  });

// Server starten
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
