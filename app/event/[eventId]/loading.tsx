'use client';

import Snowfall from 'react-snowfall';

export default function EventLoading() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Snowfall */}
      <div className="snowfall-container fixed inset-0 pointer-events-none z-10">
        <Snowfall
          color="rgba(255, 255, 255, 0.25)"
          snowflakeCount={40}
          speed={[0.2, 0.5]}
          wind={[-0.2, 0.4]}
          radius={[0.5, 1.5]}
        />
      </div>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(61, 122, 95, 0.5) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-30 min-h-screen flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg 
            className="w-12 h-12 animate-spin" 
            fill="none" 
            viewBox="0 0 24 24"
            style={{ color: 'var(--pine-light)' }}
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="2"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Loading event...
          </p>
        </div>
      </div>
    </main>
  );
}
