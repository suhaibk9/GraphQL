import React, { useState } from "react";
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client";
import { useQuery, useMutation, ApolloProvider } from "@apollo/client/react";
import "./App.css";

const client = new ApolloClient({
  link: new HttpLink({ uri: "http://localhost:4000/graphql" }),
  cache: new InMemoryCache(),
});

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`;

const ADD_USER = gql`
  mutation AddUser($name: String!) {
    addUser(name: $name) {
      id
      name
    }
  }
`;

const GET_TODOS = gql`
  query GetTodos($userId: ID) {
    todos(userId: $userId) {
      id
      task
      completed
      user {
        name
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($task: String!, $userId: ID!) {
    addTodo(task: $task, userId: $userId) {
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

function UserSelection({ onSelectUser }) {
  const { loading, data } = useQuery(GET_USERS);
  const [addUser] = useMutation(ADD_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });
  const [newUserName, setNewUserName] = useState("");

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    addUser({ variables: { name: newUserName } }).then((res) => {
      onSelectUser(res.data.addUser);
    });
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Select User</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {data?.users.map((u) => (
          <li key={u.id} style={{ marginBottom: "10px" }}>
            <button
              onClick={() => onSelectUser(u)}
              style={{ width: "100%", padding: "10px", cursor: "pointer" }}
            >
              {u.name}
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={handleAddUser}
        style={{ display: "flex", gap: "10px", marginTop: "20px" }}
      >
        <input
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="New user name..."
          style={{ flex: 1, padding: "5px" }}
        />
        <button
          type="submit"
          style={{ padding: "5px 10px", cursor: "pointer" }}
        >
          Create User
        </button>
      </form>
    </div>
  );
}

function TodoApp({ userId }) {
  const { loading, error, data } = useQuery(GET_TODOS, {
    variables: { userId },
    fetchPolicy: "network-only",
  });
  const [addTodo] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS, variables: { userId } }],
  });
  const [markTaskCompleted] = useMutation(MARK_COMPLETED);
  const [deleteTodoById] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS, variables: { userId } }],
  });
  const [taskName, setTaskName] = useState("");

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    addTodo({ variables: { task: taskName, userId } });
    setTaskName("");
  };
  const handleDeleteTodo = (id) => {
    if (!id) return;
    deleteTodoById({ variables: { id } });
  };
  const handleMarkCompleted = (id) => {
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
        <button
          type="submit"
          style={{ padding: "5px 10px", cursor: "pointer" }}
        >
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
                style={{
                  padding: "3px 8px",
                  cursor: "pointer",
                  marginLeft: "auto",
                  marginRight: "5px",
                }}
              >
                Complete
              </button>
            )}
            {!todo.completed && (
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                style={{ padding: "3px 8px", cursor: "pointer" }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
      {data.todos.length === 0 && <p>No todos yet!</p>}
    </div>
  );
}

function MainApp() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <UserSelection onSelectUser={setCurrentUser} />;
  }

  return (
    <div>
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        Logged in as: <strong>{currentUser.name}</strong>{" "}
        <button
          onClick={() => setCurrentUser(null)}
          style={{ marginLeft: "10px", padding: "5px 10px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <TodoApp userId={currentUser.id} />
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <MainApp />
    </ApolloProvider>
  );
}

export default App;
