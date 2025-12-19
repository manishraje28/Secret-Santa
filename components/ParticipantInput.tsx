type Props = {
  name: string;
  setName: (value: string) => void;
  onAdd: () => void;
  disabled?: boolean;
};

export default function ParticipantInput({
  name,
  setName,
  onAdd,
  disabled = false,
}: Props) {
  return (
    <div className="flex gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        placeholder="Enter a name"
        disabled={disabled}
        className="flex-1 px-4 py-3.5 text-base rounded-lg transition-all duration-200"
        style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          outline: 'none',
        }}
      />
      <button 
        onClick={onAdd} 
        disabled={disabled}
        className="px-6 py-3.5 text-sm font-medium rounded-lg transition-all duration-200"
        style={{ 
          background: disabled ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
          color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        Add
      </button>
    </div>
  );
}
