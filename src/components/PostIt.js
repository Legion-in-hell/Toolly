import React, { useState } from "react";
import Draggable from "react-draggable";
import { TextField, IconButton, Paper } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";

const PostIt = ({ note, onDrag, onDelete, onEdit }) => {
  return (
    <Draggable
      defaultPosition={{ x: note.x, y: note.y }}
      onStop={(e, data) => onDrag(note.id, data.x, data.y)}
    >
      <Paper style={{ padding: 10, cursor: "grab", position: "absolute" }}>
        <IconButton
          onClick={() => onDelete(note.id)}
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          multiline
          fullWidth
          defaultValue={note.text}
          onBlur={(e) => onEdit(note.id, e.target.value)}
          style={{ cursor: "text" }}
        />
      </Paper>
    </Draggable>
  );
};

const PostItBoard = () => {
  const [notes, setNotes] = useState([]);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      text: "Nouveau post-it",
      x: 100,
      y: 100,
    };
    setNotes([...notes, newNote]);
  };

  const editNote = (id, newText) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, text: newText } : note
    );
    setNotes(updatedNotes);
  };

  const moveNote = (id, x, y) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, x, y } : note
    );
    setNotes(updatedNotes);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div>
      <IconButton onClick={addNote} color="white" aria-label="add">
        <NoteAddIcon />
      </IconButton>
      <div>
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
    </div>
  );
};

export default PostItBoard;
