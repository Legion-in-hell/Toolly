import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../axios";
import { useSnackbar } from "notistack";
import { jwtDecode } from "jwt-decode";
import {
  Folder as FolderIcon,
  Add as AddBoxIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  Lightbulb as LightbulbIcon,
  Brush as BrushIcon,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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

export default function NavigationPanel() {
  const [folders, setFolders] = useState([]);
  const [renamingFolder, setRenamingFolder] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const fetchFolders = useCallback(async () => {
    try {
      const response = await api.get(`/folders`, {
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
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const getAuthenticatedUserId = useMemo(() => {
    const token = localStorage.getItem("token");
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      enqueueSnackbar("Erreur décodage Token", { variant: "error" });
      console.error("Error decoding token:", error);
      return null;
    }
  }, [enqueueSnackbar]);

  const handleAddFolder = async () => {
    try {
      await api.post(
        `/newfolders`,
        {
          name: `Dossier ${folders.length + 1}`,
          userId: getAuthenticatedUserId,
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
    navigate("/login");
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await api.delete(`/folders/${folderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchFolders();
      navigate("/");
    } catch (error) {
      enqueueSnackbar("Erreur de suppression du dossier", { variant: "error" });
      console.error("Error deleting folder", error);
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    if (!newName || newName.length > 12) {
      enqueueSnackbar(
        !newName ? "Nom de dossier vide" : "Nom de dossier trop long",
        { variant: "error" }
      );
      return;
    }
    try {
      await api.put(
        `/folders/${folderId}`,
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
      enqueueSnackbar("Erreur de renommage d'un dossier", { variant: "error" });
      console.error("Error renaming folder", error);
    }
  };

  const renderFolderList = () => (
    <List>
      {folders.map((folder) => (
        <ListItem
          key={folder.id}
          button
          component={Link}
          to={`/folder/${folder.id}`}
          sx={{
            backgroundColor:
              location.pathname === `/folder/${folder.id}`
                ? "action.selected"
                : "inherit",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary={folder.name} />
          <ListItemIcon
            style={{
              justifyContent: "flex-end",
              position: "absolute",
              right: "50px",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setRenamingFolder(folder);
            }}
          >
            <EditIcon />
          </ListItemIcon>
          <ListItemIcon
            style={{ justifyContent: "flex-end", color: "red" }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteFolder(folder.id);
            }}
          >
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
  );

  return (
    <Box sx={{}}>
      <Drawer variant="permanent">
        <List>
          <ListItem
            button
            component={Link}
            to="/"
            sx={{
              backgroundColor:
                location.pathname === "/" ? "action.selected" : "inherit",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </List>
        {renderFolderList()}
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div style={{ flexGrow: 1 }}></div>
          <ListItem
            button
            component={Link}
            to="/ideabox"
            sx={{
              backgroundColor:
                location.pathname === "/ideabox"
                  ? "action.selected"
                  : "inherit",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <ListItemIcon>
              <LightbulbIcon />
            </ListItemIcon>
            <ListItemText primary="Boîte à idée" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/drawlly"
            sx={{
              backgroundColor:
                location.pathname === "/drawlly"
                  ? "action.selected"
                  : "inherit",
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
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
    </Box>
  );
}
