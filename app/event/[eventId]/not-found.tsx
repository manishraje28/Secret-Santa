'use client';

import Link from 'next/link';
import Snowfall from 'react-snowfall';

export default function EventNotFound() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Snowfall */}
      <div className="snowfall-container fixed inset-0 pointer-events-none z-10">
        <Snowfall
          color="rgba(255, 255, 255, 0.3)"
          snowflakeCount={40}
          speed={[0.2, 0.6]}
          wind={[-0.2, 0.4]}
          radius={[0.5, 2]}
        />
      </div>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[30%] w-[40%] h-[40%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(100, 150, 180, 0.4) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-30 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <svg 
            className="w-16 h-16 mx-auto mb-4 opacity-40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            style={{ color: 'var(--ice)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
          </svg>
        </div>

        <h1 
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ color: 'white', letterSpacing: '-0.02em' }}
        >
          Event not found
        </h1>

        <p 
          className="text-lg mb-10 max-w-md"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          This event doesn&apos;t exist or the link may be incorrect. 
          Check the URL or create a new event.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/event"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all duration-200"
            style={{ 
              background: 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Create new event
          </Link>

          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all duration-200"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
