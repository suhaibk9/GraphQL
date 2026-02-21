import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

let todos = [];

const typeDefs = `
  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo!]!
    getTodoByIndex(id:ID!):Todo!
  }

  type Mutation {
    addTodo(task: String!): Todo!
    markTaskCompleted(id: ID!): Todo!
    deleteTodoById(id:ID!):Todo!
  }
`;

const resolvers = {
  Query: {
    todos: () => todos,
    getTodoByIndex: (parent, args, context, info) => {
      return todos[parseInt(args.id)];
    },
  },
  Mutation: {
    addTodo: (_, { task }) => {
      const newTodo = {
        id: String(todos.length + 1),
        task,
        completed: false,
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
