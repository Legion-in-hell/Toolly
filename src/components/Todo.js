import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  TextField,
  Button,
  Card,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    deadline: "",
    link: "",
    file: null,
  });
  const [editingTodo, setEditingTodo] = useState(null);

  const handleSaveTodo = () => {
    if (editingTodo) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodo ? { ...newTodo, id: editingTodo } : todo
        )
      );
      setEditingTodo(null);
    } else {
      setTodos([...todos, { ...newTodo, id: Date.now(), isCompleted: false }]);
    }
    setNewTodo({
      title: "",
      description: "",
      deadline: "",
      link: "",
      file: null,
    });
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleEditTodo = (todo) => {
    setNewTodo(todo);
    setEditingTodo(todo.id);
  };

  const handleCompleteTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1048576) {
      // 1 Mo = 1048576 octets
      setNewTodo({ ...newTodo, file });
    } else {
      // Gérer l'erreur de taille de fichier
    }
  };

  useEffect(() => {
    setTodos((todos) => [
      ...todos.filter((todo) => !todo.isCompleted),
      ...todos.filter((todo) => todo.isCompleted),
    ]);
  }, [todos]);

  return (
    <Box sx={{ width: "100%", marginBottom: 2 }}>
      <Card
        variant="outlined"
        sx={{ padding: 2, borderRadius: 2, marginBottom: 3 }}
      >
        <Box
          component="form"
          sx={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          <TextField
            label="Title"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <TextField
            label="Description"
            value={newTodo.description}
            onChange={(e) =>
              setNewTodo({ ...newTodo, description: e.target.value })
            }
          />
          <TextField
            label="Deadline"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newTodo.deadline}
            onChange={(e) =>
              setNewTodo({ ...newTodo, deadline: e.target.value })
            }
          />
          <TextField
            label="Link"
            value={newTodo.link}
            onChange={(e) => setNewTodo({ ...newTodo, link: e.target.value })}
          />
          <input type="file" onChange={handleFileChange} />
          <Button variant="contained" onClick={handleSaveTodo}>
            {editingTodo ? "Update" : "Add"} Todo
          </Button>
        </Box>
      </Card>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: 400, borderRadius: 2, overflow: "auto" }}
      >
        <Table stickyHeader aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Title</TableCell>
              <TableCell align="right">Deadline</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onComplete={handleCompleteTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function TodoRow({ todo, onComplete, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset", borderRadius: "4px" },
          marginBottom: 1,
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {todo.title}
        </TableCell>
        <TableCell align="right">{todo.deadline}</TableCell>
        <TableCell align="right">
          <IconButton onClick={() => onEdit(todo)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onComplete(todo.id)}>
            <CheckCircleIcon
              color={todo.isCompleted ? "primary" : "disabled"}
            />
          </IconButton>
          <IconButton onClick={() => onDelete(todo.id)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Description
              </Typography>
              <Typography>{todo.description}</Typography>
              {todo.link && (
                <Typography>
                  <Link href={todo.link} target="_blank" rel="noopener">
                    {todo.link}
                  </Link>
                </Typography>
              )}
              {todo.file && (
                <Typography>Attached File: {todo.file.name}</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default Todo;
