import React, { useState, useEffect } from "react";

export const NoteSection = ({ videoId }) => {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");

  // Fetch notes for this video
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notes/${videoId}`);
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error("❌ Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, [videoId]);

  // Handle saving a new note
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteInput.trim()) {
      alert("❌ Please enter a note.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          videoId,
          text: noteInput,
        }),
      });

      if (res.ok) {
        const newNote = await res.json();
        setNotes([newNote, ...notes]);
        setNoteInput("");
      } else {
        alert("❌ Failed to save note.");
      }
    } catch (err) {
      console.error("❌ Error saving note:", err);
      alert("❌ An error occurred while saving the note.");
    }
  };

  return (
    <div>
      <h3>Notes for this Video</h3>
      <form onSubmit={handleNoteSubmit}>
        <textarea
          placeholder="Add a note about this video..."
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
        />
        <button type="submit">Save Note</button>
      </form>

      <div>
        {notes.map((note) => (
          <div key={note._id} style={{ marginTop: "1rem" }}>
            <p>{note.text}</p>
            <small>{new Date(note.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};