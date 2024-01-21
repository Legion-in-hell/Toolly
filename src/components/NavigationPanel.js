import React, { useState, useEffect } from "react";
import {
  Box,
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
import { useSnackbar } from "notistack";
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
  const { enqueueSnackbar } = useSnackbar();

  const getAuthenticatedUserId = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Navigate.push("/login");
    }

    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      enqueueSnackbar("Erreur décodage Token", { variant: "error" });
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
      const response = await axios.get(`${API_BASE_URL}/api/folders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFolders(response.data);
    } catch (error) {
      enqueueSnackbar("Erreur de récupération des dossiers", {
        variant: "error",
      });
      console.error("Error fetching folders", error);
    }
  };

  const handleAddFolder = async () => {
    const userId = getAuthenticatedUserId();

    try {
      await axios.post(
        `${API_BASE_URL}/api/newfolders`,
        {
          name: `Dossier ${folders.length + 1}`,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchFolders();
    } catch (error) {
      enqueueSnackbar("Erreur de création d'un dossier", { variant: "error" });
      console.error("Error adding folder", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    Navigate.push("/login");
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder", error);
      enqueueSnackbar("Erreur de suppresion d'un dossier", {
        variant: "error",
      });
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/folders/${folderId}`,
        { newName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchFolders();
      setRenamingFolder(null);
    } catch (error) {
      console.error("Error renaming folder", error);
      enqueueSnackbar("Erreur de renommage d'un dossier", { variant: "error" });
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
      <Drawer variant="permanent">
        <List>
          <ListItem button component={Link} to="*">
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
              to={`/folder/${folder.id}`}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary={folder.name} />
              <ListItemIcon
                style={{
                  justifyContent: "flex-end",
                  marginRight: "-20px",
                }}
                onClick={() => setRenamingFolder(folder)}
              >
                <EditIcon />
              </ListItemIcon>
              <ListItemIcon onClick={() => handleDeleteFolder(folder.id)}>
                <ListItemIcon
                  style={{ justifyContent: "flex-end", color: "red" }}
                  onClick={() => handleDeleteFolder(folder.id)}
                >
                  <DeleteIcon />
                </ListItemIcon>
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
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
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
