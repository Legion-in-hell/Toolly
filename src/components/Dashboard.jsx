import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Typography,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";
import PostItBoard from "./PostIt";
import { api } from "../axios";

function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      setIsLoading(true);
      const response = await api.get("/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedTodos = response.data.sort((a, b) =>
        a.Deadline.localeCompare(b.Deadline)
      );
      setTodos(sortedTodos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Une erreur est survenue lors du chargement des tâches.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleEdit = useCallback((todo) => {
    // Implement edit functionality
    console.log("Edit todo:", todo);
  }, []);

  const handleComplete = useCallback(
    async (id) => {
      try {
        const todo = todos.find((t) => t.TodoID === id);
        const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };
        await api.put(`/todos/${id}`, updatedTodo, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTodos((prevTodos) =>
          prevTodos.map((t) => (t.TodoID === id ? updatedTodo : t))
        );
      } catch (error) {
        console.error("Error completing todo:", error);
        setError("Une erreur est survenue lors de la mise à jour de la tâche.");
      }
    },
    [todos]
  );

  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/todos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTodos((prevTodos) => prevTodos.filter((t) => t.TodoID !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Une erreur est survenue lors de la suppression de la tâche.");
    }
  }, []);

  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex", marginLeft: "300px", marginTop: "30px" }}>
        <div style={{ display: "flex", flex: 1, height: "100vh" }}>
          <div style={{ flex: 1, paddingRight: "2px" }}>
            {isLoading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="todo table">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Titre</TableCell>
                      <TableCell align="right">Échéance</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todos.map((todo) => (
                      <TodoRow
                        key={todo.TodoID}
                        todo={todo}
                        onEdit={handleEdit}
                        onComplete={handleComplete}
                        onDelete={handleDelete}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
          <div
            style={{
              flex: 1,
              marginRight: "10px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <PostItBoard />
          </div>
        </div>
      </Box>
    </>
  );
}

const TodoRow = React.memo(({ todo, onEdit, onComplete, onDelete }) => {
  const [open, setOpen] = useState(false);
  const deadlinetodo = todo.Deadline
    ? format(new Date(todo.Deadline), "dd/MM/yyyy")
    : "";

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {todo.Title}
        </TableCell>
        <TableCell align="right">{deadlinetodo}</TableCell>
        <TableCell align="right">
          <IconButton onClick={() => onEdit(todo)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => onComplete(todo.TodoID)}>
            <CheckCircleIcon
              color={todo.isCompleted ? "primary" : "disabled"}
            />
          </IconButton>
          <IconButton onClick={() => onDelete(todo.TodoID)}>
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
});

export default Dashboard;
