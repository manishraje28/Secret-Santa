type Props = {
  participants: string[];
};

export default function ParticipantList({ participants }: Props) {
  if (participants.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {participants.map((p, index) => (
          <span 
            key={index}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span 
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--pine-light)' }}
            />
            {p}
          </span>
        ))}
      </div>
      <p 
        className="mt-4 text-sm"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        {participants.length} {participants.length === 1 ? 'person' : 'people'} added
      </p>
    </div>
  );
}
