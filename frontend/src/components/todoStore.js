import { create } from "zustand";

// API URL aus Umgebungsvariable
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Prüfe ob API_URL gesetzt ist
if (!API_URL) {
  console.error('VITE_API_URL ist nicht definiert! Bitte .env Datei prüfen.');
}

const useStore = create((set, get) => ({
  todos: [],
  newTodo: "",
  error: null,

  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  fetchTodos: async () => {
    try {
      set({ error: null });
      const response = await fetch(`${API_URL}/todos`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const todos = await response.json();
      set({ todos });
    } catch (error) {
      const errorMessage = error.message === 'Failed to fetch' 
        ? 'Server nicht erreichbar'
        : error.message;
      
      set({ error: `Fehler beim Laden der Todos: ${errorMessage}` });
      console.error('Failed to fetch todos:', error);
    }
  },

  setNewTodo: (text) => set({ newTodo: text }),

  addTodo: async (title) => {
    try {
      set({ error: null });
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Erstellen des Todos');
      }

      const newTodo = await response.json();
      set(state => ({ 
        todos: [...state.todos, newTodo],
        newTodo: '' 
      }));
    } catch (error) {
      set({ error: error.message });
      console.error('Failed to add todo:', error);
    }
  },

  deleteTodo: async (id) => {
    try {
      set({ error: null });
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== id)
      }));
    } catch (error) {
      set({ 
        error: `Fehler beim Löschen des Todos: ${error.message}` 
      });
      console.error('Failed to delete todo:', error);
    }
  },

  toggleTodo: async (id) => {
    try {
      set({ error: null });
      const state = get();
      const todo = state.todos.find(t => t.id === id);
      
      if (!todo) {
        throw new Error('Todo nicht gefunden');
      }
  
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedTodo = await response.json();
      
      set(state => ({
        todos: state.todos.map(t => t.id === id ? updatedTodo : t)
      }));
    } catch (error) {
      set({ 
        error: `Fehler beim Aktualisieren des Todos: ${error.message}` 
      });
      console.error('Failed to update todo:', error);
    }
  },

}));

export default useStore;