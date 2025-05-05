// Code: TodoList Component
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import ErrorMessage from "./ErrorMessage";
import useStore from "./todoStore";

function TodoList() {
  const { todos, fetchTodos, error } = useStore();
  const [filteredTodos, setFilteredTodos] = useState(todos);
  const [loading, setLoading] = useState(true);

  // Lade Todos beim Komponenten-Mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        await fetchTodos();
      } catch (err) {
        console.error("Failed to load todos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTodos();
  }, []);

  // Update filtered todos wenn sich todos ändert
  useEffect(() => {
    setFilteredTodos(todos);
  }, [todos]);

  function TodoFilter(event) {
    setFilteredTodos(
      todos.filter((todo) =>
        todo.title.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  }

  return (
    // Todo List
    <div className="text-white mx-auto flex flex-col items-center">
      <h1 className="text-center mt-6 text-4xl font-bold border rounded-xl my-4 w-52 mx-auto">
        To-Do List
      </h1>

      {/* Error Anzeige */}
      {error && <ErrorMessage message={error} />}

      {/* Loading Anzeige */}
      {loading ? (
        <div className="text-center p-4">
          <p className="text-xl">Loading...</p>
        </div>
      ) : (
        <>
          <div className="border rounded-xl my-4 w-1/2 mx-auto flex items-center bg-gradient-to-br from-gray-600 to-slate-800">
            <Search className="mx-2" />
            <input
              type="text"
              className="w-full p-2 outline-none placeholder-gray-400"
              placeholder="Search todos ..."
              onChange={TodoFilter}
            />
          </div>

          {/* Keine Todos Nachricht */}
          {filteredTodos.length === 0 && !loading && (
            <p className="text-gray-400 text-center my-4">
              Keine Todos gefunden.
            </p>
          )}

          <ul className="w-3/4 mx-auto mb-4">
            {filteredTodos.map((todo) => (
              <li key={todo.id}>
                <TodoItem todo={todo} />
              </li>
            ))}
          </ul>
          <TodoForm />
        </>
      )}
    </div>
  );
}

export default TodoList;
