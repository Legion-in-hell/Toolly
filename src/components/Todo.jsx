import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { api } from "../axios";
import MuiAlert from "@mui/material/Alert";
import { useParams } from "react-router-dom";

const API_URL = "/todos";

function Todo() {
  const { folderId } = useParams();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    Title: "",
    Description: "",
    Deadline: "",
    Link: "",
  });
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchTodos = useCallback(async () => {
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
  }, [folderId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setNewTodo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1048576) {
      setFile(file);
    } else {
      setError("File is too large. Max size is 1MB.");
    }
  }, []);

  const handleAddOrUpdateTodo = useCallback(async () => {
    if (newTodo.Title.trim() === "" || newTodo.Title.length > 30) {
      setError("The title must be filled and not exceed 30 characters.");
      return;
    }

    const formData = new FormData();
    Object.entries(newTodo).forEach(([key, value]) =>
      formData.append(key, value)
    );
    formData.append("FolderId", folderId);
    if (file) formData.append("File", file);

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
      setOpenDialog(false);
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
  }, [newTodo, editingTodoId, file, folderId, fetchTodos]);

  const handleEditTodo = useCallback((todo) => {
    setNewTodo({
      Title: todo.Title,
      Description: todo.Description,
      Deadline: todo.Deadline,
      Link: todo.Link,
    });
    setFile(todo.file);
    setEditingTodoId(todo.id);
    setOpenDialog(true);
  }, []);

  const handleDeleteTodo = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    try {
      await api.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Failed to delete task. Please try again.");
    }
  }, []);

  const handleCompleteTodo = useCallback(
    async (id) => {
      const token = localStorage.getItem("token");
      const todo = todos.find((todo) => todo.id === id);
      const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

      try {
        await api.put(`${API_URL}/${id}`, updatedTodo, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
      } catch (error) {
        console.error("Error updating todo:", error);
        setError("Failed to update task status. Please try again.");
      }
    },
    [todos]
  );

  const sortedTodos = useMemo(() => {
    return [...todos].sort(
      (a, b) => new Date(a.Deadline) - new Date(b.Deadline)
    );
  }, [todos]);

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="outlined" onClick={() => setOpenDialog(true)}>
        Add New Todo
      </Button>

      <TodoDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        todo={newTodo}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onSubmit={handleAddOrUpdateTodo}
        isEditing={!!editingTodoId}
        isLoading={isLoading}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <MuiAlert severity="error" onClose={() => setSnackbarOpen(false)}>
          {error}
        </MuiAlert>
      </Snackbar>

      <TableContainer component={Paper} sx={{ maxHeight: 800 }}>
        <Table stickyHeader aria-label="todo table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell align="right">Deadline</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTodos.map((todo) => (
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

const TodoDialog = React.memo(
  ({
    open,
    onClose,
    todo,
    onInputChange,
    onFileChange,
    onSubmit,
    isEditing,
    isLoading,
  }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditing ? "Edit Todo" : "Add New Todo"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Title"
          type="text"
          fullWidth
          variant="outlined"
          name="Title"
          value={todo.Title}
          onChange={onInputChange}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          name="Description"
          value={todo.Description}
          onChange={onInputChange}
        />
        <TextField
          margin="dense"
          label="Deadline"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          name="Deadline"
          value={todo.Deadline}
          onChange={onInputChange}
        />
        <TextField
          margin="dense"
          label="Link"
          type="text"
          fullWidth
          name="Link"
          value={todo.Link}
          onChange={onInputChange}
        />
        <Button variant="contained" component="label">
          Upload File
          <input type="file" hidden onChange={onFileChange} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : isEditing ? (
            "Update"
          ) : (
            "Add"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
);

const TodoRow = React.memo(({ todo, onEdit, onDelete, onComplete }) => {
  const [open, setOpen] = useState(false);
  const deadlinetodo = new Date(todo.Deadline).toLocaleDateString("fr-CA");

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell component="th" scope="row">
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
      {open && (
        <TableRow>
          <TableCell colSpan={6}>
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
          </TableCell>
        </TableRow>
      )}
    </>
  );
});

export default Todo;
