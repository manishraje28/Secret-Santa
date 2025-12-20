"use client";

import Link from "next/link";
import Snowfall from "react-snowfall"; //for snowfall effect

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Layered snowfall for depth */}
      <div className="snowfall-container fixed inset-0 pointer-events-none z-10">
        {/* Background layer - smaller, slower */}
        <Snowfall
          color="rgba(255, 255, 255, 0.3)"
          snowflakeCount={80}
          speed={[0.2, 0.6]}
          wind={[-0.3, 0.5]}
          radius={[0.5, 1.5]}
        />
      </div>
      <div className="snowfall-container fixed inset-0 pointer-events-none z-20">
        {/* Foreground layer - larger, more visible */}
        <Snowfall
          color="rgba(255, 255, 255, 0.6)"
          snowflakeCount={40}
          speed={[0.5, 1.2]}
          wind={[-0.2, 0.6]}
          radius={[1.5, 3]}
        />
      </div>

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(61, 122, 95, 0.4) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(100, 150, 180, 0.3) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-30 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-8 px-6 md:pt-12 md:px-12">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--pine-light)', boxShadow: '0 0 8px rgba(61, 122, 95, 0.6)' }}
            />
            <span 
              className="text-xs tracking-widest uppercase"
              style={{ color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.2em' }}
            >
              Gift Exchange
            </span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex items-center px-6 md:px-12 lg:px-24 py-16">
          <div className="max-w-xl">
            {/* Decorative winter element */}
            <div className="mb-8 flex items-center gap-3">
              <svg 
                className="w-8 h-8 opacity-60" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor"
                style={{ color: 'var(--ice)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07M12 6l-2 2 2 2 2-2-2-2zM6 12l2-2-2-2-2 2 2 2zM18 12l-2 2 2 2 2-2-2-2zM12 18l2-2-2-2-2 2 2 2z" />
              </svg>
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </div>

            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
              style={{ 
                color: 'white',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 40px rgba(0,0,0,0.3)'
              }}
            >
              Secret
              <br />
              <span style={{ color: 'var(--ice)' }}>Santa</span>
            </h1>
            
            <p 
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-md"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Organize a magical gift exchange for friends, family, or colleagues. 
              Simple, private, and full of holiday spirit.
            </p>

            <Link href="/event">
              <button 
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-medium transition-all duration-300 glow-accent"
                style={{ 
                  background: 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span>Start your event</span>
                <svg 
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>

            {/* Feature hints */}
            <div className="mt-16 flex flex-wrap gap-6 text-sm" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Private & secure</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Fair matching</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlists included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer 
          className="px-6 md:px-12 py-8 text-xs flex items-center justify-between"
          style={{ color: 'rgba(255, 255, 255, 0.3)' }}
        >
          <span>December {new Date().getFullYear()}</span>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#e25555' }}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </footer>
      </div>
    </main>
  );
}
