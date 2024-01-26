import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { TextField, IconButton, Paper, SvgIcon } from "@mui/material";
import { useParams } from "react-router-dom";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import postItSVG from "./assets/postit.svg";
import axios from "axios";

const PostIt = ({ note, onDrag, onDelete, onEdit }) => {
  const [noteText, setNoteText] = useState(note.text);

  const handleTextChange = (event) => {
    const text = event.target.value;
    const lineBreaks = text.split("\n").length;

    if (text.length <= 112 && lineBreaks <= 7 && text !== note.text) {
      setNoteText(text);
      onEdit(note.id, text);
    }
  };

  return (
    <Draggable
      defaultPosition={{ x: note.x, y: note.y }}
      onStop={(e, data) => onDrag(note.id, data.x, data.y)}
    >
      <Paper
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
};

const PostItBoard = () => {
  const { folderId } = useParams();
  <SvgIcon>
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100%" height="100%" fill="#ffeb3b" />
      <text x="10" y="20" fontFamily="Verdana" fontSize="5"></text>
    </svg>
  </SvgIcon>;

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get(`/api/postits/${folderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchNotes();
  }, [folderId]);

  const addNote = async () => {
    try {
      const response = await axios.post(
        "/api/postits",
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
      setNotes([...notes, response.data]);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const editNote = async (id, newText) => {
    try {
      await axios.put(
        `/api/postits/${id}`,
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
      const updatedNotes = notes.map((note) =>
        note.id === id ? { ...note, text: newText } : note
      );
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const moveNote = async (id, x, y) => {
    try {
      await axios.put(
        `/api/postits/${id}`,
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
      const updatedNotes = notes.map((note) =>
        note.id === id ? { ...note, x, y } : note
      );
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Error moving note:", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/postits/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

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
