type Props = {
  disabled: boolean;
  onGenerate: () => void;
};

export default function GenerateButton({ disabled, onGenerate }: Props) {
  return (
    <button 
      disabled={disabled} 
      onClick={onGenerate}
      className="w-full py-4 text-base font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
      style={{ 
        background: disabled ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
        color: disabled ? 'rgba(255, 255, 255, 0.3)' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: disabled ? 'none' : '0 0 30px rgba(61, 122, 95, 0.3)',
      }}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Generate assignments
    </button>
  );
}
