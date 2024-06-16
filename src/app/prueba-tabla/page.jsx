"use client";

import { useState } from "react";

export default function Home() {
  const [gameId, setGameId] = useState("");
  const [message, setMessage] = useState("");

  const handleCreateTable = async () => {
    const response = await fetch("/api/createtable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: gameId,
    });

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div>
      <h1>Crear tabla temporal</h1>
      <input
        type="text"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        placeholder="Introducir ID"
      />
      <button onClick={handleCreateTable}>Crear Tabla</button>
      <p>{message}</p>
    </div>
  );
}
