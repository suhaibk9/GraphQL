import React, { useState } from "react";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { useQuery, useMutation, ApolloProvider } from "@apollo/client/react";
import "./App.css";

const client = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:4000/graphql" }),
  cache: new InMemoryCache(),
});

const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      task
      completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($task: String!) {
    addTodo(task: $task) {
      id
      task
      completed
    }
  }
`;
const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodoById(id: $id) {
      id
      task
      completed
    }
  }
`;
const MARK_COMPLETED = gql`
  mutation MarkTaskCompleted($id: ID!) {
    markTaskCompleted(id: $id) {
      id
      task
      completed
    }
  }
`;

function TodoApp() {
  const { loading, error, data } = useQuery(GET_TODOS, {
    fetchPolicy: "network-only",
  });
  const [addTodo] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [markTaskCompleted] = useMutation(MARK_COMPLETED);
  const [deleteTodoById] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const [taskName, setTaskName] = useState("");

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    addTodo({ variables: { task: taskName } });
    setTaskName("");
  };
  const handleDeleteTodo = (id) => {
    console.log(id);
    if (!id) return;
    deleteTodoById({ variables: { id } });
  };
  const handleMarkCompleted = (id) => {
    console.log(id);
    if (!id) return;
    markTaskCompleted({ variables: { id } });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Todo List</h2>
      <form
        onSubmit={handleAddTodo}
        style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
      >
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="New task..."
          style={{ flex: 1, padding: "5px" }}
        />
        <button type="submit" style={{ padding: "5px 10px" }}>
          Add
        </button>
      </form>

      <ul style={{ listStyleType: "none", padding: 0 }}>
        {data.todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #ccc",
              textDecoration: todo.completed ? "line-through" : "none",
              color: todo.completed ? "#888" : "#000",
            }}
          >
            <span>{todo.task}</span>
            {!todo.completed && (
              <button
                onClick={() => handleMarkCompleted(todo.id)}
                style={{ padding: "3px 8px", cursor: "pointer" }}
              >
                Complete
              </button>
            )}
            {!todo.completed && (
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                style={{ padding: "3px 8px", cursor: "pointer" }}
              >
                Delete Todo
              </button>
            )}
          </li>
        ))}
      </ul>
      {data.todos.length === 0 && <p>No todos yet!</p>}
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <TodoApp />
    </ApolloProvider>
  );
}

export default App;
