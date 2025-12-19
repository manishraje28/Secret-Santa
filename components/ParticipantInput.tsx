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
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
        disabled={disabled}
      />
      <button onClick={onAdd} disabled={disabled}>
        Add
      </button>
      
    </div>
  );
}
