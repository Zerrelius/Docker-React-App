import React from "react";
import useStore from "./todoStore";

function TodoForm() {
    const [inputValue, setInputValue] = React.useState("");
  const { addTodo, setNewTodo } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    setNewTodo(inputValue);
    addTodo();
    setInputValue(""); // Clear the input field
  };

  return (
    // Todo Form
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
        onChange={(event) => setInputValue(event.target.value)}
        // onChange={(event) => {
        //   setNewTodo(event.target.value);
        // }}
      />
      <button
        onClick={addTodo}
        className="p-2 font-bold text-white bg-blue-500 hover:bg-blue-600 hover:cursor-pointer border rounded-xl w-20"
      >
        Add
      </button>
    </form>
  );
}

export default TodoForm;
