import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
} from "@mui/material";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import FolderIcon from "@mui/icons-material/Folder";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode";

function Dashboard() {
  const [folders, setFolders] = useState([]);
  const API_BASE_URL = "http://localhost:3001";

  const getAuthenticatedUserId = () => {
    const token = localStorage.getItem("authToken");

    if (!token) return null;

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/folders`);
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders", error);
    }
  };

  const handleAddFolder = async () => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      console.error("User is not authenticated");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/folders`, {
        name: `Dossier ${folders.length + 1}`,
        userId: userId,
      });
      fetchFolders();
    } catch (error) {
      console.error("Error adding folder", error);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/folders/${folderId}`);
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder", error);
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      await axios.put(`${API_BASE_URL}/api/folders/${folderId}`, { newName });
      fetchFolders();
      setRenamingFolder(null);
    } catch (error) {
      console.error("Error renaming folder", error);
    }
  };

  const drawerWidth = 277;

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    overflowX: "hidden",
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  }));

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          marginLeft: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            Toolly Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent">
        <List>
          {folders.map((folder) => (
            <ListItem
              button
              key={folder.id}
              component={Link}
              to={`/${folder.id}`}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary={folder.name} />
              <ListItemIcon onClick={() => setRenamingFolder(folder)}>
                <EditIcon />
              </ListItemIcon>
              <ListItemIcon onClick={() => handleDeleteFolder(folder.id)}>
                <DeleteIcon />
              </ListItemIcon>
            </ListItem>
          ))}
          <ListItem button onClick={handleAddFolder}>
            <ListItemIcon>
              <AddBoxIcon />
            </ListItemIcon>
            <ListItemText primary="Créer un nouveau dossier" />
          </ListItem>
        </List>
      </Drawer>
      <Dialog
        open={Boolean(renamingFolder)}
        onClose={() => setRenamingFolder(null)}
      >
        <DialogTitle>{"Renommer le dossier"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nouveau nom du dossier"
            type="text"
            fullWidth
            variant="outlined"
            value={renamingFolder ? renamingFolder.name : ""}
            onChange={(e) =>
              setRenamingFolder({ ...renamingFolder, name: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenamingFolder(null)}>Annuler</Button>
          <Button
            onClick={() =>
              handleRenameFolder(renamingFolder.id, renamingFolder.name)
            }
          >
            Renommer
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, marginLeft: `${drawerWidth}px` }}
      >
        <Routes>
          {folders.map((folder) => (
            <Route
              key={folder.id}
              path={`/${folder.id}`}
              element={
                <Typography paragraph>
                  Contenu du dossier: {folder.name}
                </Typography>
              }
            />
          ))}
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;
