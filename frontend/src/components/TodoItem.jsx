import useStore from "./todoStore";

function TodoItem(props) {
    const { toggleTodo, deleteTodo } = useStore();
    
    return (
        <div className="flex justify-between items-center border rounded-xl bg-gradient-to-br from-slate-800 to-gray-600 mb-2 text-white p-2">
            <input 
                type="checkbox" 
                onChange={() => toggleTodo(props.todo.id)} 
                checked={props.todo.completed} 
                className="size-6 hover:cursor-pointer" 
            />
            
            <span className={`border rounded-xl p-2 px-4 text-xl ${
                props.todo.completed ? "bg-red-500 line-through" : "bg-gray-900"
            }`}>
                To-Do: {props.todo.title}
            </span>

            <button 
                onClick={() => deleteTodo(props.todo.id)} 
                className="p-2 border bg-red-500 hover:bg-red-600 hover:cursor-pointer rounded"
            >
                Löschen
            </button>
        </div>
    )
}

export default TodoItem;