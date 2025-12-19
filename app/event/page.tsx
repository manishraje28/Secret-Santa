'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/actions';
import Snowfall from 'react-snowfall';
import Link from 'next/link';

const ADMIN_TOKEN_KEY = 'secret-santa-admin-';

export default function CreateEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    const { data, error } = await createEvent(eventName || undefined);

    if (error) {
      setError(error);
      setIsCreating(false);
      return;
    }

    if (data) {
      // Store admin token in localStorage using short_code
      localStorage.setItem(ADMIN_TOKEN_KEY + data.short_code, data.admin_token);
      // Redirect to the event page using short_code
      router.push(`/event/${data.short_code}`);
    }
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

      <div className="relative z-30 min-h-screen flex flex-col">
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
            Back
          </Link>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="flex justify-center mb-6">
                <svg 
                  className="w-12 h-12" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  style={{ color: 'var(--pine-light)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M12 6l-2 2 2 2 2-2-2-2zM6 12l2-2-2-2-2 2 2 2zM18 12l-2 2 2 2 2-2-2-2zM12 18l2-2-2-2-2 2 2 2z" />
                </svg>
              </div>
              <h1 
                className="text-3xl md:text-4xl font-light mb-3"
                style={{ 
                  color: 'white',
                  letterSpacing: '-0.02em',
                }}
              >
                Create an Event
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Start a new Secret Santa gift exchange
              </p>
            </div>

            {/* Form */}
            <div className="frost-panel rounded-xl p-6 md:p-8">
              {error && (
                <div 
                  className="mb-6 p-4 rounded-lg"
                  style={{ background: 'rgba(220, 38, 38, 0.2)', border: '1px solid rgba(220, 38, 38, 0.4)', color: '#fca5a5' }}
                >
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label 
                  className="block text-sm mb-2"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Event name <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>(optional)</span>
                </label>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="e.g., Office Party 2025"
                  disabled={isCreating}
                  className="w-full px-4 py-3.5 text-base rounded-lg transition-all duration-200"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    outline: 'none',
                  }}
                />
              </div>

              <button 
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-4 text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
                style={{ 
                  background: isCreating 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
                  color: isCreating ? 'rgba(255, 255, 255, 0.3)' : 'white',
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isCreating ? 'none' : '0 0 30px rgba(61, 122, 95, 0.3)',
                }}
              >
                {isCreating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                  </>
                )}
              </button>

              <p 
                className="mt-6 text-sm text-center"
                style={{ color: 'rgba(255, 255, 255, 0.4)' }}
              >
                You&apos;ll get a shareable link to invite participants
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
