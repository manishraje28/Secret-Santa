"use client";
import { useState } from "react";

export default function Home() {



  const [name, setName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string> | null>(null);


  function generateAssignments(names: string[]) {
    let shuffled: string[];

    do {
      shuffled = shuffleArray(names);
    } while (names.some((name, i) => name === shuffled[i]));

    const result: Record<string, string> = {};

    names.forEach((name, index) => {
      result[name] = shuffled[index];
    });

    return result;
  }



  function shuffleArray(array: string[]) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }


    return shuffled;
  }


  return (
    <main style={{ padding: 20 }}>
      <h1>🎅 Secret Santa</h1>

      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={() => {
          if (!name) return;
          setParticipants([...participants, name]);
          setName("");
        }}

      >
        Add
      </button>



      <ul>
        {participants.map((p, index) => (
          <li key={index}>{p}</li>
        ))}
      </ul>

      <button
        disabled={participants.length < 3}
        onClick={() => {
          const result = generateAssignments(participants);
          setAssignments(result);
        }}
      >
        Generate Secret Santa
      </button>

      {assignments && (
        <div>
          <h2>Assignments</h2>
          <ul>
            {Object.entries(assignments).map(([giver, receiver]) => (
              <li key={giver}>
                {giver} → {receiver}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setAssignments(null)}
      >
        Reset
      </button>


    </main>
  );
}
