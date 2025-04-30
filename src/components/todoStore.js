import { create } from "zustand";

const useStore = create((set) => ({
  todos: JSON.parse(localStorage.getItem("todos")) || [], // Lade gespeicherte Todos
  newTodo: "",
  setNewTodo: (text) => set({ newTodo: text }),
  addTodo: () =>
    set((state) => {
      // Überprüfe ob newTodo leer ist
      if (!state.newTodo.trim()) {
        return state; // Keine Änderung wenn leer
      }

      const newTodos = [
        ...state.todos,
        {
          id: Date.now(),
          title: state.newTodo.trim(), // Entferne Leerzeichen am Anfang/Ende
          completed: false,
        },
      ];
      localStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos, newTodo: "" };
    }),

  deleteTodo: (id) =>
    set((state) => {
      const newTodos = state.todos.filter((todo) => todo.id !== id);
      // Aktualisiere localStorage nach Löschen
      localStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos };
    }),

  toggleTodo: (id) =>
    set((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      // Aktualisiere localStorage nach Toggle
      localStorage.setItem("todos", JSON.stringify(newTodos));
      return { todos: newTodos };
    }),
}));

export default useStore;
