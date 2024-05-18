import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";
import { api } from "../axios";
import { format } from "date-fns";
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
  Typography,
  Link,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import PostItBoard from "./PostIt";

function Dashboard() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedTodos = response.data.sort((a, b) => {
          return a.Deadline.localeCompare(b.Deadline);
        });
        setTodos(sortedTodos);
      } catch (error) {
        console.error("Error fetching todos:", error);
        setError("Une erreur est survenue lors du chargement des tâches.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex", marginLeft: "300px", marginTop: "30px" }}>
        <div style={{ display: "flex", flex: 1, height: "100vh" }}>
          <div
            style={{
              flex: 1,
              paddingRight: "2px",
              borderRight: "0px solid #ccc",
            }}
          >
            <Box sx={{ display: "flex" }}>
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="todo table">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>Titre</TableCell>
                      <TableCell align="right">Échéance</TableCell>
                      <TableCell align="right">Actions</TableCell>{" "}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todos.map((todo) => (
                      <TodoRow key={todo.TodoID} todo={todo} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </div>
          <div
            style={{
              flex: 1,
              marginRight: "10px",
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            <PostItBoard />
          </div>
        </div>
      </Box>
    </>
  );
}

function TodoRow({ todo }) {
  const [open, setOpen] = useState(false);

  let deadlinetodo;
  if (todo.Deadline) {
    deadlinetodo = format(new Date(todo.Deadline), "dd/MM/yyyy");
  }

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" }, id: "todo-row" }}>
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

export default Dashboard;
