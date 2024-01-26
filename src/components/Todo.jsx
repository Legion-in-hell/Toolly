import React, { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Link,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MuiAlert from "@mui/material/Alert";
import axios from "axios";

const API_URL = "/api/todos";

function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleOpenDialog = () => {
    setNewTodo({
      title: "",
      description: "",
      deadline: "",
    });
    setLink("");
    setFile(null);
    setEditingTodoId(null);
    setOpenDialog(true);
  };

  const handleAddOrUpdateTodo = async () => {
    if (newTodo.title.trim() === "" || newTodo.title.length > 30) {
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("title", newTodo.title);
    formData.append("description", newTodo.description);
    formData.append("deadline", newTodo.deadline);
    formData.append("link", link);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const blob = new Blob([event.target.result], { type: file.type });
        formData.append("file", blob, file.name);
      };
      reader.readAsArrayBuffer(file);
    }

    // Récupérer le token JWT stocké localement
    const token = localStorage.getItem("token");

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // Add any other headers here if needed
        },
      };

      if (editingTodoId) {
        await axios.put(`${API_URL}/${editingTodoId}`, formData, config);
      } else {
        await axios.post(API_URL, formData, config);
      }

      // Update state logic
      handleCloseDialog();
    } catch (error) {
      console.error("Error adding/updating todo", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTodo({
      title: "",
      description: "",
      deadline: "",
    });
    setLink("");
    setFile(null);
    setEditingTodoId(null);
  };

  const handleEditTodo = (todo) => {
    setNewTodo({
      title: todo.title,
      description: todo.description,
      deadline: todo.deadline,
    });
    setLink(todo.link);
    setFile(todo.file);
    setEditingTodoId(todo.id);
    setOpenDialog(true);
  };

  const handleDeleteTodo = async (id) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la todo", error);
    }
  };

  const handleCompleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    const todo = todos.find((todo) => todo.id === id);
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

    try {
      await axios.put(`${API_URL}/${id}`, updatedTodo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la todo", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1048576) {
      setFile(file);
    } else {
      alert("File is too large. Max size is 1MB.");
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="outlined" onClick={handleOpenDialog}>
        Add New Todo
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingTodoId ? "Edit Todo" : "Add New Todo"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTodo.description}
            onChange={(e) =>
              setNewTodo({ ...newTodo, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTodo.deadline}
            onChange={(e) =>
              setNewTodo({ ...newTodo, deadline: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Link"
            type="text"
            fullWidth
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <Button variant="contained" component="label">
            Upload File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddOrUpdateTodo}>
            {editingTodoId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert severity="error" onClose={handleSnackbarClose}>
          Title should not exceed 30 characters.
        </MuiAlert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ maxHeight: "800" }}>
        <Table stickyHeader aria-label="todo table">
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
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
                onComplete={handleCompleteTodo}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function TodoRow({ todo, onEdit, onDelete, onComplete }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          id: "todo-row",
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
                  <Link
                    href={todo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {todo.link}
                  </Link>
                </Typography>
              )}
              {todo.file && <Typography>File: {todo.file.name}</Typography>}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default Todo;
