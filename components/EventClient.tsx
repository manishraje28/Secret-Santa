/* eslint-disable react-hooks/set-state-in-effect */
"use client";
const STORAGE_KEY = "secret-santa-event";
import { useEffect } from "react";

import { useState } from "react";
import { generateAssignments } from "@/lib/santa";
import type { Assignments } from "@/types/santa";
import WishlistInput from "@/components/WishlistInput";

import ParticipantInput from "@/components/ParticipantInput";
import ParticipantList from "@/components/ParticipantList";
import GenerateButton from "@/components/GenerateButton";
import AssignmentReveal from "@/components/AssignmentReveal";
import Snowfall from "react-snowfall";
import Link from "next/link";

export default function EventClient() {
    const [locked, setLocked] = useState(false);

    const [name, setName] = useState("");
    const [participants, setParticipants] = useState<string[]>([]);
    const [assignments, setAssignments] = useState<Assignments | null>(null);
    const [selectedName, setSelectedName] = useState("");
    const [wishlists, setWishlists] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
            const data = JSON.parse(saved);

            setParticipants(data.participants || []);
            setAssignments(data.assignments || null);
            setWishlists(data.wishlists || {});
            setLocked(data.locked || false);
        } catch (err) {
            console.error("Failed to load saved data");
        }
    }, []);


    useEffect(() => {
        const data = {
            participants,
            assignments,
            wishlists,
            locked,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [participants, assignments, wishlists, locked]);



    const addWishlistItem = (name: string, item: string) => {
        setWishlists((prev) => ({
            ...prev,
            [name]: [...(prev[name] || []), item],
        }));
    };


    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Layered snowfall */}
            <div className="snowfall-container fixed inset-0 pointer-events-none z-10">
                <Snowfall
                    color="rgba(255, 255, 255, 0.25)"
                    snowflakeCount={60}
                    speed={[0.2, 0.5]}
                    wind={[-0.2, 0.4]}
                    radius={[0.5, 1.5]}
                />
            </div>
            <div className="snowfall-container fixed inset-0 pointer-events-none z-20">
                <Snowfall
                    color="rgba(255, 255, 255, 0.5)"
                    snowflakeCount={30}
                    speed={[0.4, 1]}
                    wind={[-0.1, 0.5]}
                    radius={[1.5, 2.5]}
                />
            </div>

            {/* Ambient glow so that it looks good */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div 
                    className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, rgba(61, 122, 95, 0.5) 0%, transparent 70%)' }}
                />
                <div 
                    className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-15"
                    style={{ background: 'radial-gradient(circle, rgba(100, 150, 180, 0.4) 0%, transparent 70%)' }}
                />
            </div>

            <div className="relative z-30 min-h-screen">
                {/* Header */}
                <header className="pt-6 px-6 md:pt-10 md:px-12 lg:px-24">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:gap-3"
                        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back home
                    </Link>
                </header>

                <div className="px-6 md:px-12 lg:px-24 py-12 md:py-16">
                    <div className="max-w-5xl mx-auto">
                        {/* Page header with decorative element */}
                        <div className="mb-12 md:mb-16">
                            <div className="flex items-center gap-3 mb-4">
                                <svg 
                                    className="w-6 h-6" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor"
                                    style={{ color: 'var(--pine-light)' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                                </svg>
                                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-32" />
                            </div>
                            <h1 
                                className="text-4xl md:text-5xl font-light mb-4"
                                style={{ 
                                    color: 'white',
                                    letterSpacing: '-0.02em',
                                    textShadow: '0 2px 30px rgba(0,0,0,0.3)'
                                }}
                            >
                                Your <span style={{ color: 'var(--ice)' }}>Event</span>
                            </h1>
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Add participants, generate assignments, and share wishlists
                            </p>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                            {/* Left column - Setup */}
                            <div className="space-y-8">
                                {/* Participants panel */}
                                <section className="frost-panel rounded-xl p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <h2 
                                            className="text-sm font-medium uppercase tracking-wider"
                                            style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                                        >
                                            Participants
                                        </h2>
                                    </div>
                                    
                                    <ParticipantInput
                                        name={name}
                                        setName={setName}
                                        disabled={locked}
                                        onAdd={() => {
                                            if (!name.trim() || locked) return;
                                            setParticipants([...participants, name.trim()]);
                                            setName("");
                                        }}
                                    />

                                    <ParticipantList participants={participants} />
                                    
                                    {participants.length > 0 && participants.length < 3 && (
                                        <p 
                                            className="text-sm mt-5 flex items-center gap-2"
                                            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Add {3 - participants.length} more {participants.length === 2 ? 'person' : 'people'} to continue
                                        </p>
                                    )}
                                </section>

                                {/* Generate panel */}
                                <section className="frost-panel rounded-xl p-6 md:p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h2 
                                            className="text-sm font-medium uppercase tracking-wider"
                                            style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                                        >
                                            Generate
                                        </h2>
                                    </div>

                                    <GenerateButton
                                        disabled={participants.length < 3 || locked}
                                        onGenerate={() => {
                                            const result = generateAssignments(participants);
                                            setAssignments(result);
                                            setSelectedName("");
                                            setLocked(true);
                                        }}
                                    />
                                    
                                    {locked && (
                                        <div 
                                            className="mt-5 p-4 rounded-lg flex items-center gap-3"
                                            style={{ background: 'rgba(61, 122, 95, 0.2)', border: '1px solid rgba(61, 122, 95, 0.3)' }}
                                        >
                                            <svg className="w-5 h-5" style={{ color: 'var(--pine-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm" style={{ color: 'var(--pine-light)' }}>
                                                Assignments are locked and ready!
                                            </span>
                                        </div>
                                    )}
                                </section>

                                {/* Reset */}
                                {assignments && (
                                    <button
                                        onClick={() => {
                                            setParticipants([]);
                                            setAssignments(null);
                                            setWishlists({});
                                            setSelectedName("");
                                            setLocked(false);
                                            localStorage.removeItem(STORAGE_KEY);
                                        }}
                                        className="text-sm transition-all duration-200 flex items-center gap-2"
                                        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Reset and start over
                                    </button>
                                )}
                            </div>

                            {/* Right column - Reveal & Wishlists */}
                            {assignments && (
                                <div className="space-y-8">
                                    {/* Reveal panel */}
                                    <section className="frost-panel rounded-xl p-6 md:p-8 glow-accent">
                                        <AssignmentReveal
                                            participants={participants}
                                            assignments={assignments}
                                            selectedName={selectedName}
                                            setSelectedName={setSelectedName}
                                        />
                                    </section>

                                    {selectedName && (
                                        <>
                                            {/* Your wishlist */}
                                            <section className="frost-panel rounded-xl p-6 md:p-8">
                                                <WishlistInput
                                                    participant={selectedName}
                                                    wishlist={wishlists[selectedName] || []}
                                                    onAddItem={(item) => addWishlistItem(selectedName, item)}
                                                />
                                            </section>

                                            {/* Their wishlist */}
                                            <section className="frost-panel rounded-xl p-6 md:p-8">
                                                <div className="flex items-center gap-2 mb-5">
                                                    <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                                    </svg>
                                                    <h3 
                                                        className="text-sm font-medium uppercase tracking-wider"
                                                        style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                                                    >
                                                        {assignments[selectedName]}&apos;s wishlist
                                                    </h3>
                                                </div>

                                                <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                    Gift ideas from the person you&apos;re buying for
                                                </p>

                                                {(wishlists[assignments[selectedName]] || []).length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {wishlists[assignments[selectedName]].map((item, index) => (
                                                            <li 
                                                                key={index} 
                                                                className="text-sm py-3 px-4 rounded-lg flex items-center gap-3"
                                                                style={{ 
                                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                                    color: 'white',
                                                                }}
                                                            >
                                                                <span 
                                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                                    style={{ background: 'var(--pine-light)' }}
                                                                />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div 
                                                        className="py-8 text-center rounded-lg"
                                                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.4)' }}
                                                    >
                                                        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                        </svg>
                                                        <p className="text-sm">No wishlist items yet</p>
                                                    </div>
                                                )}
                                            </section>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
