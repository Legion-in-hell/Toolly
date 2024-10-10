import React, { useState, useCallback } from "react";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);

  const handleAddTodo = useCallback(() => {
    if (input.trim()) {
      if (editIndex >= 0) {
        setTodos((prev) =>
          prev.map((todo, index) => (index === editIndex ? input : todo))
        );
        setEditIndex(-1);
      } else {
        setTodos((prev) => [...prev, input]);
      }
      setInput("");
    }
  }, [input, editIndex]);

  const handleDeleteTodo = useCallback((index) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEditTodo = useCallback(
    (index) => {
      setInput(todos[index]);
      setEditIndex(index);
    },
    [todos]
  );

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  return (
    <div>
      <TextField
        value={input}
        onChange={handleInputChange}
        placeholder="Enter a todo"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button onClick={handleAddTodo} variant="contained" color="primary">
        {editIndex >= 0 ? "Update Todo" : "Add Todo"}
      </Button>
      <List>
        {todos.map((todo, index) => (
          <ListItem key={index}>
            <ListItemText primary={todo} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditTodo(index)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeleteTodo(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default TodoList;
