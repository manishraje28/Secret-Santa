"use client";

import { useState } from "react";
import { generateAssignments } from "@/lib/santa";
import type { Assignments } from "@/types/santa";
import WishlistInput from "@/components/WishlistInput";

import ParticipantInput from "@/components/ParticipantInput";
import ParticipantList from "@/components/ParticipantList";
import GenerateButton from "@/components/GenerateButton";
import AssignmentReveal from "@/components/AssignmentReveal";

export default function EventClient() {
    const [locked, setLocked] = useState(false);

    const [name, setName] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [assignments, setAssignments] = useState<Assignments | null>(null);
    const [selectedName, setSelectedName] = useState("");
    const [wishlists, setWishlists] = useState<Record<string, string[]>>({});

    const addWishlistItem = (name: string, item: string) => {
        setWishlists((prev) => ({
            ...prev,
            [name]: [...(prev[name] || []), item],
        }));
    };


    return (
        <main style={{ padding: 20 }}>
            <h1>🎅 Secret Santa</h1>

            <ParticipantInput
                name={name}
                setName={setName}
                onAdd={() => {
                    if (!name.trim() || locked) return;
                    setParticipants([...participants, name.trim()]);
                    setName("");
                }}
            />


            <ParticipantList participants={participants} />

            <GenerateButton
                disabled={participants.length < 3 || locked}
                onGenerate={() => {
                    const result = generateAssignments(participants);
                    setAssignments(result);
                    setSelectedName("");
                    setLocked(true); // 🔒 LOCK HERE
                }}
            />


            {assignments && (
                <AssignmentReveal
                    participants={participants}
                    assignments={assignments}
                    selectedName={selectedName}
                    setSelectedName={setSelectedName}
                />
            )}
            {/* {locked && (
                <p style={{ color: "gray", marginTop: 10 }}>
                    🔒 Assignments are locked
                </p>
            )} */}

            {selectedName && (
                <WishlistInput
                    participant={selectedName}
                    wishlist={wishlists[selectedName] || []}
                    onAddItem={(item) => addWishlistItem(selectedName, item)}
                />
            )}
            {selectedName && assignments && (
                <div style={{ marginTop: 20 }}>
                    <h3>🎅 Wishlist of {assignments[selectedName]}</h3>

                    {(wishlists[assignments[selectedName]] || []).length > 0 ? (
                        <ul>
                            {wishlists[assignments[selectedName]].map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No wishlist added yet.</p>
                    )}
                </div>
            )}


            {assignments && (
                <button
                    onClick={() => {
                        setAssignments(null);
                        setSelectedName("");
                        setLocked(false); // 🔓 UNLOCK
                    }}
                    style={{ marginTop: 20 }}
                >
                    Reset Event
                </button>

            )}
        </main>
    );
}
