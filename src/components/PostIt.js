import React, { useState } from "react";
import Draggable from "react-draggable";
import { TextField, IconButton, Paper, SvgIcon } from "@mui/material";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import postItSVG from "./assets/postit.svg";

const PostIt = ({ note, onDrag, onDelete, onEdit }) => {
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
          backgroundImage: `url(${postItSVG})`,
        }}
      >
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
