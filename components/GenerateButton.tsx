type Props = {
  disabled: boolean;
  onGenerate: () => void;
};

export default function GenerateButton({ disabled, onGenerate }: Props) {
  return (
    <button disabled={disabled} onClick={onGenerate}>
      Generate Secret Santa
    </button>
  );
}
