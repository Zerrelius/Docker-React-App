import React from "react";
import useStore from "./todoStore";

function TodoForm() {
  const [inputValue, setInputValue] = React.useState("");
  const { addTodo, setNewTodo } = useStore();

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return;
      
      setNewTodo(inputValue);
      await addTodo(); // Warten auf die async Funktion
      setInputValue("");
  };

  return (
      <form
          className="flex justify-between items-center border p-2 w-1/2 bg-gradient-to-br from-sky-800 to-green-800"
          onSubmit={handleSubmit}
      >
          <input
              type="text"
              name="todoText"
              id="todoText"
              placeholder="Aufgabe hinzufügen"
              className="border p-2 rounded-xl bg-white placeholder-slate-500 w-1/2 text-black"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
          />
          <button
              type="submit"
              className="p-2 font-bold text-white bg-blue-500 hover:bg-blue-600 hover:cursor-pointer border rounded-xl w-20"
          >
              Add
          </button>
      </form>
  );
}

export default TodoForm;
