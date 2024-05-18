import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { api } from "../axios";
import MuiAlert from "@mui/material/Alert";
import { useParams } from "react-router-dom";

const API_URL = "/todos";

function Todo() {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    Title: "",
    Description: "",
    Deadline: "",
    Link: "",
    currentFolderId: setCurrentFolderId,
  });
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [link, setLink] = useState("");

  const { folderId } = useParams();
  useEffect(() => {
    setCurrentFolderId(folderId);
    fetchTodos();
  }, [folderId]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get(`${API_URL}/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Error loading tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setNewTodo({
      Title: "",
      Description: "",
      Deadline: "",
      Link: "",
    });
    setFile(null);
    setEditingTodoId(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTodo({
      Title: "",
      Description: "",
      Deadline: "",
      Link: "",
    });
    setFile(null);
    setEditingTodoId(null);
    setError(null);
  };

  const handleAddOrUpdateTodo = async () => {
    if (newTodo.Title.trim() === "" || newTodo.Title.length > 30) {
      setError("The title must be filled and not exceed 30 characters.");
      return;
    }

    const formData = new FormData();
    formData.append("Title", newTodo.Title);
    formData.append("Description", newTodo.Description);
    formData.append("Deadline", newTodo.Deadline);
    formData.append("Link", newTodo.Link);
    formData.append("FolderId", currentFolderId);
    if (file) {
      formData.append("File", file);
    }

    const token = localStorage.getItem("token");

    try {
      setIsLoading(true);
      if (editingTodoId) {
        await api.put(`${API_URL}/${editingTodoId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseDialog();
      fetchTodos();
    } catch (error) {
      console.error("Error adding/updating todo:", error);
      setError(
        error.response?.data?.error ||
          "An error occurred while adding/updating the task."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTodo = (todo) => {
    setNewTodo({
      Title: todo.Title,
      Description: todo.Description,
      Deadline: todo.Deadline,
    });
    setLink(todo.Link);
    setFile(todo.file);
    setEditingTodoId(todo.id);
    setOpenDialog(true);
  };

  const deleteTodoId = todos.id;

  const handleDeleteTodo = async (deleteTodoId) => {
    const token = localStorage.getItem("token");

    try {
      await api.delete(`${API_URL}/${deleteTodoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleCompleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    const todo = todos.find((todo) => todo.id === id);
    const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

    try {
      await api.put(`${API_URL}/${id}`, updatedTodo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error("Error updating todo:", error);
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
            value={newTodo.Title}
            onChange={(e) => setNewTodo({ ...newTodo, Title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTodo.Description}
            onChange={(e) =>
              setNewTodo({ ...newTodo, Description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTodo.Deadline}
            onChange={(e) =>
              setNewTodo({ ...newTodo, Deadline: e.target.value })
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
        {isLoading && <CircularProgress />}
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
  let deadlinetodo = todo.Deadline;
  deadlinetodo = new Date(deadlinetodo).toLocaleDateString("fr-CA");

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
        <TableCell
          component="th"
          scope="row"
          sx={{ maxHeight: "800", maxWidth: "800" }}
        >
          {todo.Title}
        </TableCell>
        <TableCell align="right">{deadlinetodo}</TableCell>
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
              <Typography>{todo.Description}</Typography>
              {todo.Link && (
                <Typography>
                  <Link
                    href={todo.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {todo.Link}
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
