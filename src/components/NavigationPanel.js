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
import { Routes, Route, Link, Navigate } from "react-router-dom";
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
import DashboardIcon from "@mui/icons-material/Dashboard";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import BrushIcon from "@mui/icons-material/Brush";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { styled } from "@mui/material/styles";
import { jwtDecode } from "jwt-decode";

export default function NavigationPanel() {
  const [folders, setFolders] = useState([]);
  const API_BASE_URL = "http://localhost:3000";

  const getAuthenticatedUserId = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      Navigate.push("/login");
    }

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
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/api/folders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders", error);
    }
  };

  const handleAddFolder = async () => {
    const userId = getAuthenticatedUserId();
    const token = localStorage.getItem("authToken");

    try {
      await axios.post(
        `${API_BASE_URL}/api/folders`,
        {
          name: `Dossier ${folders.length + 1}`,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchFolders();
    } catch (error) {
      console.error("Error adding folder", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    Navigate.push("/login");
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
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </List>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "400%",
            }}
          >
            <div style={{ flexGrow: 1 }}></div>
            <ListItem button component={Link} to="/ideabox">
              <ListItemIcon>
                <LightbulbIcon />
              </ListItemIcon>
              <ListItemText primary="Boîte à idée" />
            </ListItem>
            <ListItem button component={Link} to="/drawlly">
              <ListItemIcon>
                <BrushIcon />
              </ListItemIcon>
              <ListItemText primary="Drawlly" />
            </ListItem>
            <ListItem button onClick={handleLogout} sx={{ color: "red" }}>
              <ListItemIcon sx={{ color: "red" }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </div>
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