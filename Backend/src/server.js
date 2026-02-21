import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

let users = [];
let todos = [];

const typeDefs = `
  type User {
    id: ID!
    name: String!
  }

  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    user: User
  }

  type Query {
    todos(userId: ID): [Todo!]!
    getTodoByIndex(id:ID!):Todo!
    users: [User!]!
  }

  type Mutation {
    addTodo(task: String!, userId: ID!): Todo!
    markTaskCompleted(id: ID!): Todo!
    deleteTodoById(id:ID!):Todo!
    addUser(name: String!): User!
  }
`;

const resolvers = {
  Query: {
    todos: (_, { userId }) =>
      userId ? todos.filter((t) => t.userId === userId) : todos,
    getTodoByIndex: (parent, args, context, info) => {
      return todos[parseInt(args.id)];
    },
    users: () => users,
  },
  Todo: {
    user: (parent) => users.find((u) => u.id === parent.userId),
  },
  Mutation: {
    addUser: (_, { name }) => {
      const existing = users.find((u) => u.name === name);
      if (existing) return existing;
      const newUser = { id: String(users.length + 1), name };
      users.push(newUser);
      return newUser;
    },
    addTodo: (_, { task, userId }) => {
      const user = users.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");
      const newTodo = {
        id: String(todos.length + 1),
        task,
        completed: false,
        userId,
      };
      todos.push(newTodo);
      return newTodo;
    },
    markTaskCompleted: (_, { id }) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) throw new Error("Todo not found");

      todo.completed = true;
      return todo;
    },
    deleteTodoById: (parent, args, context, info) => {
      const todo = todos.find((todo) => todo.id === args.id);
      if (!todo) throw new Error("Todo not found");
      todos = todos.filter((todo) => todo.id !== args.id);
      return todo;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

const app = express();

app.use("/graphql", cors(), express.json(), expressMiddleware(server));

app.listen(4000, () => {
  console.log("🚀 Server ready at http://localhost:4000/graphql");
});
