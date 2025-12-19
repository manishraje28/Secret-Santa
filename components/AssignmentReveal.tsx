import type { Assignments } from "@/types/santa";

type Props = {
  participants: string[];
  assignments: Assignments;
  selectedName: string;
  setSelectedName: (name: string) => void;
};

export default function AssignmentReveal({
  participants,
  assignments,
  selectedName,
  setSelectedName,
}: Props) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 
          className="text-sm font-medium uppercase tracking-wider"
          style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
        >
          Find your assignment
        </h2>
      </div>

      <select
        value={selectedName}
        onChange={(e) => setSelectedName(e.target.value)}
        className="w-full px-4 py-3.5 text-base appearance-none cursor-pointer rounded-lg transition-all duration-200"
        style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: selectedName ? 'white' : 'rgba(255, 255, 255, 0.5)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
        }}
      >
        <option value="">Select your name</option>
        {participants.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {selectedName && (
        <div 
          className="mt-6 p-6 rounded-xl text-center"
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
            {assignments[selectedName]}
          </p>
          <div className="mt-4 flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-lg">❄️</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
