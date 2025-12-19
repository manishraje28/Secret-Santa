/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  addParticipant, 
  adminAddParticipant,
  removeParticipant,
  generateAssignments, 
  getMyAssignment, 
  getWishlist,
  addWishlistItem,
  getEventData,
  resetEvent,
  getAdminOverview
} from '@/lib/actions';
import type { Event, Participant, WishlistItem } from '@/lib/supabase';
import Snowfall from 'react-snowfall';
import Link from 'next/link';
import ParticipantList from '@/components/ParticipantList';

type Props = {
  eventId: string;
  initialEvent: Event;
  initialParticipants: Participant[];
};

type AdminParticipantInfo = {
  id: string;
  name: string;
  wishlistCount: number;
  joinedAt: string;
};

const ADMIN_TOKEN_KEY = 'secret-santa-admin-';
const PARTICIPANT_KEY = 'secret-santa-participant-';

export default function EventPageClient({ eventId, initialEvent, initialParticipants }: Props) {
  // Event state
  const [event, setEvent] = useState<Event>(initialEvent);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  
  // User state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  
  // UI state
  const [joinName, setJoinName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Assignment state
  const [myAssignment, setMyAssignment] = useState<{ id: string; name: string } | null>(null);
  
  // Wishlist state
  const [myWishlist, setMyWishlist] = useState<WishlistItem[]>([]);
  const [theirWishlist, setTheirWishlist] = useState<WishlistItem[]>([]);
  const [wishlistItem, setWishlistItem] = useState('');

  // Admin state
  const [adminAddName, setAdminAddName] = useState('');
  const [isAdminAdding, setIsAdminAdding] = useState(false);
  const [adminOverview, setAdminOverview] = useState<AdminParticipantInfo[]>([]);

  // Check if user is admin or returning participant
  useEffect(() => {
    const storedAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY + eventId);
    if (storedAdminToken && storedAdminToken === initialEvent.admin_token) {
      setIsAdmin(true);
      setAdminToken(storedAdminToken);
    }

    const storedParticipantId = localStorage.getItem(PARTICIPANT_KEY + eventId);
    if (storedParticipantId) {
      const participant = initialParticipants.find(p => p.id === storedParticipantId);
      if (participant) {
        setCurrentParticipant(participant);
      }
    }
  }, [eventId, initialEvent.admin_token, initialParticipants]);

  // Fetch assignment if locked and participant is set
  const fetchAssignment = useCallback(async () => {
    if (!currentParticipant || !event.locked) return;

    const { data } = await getMyAssignment(eventId, currentParticipant.id);
    if (data?.receiver) {
      const receiver = data.receiver as { id: string; name: string };
      setMyAssignment(receiver);
      
      // Fetch their wishlist
      const { data: wishlist } = await getWishlist(receiver.id);
      if (wishlist) {
        setTheirWishlist(wishlist);
      }
    }
  }, [currentParticipant, event.locked, eventId]);

  // Fetch my wishlist
  const fetchMyWishlist = useCallback(async () => {
    if (!currentParticipant) return;
    
    const { data } = await getWishlist(currentParticipant.id);
    if (data) {
      setMyWishlist(data);
    }
  }, [currentParticipant]);

  // Fetch admin overview
  const fetchAdminOverview = useCallback(async () => {
    if (!isAdmin || !adminToken) return;
    
    const { data } = await getAdminOverview(eventId, adminToken);
    if (data?.participants) {
      setAdminOverview(data.participants);
    }
  }, [isAdmin, adminToken, eventId]);

  useEffect(() => {
    fetchAssignment();
    fetchMyWishlist();
    fetchAdminOverview();
  }, [fetchAssignment, fetchMyWishlist, fetchAdminOverview]);

  // Poll for updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      const { data } = await getEventData(eventId);
      if (data) {
        setEvent(data.event);
        setParticipants(data.participants);
        
        // If event just became locked, fetch assignment
        if (data.event.locked && !event.locked) {
          fetchAssignment();
        }
      }
      
      // Refresh admin overview
      if (isAdmin && adminToken) {
        fetchAdminOverview();
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [eventId, event.locked, fetchAssignment, isAdmin, adminToken, fetchAdminOverview]);

  // Handle joining the event
  const handleJoin = async () => {
    if (!joinName.trim()) return;
    
    setIsJoining(true);
    setError(null);

    const { data, error } = await addParticipant(eventId, joinName.trim());
    
    if (error) {
      setError(error);
      setIsJoining(false);
      return;
    }

    if (data) {
      setCurrentParticipant(data);
      setParticipants([...participants, data]);
      localStorage.setItem(PARTICIPANT_KEY + eventId, data.id);
      setJoinName('');
    }
    
    setIsJoining(false);
  };

  // Handle generating assignments (admin only)
  const handleGenerate = async () => {
    if (!adminToken) return;
    
    setIsGenerating(true);
    setError(null);

    const { error } = await generateAssignments(eventId, adminToken);
    
    if (error) {
      setError(error);
      setIsGenerating(false);
      return;
    }

    setEvent({ ...event, locked: true });
    setIsGenerating(false);
    
    // Fetch assignment after generating
    fetchAssignment();
  };

  // Handle adding wishlist item
  const handleAddWishlistItem = async () => {
    if (!currentParticipant || !wishlistItem.trim()) return;

    const { data, error } = await addWishlistItem(currentParticipant.id, wishlistItem.trim());
    
    if (error) {
      setError(error);
      return;
    }

    if (data) {
      setMyWishlist([...myWishlist, data]);
      setWishlistItem('');
    }
  };

  // Handle reset (admin only)
  const handleReset = async () => {
    if (!adminToken) return;
    
    if (!confirm('Are you sure? This will delete all participants, assignments, and wishlists.')) {
      return;
    }

    const { error } = await resetEvent(eventId, adminToken);
    
    if (error) {
      setError(error);
      return;
    }

    setEvent({ ...event, locked: false });
    setParticipants([]);
    setMyAssignment(null);
    setMyWishlist([]);
    setTheirWishlist([]);
    setCurrentParticipant(null);
    setAdminOverview([]);
    localStorage.removeItem(PARTICIPANT_KEY + eventId);
  };

  // Admin: Add participant
  const handleAdminAddParticipant = async () => {
    if (!adminToken || !adminAddName.trim()) return;
    
    setIsAdminAdding(true);
    setError(null);

    const { data, error } = await adminAddParticipant(eventId, adminAddName.trim(), adminToken);
    
    if (error) {
      setError(error);
      setIsAdminAdding(false);
      return;
    }

    if (data) {
      setParticipants([...participants, data]);
      setAdminAddName('');
      fetchAdminOverview();
    }
    
    setIsAdminAdding(false);
  };

  // Admin: Remove participant
  const handleRemoveParticipant = async (participantId: string) => {
    if (!adminToken) return;
    
    if (!confirm('Remove this participant from the event?')) {
      return;
    }

    const { error } = await removeParticipant(eventId, participantId, adminToken);
    
    if (error) {
      setError(error);
      return;
    }

    setParticipants(participants.filter(p => p.id !== participantId));
    setAdminOverview(adminOverview.filter(p => p.id !== participantId));
  };

  // Copy share link
  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const participantNames = participants.map(p => p.name);

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

      {/* Ambient glow */}
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
        <header className="pt-6 px-6 md:pt-10 md:px-12 lg:px-24 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm transition-all duration-200 hover:gap-3"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          
          <button
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all duration-200"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share link
          </button>
        </header>

        <div className="px-6 md:px-12 lg:px-24 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            {/* Page header */}
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
                {isAdmin && (
                  <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(61, 122, 95, 0.3)', color: 'var(--pine-light)' }}>
                    Admin
                  </span>
                )}
              </div>
              <h1 
                className="text-4xl md:text-5xl font-light mb-4"
                style={{ 
                  color: 'white',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 30px rgba(0,0,0,0.3)'
                }}
              >
                {event.name}
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {event.locked 
                  ? 'Assignments are ready! Select your name to see who you\'re buying for.'
                  : 'Share this link with participants. Add names and generate assignments when ready.'
                }
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div 
                className="mb-8 p-4 rounded-lg"
                style={{ background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#fca5a5' }}
              >
                {error}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left column */}
              <div className="space-y-8">
                {/* Join / Participants panel */}
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

                  {/* Join form - show only if not locked and not already joined */}
                  {!event.locked && !currentParticipant && (
                    <div className="mb-6">
                      <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Enter your name to join this event
                      </p>
                      <div className="flex gap-3">
                        <input
                          value={joinName}
                          onChange={(e) => setJoinName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                          placeholder="Your name"
                          disabled={isJoining}
                          className="flex-1 px-4 py-3.5 text-base rounded-lg transition-all duration-200"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            outline: 'none',
                          }}
                        />
                        <button 
                          onClick={handleJoin}
                          disabled={isJoining || !joinName.trim()}
                          className="px-6 py-3.5 text-sm font-medium rounded-lg transition-all duration-200"
                          style={{ 
                            background: isJoining || !joinName.trim() 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
                            color: isJoining || !joinName.trim() ? 'rgba(255, 255, 255, 0.3)' : 'white',
                            cursor: isJoining || !joinName.trim() ? 'not-allowed' : 'pointer',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {isJoining ? 'Joining...' : 'Join'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Current participant badge */}
                  {currentParticipant && (
                    <div 
                      className="mb-6 p-3 rounded-lg flex items-center gap-2"
                      style={{ background: 'rgba(61, 122, 95, 0.2)', border: '1px solid rgba(61, 122, 95, 0.3)' }}
                    >
                      <svg className="w-4 h-4" style={{ color: 'var(--pine-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--pine-light)' }}>
                        Joined as <strong>{currentParticipant.name}</strong>
                      </span>
                    </div>
                  )}

                  <ParticipantList participants={participantNames} />
                  
                  {participants.length > 0 && participants.length < 3 && !event.locked && (
                    <p 
                      className="text-sm mt-5 flex items-center gap-2"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Need {3 - participants.length} more {participants.length === 2 ? 'person' : 'people'} to generate
                    </p>
                  )}
                </section>

                {/* Admin: Add Participants & Overview */}
                {isAdmin && !event.locked && (
                  <section className="frost-panel rounded-xl p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h2 
                        className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                      >
                        Admin Controls
                      </h2>
                    </div>

                    {/* Add participant form */}
                    <div className="mb-6">
                      <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Add participants manually
                      </p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={adminAddName}
                          onChange={(e) => setAdminAddName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdminAddParticipant()}
                          placeholder="Participant name"
                          disabled={isAdminAdding}
                          className="flex-1 px-4 py-3 text-base rounded-lg transition-all duration-200"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            outline: 'none',
                          }}
                        />
                        <button 
                          onClick={handleAdminAddParticipant}
                          disabled={isAdminAdding || !adminAddName.trim()}
                          className="px-5 py-3 text-sm font-medium rounded-lg transition-all duration-200"
                          style={{ 
                            background: isAdminAdding || !adminAddName.trim() 
                              ? 'rgba(255, 255, 255, 0.1)' 
                              : 'rgba(61, 122, 95, 0.5)',
                            color: isAdminAdding || !adminAddName.trim() ? 'rgba(255, 255, 255, 0.3)' : 'white',
                            cursor: isAdminAdding || !adminAddName.trim() ? 'not-allowed' : 'pointer',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {isAdminAdding ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    </div>

                    {/* Participant list with remove buttons */}
                    {adminOverview.length > 0 && (
                      <div>
                        <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Manage participants ({adminOverview.length})
                        </p>
                        <ul className="space-y-2">
                          {adminOverview.map((p) => (
                            <li 
                              key={p.id}
                              className="flex items-center justify-between py-2.5 px-4 rounded-lg"
                              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm" style={{ color: 'white' }}>{p.name}</span>
                                {p.wishlistCount > 0 && (
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ background: 'rgba(61, 122, 95, 0.3)', color: 'var(--pine-light)' }}
                                  >
                                    {p.wishlistCount} wishlist item{p.wishlistCount !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveParticipant(p.id)}
                                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-red-500/20"
                                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                                title="Remove participant"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {/* Admin Overview when locked */}
                {isAdmin && event.locked && adminOverview.length > 0 && (
                  <section className="frost-panel rounded-xl p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h2 
                        className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                      >
                        Participant Overview
                      </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div 
                        className="p-4 rounded-lg text-center"
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <p className="text-2xl font-light" style={{ color: 'white' }}>{adminOverview.length}</p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Participants</p>
                      </div>
                      <div 
                        className="p-4 rounded-lg text-center"
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <p className="text-2xl font-light" style={{ color: 'white' }}>
                          {adminOverview.filter(p => p.wishlistCount > 0).length}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>With wishlists</p>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {adminOverview.map((p) => (
                        <li 
                          key={p.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg text-sm"
                          style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                        >
                          <span style={{ color: 'white' }}>{p.name}</span>
                          <span 
                            className="flex items-center gap-1"
                            style={{ color: p.wishlistCount > 0 ? 'var(--pine-light)' : 'rgba(255, 255, 255, 0.3)' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {p.wishlistCount}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Admin: Generate panel */}
                {isAdmin && !event.locked && (
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

                    <button 
                      disabled={participants.length < 3 || isGenerating}
                      onClick={handleGenerate}
                      className="w-full py-4 text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
                      style={{ 
                        background: participants.length < 3 || isGenerating 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
                        color: participants.length < 3 || isGenerating ? 'rgba(255, 255, 255, 0.3)' : 'white',
                        cursor: participants.length < 3 || isGenerating ? 'not-allowed' : 'pointer',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: participants.length < 3 || isGenerating ? 'none' : '0 0 30px rgba(61, 122, 95, 0.3)',
                      }}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Generate assignments
                        </>
                      )}
                    </button>
                  </section>
                )}

                {/* Admin: Reset button */}
                {isAdmin && event.locked && (
                  <button
                    onClick={handleReset}
                    className="text-sm transition-all duration-200 flex items-center gap-2"
                    style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset event
                  </button>
                )}

                {/* Locked indicator for non-admin */}
                {event.locked && !isAdmin && (
                  <div 
                    className="p-4 rounded-lg flex items-center gap-3"
                    style={{ background: 'rgba(61, 122, 95, 0.2)', border: '1px solid rgba(61, 122, 95, 0.3)' }}
                  >
                    <svg className="w-5 h-5" style={{ color: 'var(--pine-light)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm" style={{ color: 'var(--pine-light)' }}>
                      Assignments are ready!
                    </span>
                  </div>
                )}
              </div>

              {/* Right column - Assignment & Wishlists */}
              {event.locked && currentParticipant && (
                <div className="space-y-8">
                  {/* Assignment reveal */}
                  <section className="frost-panel rounded-xl p-6 md:p-8 glow-accent">
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <h2 
                        className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                      >
                        Your Assignment
                      </h2>
                    </div>

                    {myAssignment ? (
                      <div 
                        className="p-6 rounded-xl text-center"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(61, 122, 95, 0.3) 0%, rgba(61, 122, 95, 0.1) 100%)',
                          border: '1px solid rgba(61, 122, 95, 0.4)',
                        }}
                      >
                        <p 
                          className="text-sm mb-2"
                          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          You are buying a gift for
                        </p>
                        <p 
                          className="text-2xl md:text-3xl font-light"
                          style={{ color: 'white' }}
                        >
                          {myAssignment.name}
                        </p>
                        <div className="mt-4 flex justify-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <span key={i} className="text-lg">❄️</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Loading your assignment...</p>
                    )}
                  </section>

                  {/* My wishlist */}
                  <section className="frost-panel rounded-xl p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 
                        className="text-sm font-medium uppercase tracking-wider"
                        style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                      >
                        Your Wishlist
                      </h3>
                    </div>

                    <p 
                      className="text-sm mb-4"
                      style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      Add items you&apos;d like to receive
                    </p>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add a wishlist item"
                        value={wishlistItem}
                        onChange={(e) => setWishlistItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddWishlistItem()}
                        className="flex-1 px-4 py-3.5 text-base rounded-lg transition-all duration-200"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: 'white',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={handleAddWishlistItem}
                        disabled={!wishlistItem.trim()}
                        className="px-6 py-3.5 text-sm font-medium rounded-lg transition-all duration-200"
                        style={{ 
                          background: !wishlistItem.trim() 
                            ? 'rgba(255, 255, 255, 0.1)'
                            : 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
                          color: !wishlistItem.trim() ? 'rgba(255, 255, 255, 0.3)' : 'white',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        Add
                      </button>
                    </div>

                    {myWishlist.length > 0 && (
                      <ul className="mt-5 space-y-2">
                        {myWishlist.map((w) => (
                          <li 
                            key={w.id}
                            className="text-sm py-3 px-4 rounded-lg flex items-center gap-3"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'white',
                            }}
                          >
                            <span 
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: 'var(--pine-light)' }}
                            />
                            {w.item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {/* Their wishlist */}
                  {myAssignment && (
                    <section className="frost-panel rounded-xl p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-5">
                        <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <h3 
                          className="text-sm font-medium uppercase tracking-wider"
                          style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
                        >
                          {myAssignment.name}&apos;s Wishlist
                        </h3>
                      </div>

                      <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Gift ideas from the person you&apos;re buying for
                      </p>

                      {theirWishlist.length > 0 ? (
                        <ul className="space-y-2">
                          {theirWishlist.map((w) => (
                            <li 
                              key={w.id}
                              className="text-sm py-3 px-4 rounded-lg flex items-center gap-3"
                              style={{ 
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'white',
                              }}
                            >
                              <span 
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: 'var(--pine-light)' }}
                              />
                              {w.item}
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
                  )}
                </div>
              )}

              {/* Message for visitors who missed joining before lock */}
              {event.locked && !currentParticipant && !isAdmin && (
                <div className="frost-panel rounded-xl p-6 md:p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                    <svg className="w-8 h-8" style={{ color: 'rgba(255, 255, 255, 0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 
                    className="text-lg font-medium mb-2"
                    style={{ color: 'white' }}
                  >
                    Event Already Started
                  </h2>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Assignments have already been generated. Only participants who joined before the event was locked can view their assignments.
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                    If you&apos;re a participant, try using the same device and browser you used when you first joined.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
