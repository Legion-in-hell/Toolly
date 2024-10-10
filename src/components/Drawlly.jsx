import React, { useState, useCallback } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";
import { api } from "../axios";

function Drawlly() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportName, setExportName] = useState("");
  const [exportLocation, setExportLocation] = useState("folder");
  const [folders, setFolders] = useState([]);

  const handleExportClick = useCallback(() => {
    setIsExportDialogOpen(true);
  }, []);

  const handleExportClose = useCallback(() => {
    setIsExportDialogOpen(false);
    setExportName("");
    setExportLocation("folder");
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await api.get("/folders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, []);

  const handleExportConfirm = useCallback(async () => {
    if (!excalidrawAPI || !exportName) return;

    try {
      const blob = await exportToBlob({
        elements: excalidrawAPI.getSceneElements(),
        mimeType: "image/png",
        appState: excalidrawAPI.getAppState(),
      });

      const formData = new FormData();
      formData.append("file", blob, `${exportName}.png`);
      formData.append("name", exportName);
      formData.append("location", exportLocation);

      if (exportLocation === "folder") {
        formData.append("folderId", folders[0].id); // Replace with selected folder ID
      }

      await api.post("/drawings", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      handleExportClose();
    } catch (error) {
      console.error("Error exporting drawing:", error);
    }
  }, [excalidrawAPI, exportName, exportLocation, folders, handleExportClose]);

  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ marginLeft: "300px", marginTop: "30px" }}>
        <Button onClick={handleExportClick} variant="contained" color="primary">
          Export Drawing
        </Button>
        <div style={{ height: "800px" }}>
          <Excalidraw theme="dark" ref={(api) => setExcalidrawAPI(api)} />
        </div>
      </Box>
      <Dialog open={isExportDialogOpen} onClose={handleExportClose}>
        <DialogTitle>Export Drawing</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Drawing Name"
            fullWidth
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
          />
          <Select
            value={exportLocation}
            onChange={(e) => setExportLocation(e.target.value)}
            fullWidth
            margin="dense"
          >
            <MenuItem value="folder">Folder</MenuItem>
            <MenuItem value="ideabox">IdeaBox</MenuItem>
          </Select>
          {exportLocation === "folder" && (
            <Select
              value={folders[0]?.id || ""}
              onChange={(e) => {
                /* Handle folder selection */
              }}
              fullWidth
              margin="dense"
            >
              {folders.map((folder) => (
                <MenuItem key={folder.id} value={folder.id}>
                  {folder.name}
                </MenuItem>
              ))}
            </Select>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportClose}>Cancel</Button>
          <Button onClick={handleExportConfirm}>Export</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Drawlly;
