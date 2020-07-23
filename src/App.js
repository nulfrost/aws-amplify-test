import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import { API } from "aws-amplify";
import "./App.css";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { listTodos } from "./graphql/queries";
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "./graphql/mutations";

const initialFormState = { name: "", description: "" };

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const apiData = await API.graphql({ query: listTodos });
    setTodos(apiData.data.listTodos.items);
  }

  async function createTodo() {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createTodoMutation,
      variables: { input: formData },
    });
    setTodos([...todos, formData]);
    setFormData(initialFormState);
  }

  async function deleteTodo({ id }) {
    const newNotesArray = todos.filter((note) => note.id !== id);
    setTodos(newNotesArray);
    await API.graphql({
      query: deleteTodoMutation,
      variables: { input: { id } },
    });
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Todo name"
        value={formData.name}
      />
      <input
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Todo description"
        value={formData.description}
      />
      <button onClick={createTodo}>Create Note</button>
      <div style={{ marginBottom: 30 }}>
        {todos.map((note) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            <button onClick={() => deleteTodo(note)}>Delete todo</button>
          </div>
        ))}
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
