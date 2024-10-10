import React, { useState, useEffect, useCallback } from "react";
import Draggable from "react-draggable";
import { TextField, IconButton, Paper, SvgIcon } from "@mui/material";
import { useParams } from "react-router-dom";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import postItSVG from "./assets/postit.svg";
import { api } from "../axios";

const PostIt = React.memo(({ note, onDrag, onDelete, onEdit }) => {
  const [noteText, setNoteText] = useState(note.text);

  const handleTextChange = useCallback(
    (event) => {
      const text = event.target.value;
      const lineBreaks = text.split("\n").length;

      if (text.length <= 112 && lineBreaks <= 7 && text !== note.text) {
        setNoteText(text);
        onEdit(note.id, text);
      }
    },
    [note.id, note.text, onEdit]
  );

  const nodeRef = React.useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      defaultPosition={{ x: note.x, y: note.y }}
      onStop={(e, data) => onDrag(note.id, data.x, data.y)}
    >
      <Paper
        ref={nodeRef}
        style={{
          padding: 10,
          cursor: "grab",
          position: "absolute",
          width: 200,
          height: 200,
          backgroundImage: `url(${postItSVG})`,
          backgroundSize: "cover",
        }}
      >
        <IconButton
          onClick={() => onDelete(note.id)}
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            color: "red",
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          multiline
          fullWidth
          value={noteText}
          onChange={handleTextChange}
          style={{
            cursor: "text",
            marginTop: 15,
            height: "70%",
          }}
          InputProps={{
            style: {
              color: "black",
              fontSize: 16,
              fontWeight: 600,
              lineHeight: 1.2,
            },
          }}
        />
      </Paper>
    </Draggable>
  );
});

const PostItBoard = () => {
  const { folderId } = useParams();
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await api.get(`/postits/${folderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setError("Failed to load notes. Please try again.");
    }
  }, [folderId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async () => {
    try {
      const response = await api.post(
        "/postits",
        {
          text: "Nouveau post-it",
          x: -300,
          y: 300,
          folderId: folderId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotes((prevNotes) => [...prevNotes, response.data]);
    } catch (error) {
      console.error("Error adding note:", error);
      setError("Failed to add note. Please try again.");
    }
  }, [folderId]);

  const editNote = useCallback(
    async (id, newText) => {
      try {
        await api.put(
          `/postits/${id}`,
          {
            text: newText,
            x: notes.find((note) => note.id === id).x,
            y: notes.find((note) => note.id === id).y,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === id ? { ...note, text: newText } : note
          )
        );
      } catch (error) {
        console.error("Error updating note:", error);
        setError("Failed to update note. Please try again.");
      }
    },
    [notes]
  );

  const moveNote = useCallback(
    async (id, x, y) => {
      try {
        await api.put(
          `/postits/${id}`,
          {
            x: x,
            y: y,
            text: notes.find((note) => note.id === id).text,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === id ? { ...note, x, y } : note))
        );
      } catch (error) {
        console.error("Error moving note:", error);
        setError("Failed to move note. Please try again.");
      }
    },
    [notes]
  );

  const deleteNote = useCallback(async (id) => {
    try {
      await api.delete(`/postits/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
      setError("Failed to delete note. Please try again.");
    }
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <IconButton onClick={addNote} color="primary" aria-label="add">
        <NoteAddIcon />
      </IconButton>
      {notes.map((note) => (
        <PostIt
          key={note.id}
          note={note}
          onDrag={moveNote}
          onDelete={deleteNote}
          onEdit={editNote}
        />
      ))}
    </div>
  );
};

export default PostItBoard;
