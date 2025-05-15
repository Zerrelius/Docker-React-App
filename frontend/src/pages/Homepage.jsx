import ErrorBoundary from "../components/ErrorBoundary.jsx";
import TodoList from "../components/TodoList.jsx";

function Homepage() {
    return (
        <ErrorBoundary>
            <TodoList />
        </ErrorBoundary>
    );
}
export default Homepage;