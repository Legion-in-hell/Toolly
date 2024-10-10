import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import TopBar from "./TopBar";
import NavigationPanel from "./NavigationPanel";
import PostItBoard from "./PostIt";
import { api } from "../axios";

function IdeaBox() {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState("");

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const response = await api.get("/ideas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setIdeas(response.data);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    }
  };

  const handleAddIdea = async () => {
    if (newIdea.trim() === "") return;

    try {
      await api.post(
        "/ideas",
        { content: newIdea },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNewIdea("");
      fetchIdeas();
    } catch (error) {
      console.error("Error adding idea:", error);
    }
  };

  return (
    <>
      <TopBar />
      <NavigationPanel />
      <Box sx={{ display: "flex", marginLeft: "300px", marginTop: "30px" }}>
        <div style={{ display: "flex", flex: 1, height: "100vh" }}>
          <Box sx={{ flex: 1, paddingRight: "20px" }}>
            <Paper elevation={3} sx={{ padding: "20px", marginBottom: "20px" }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Nouvelle idée"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddIdea}
              >
                Ajouter une idée
              </Button>
            </Paper>
            <Paper elevation={3} sx={{ padding: "20px" }}>
              <List>
                {ideas.map((idea, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={idea.content} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
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

export default IdeaBox;
