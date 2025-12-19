type Props = {
  participants: string[];
};

export default function ParticipantList({ participants }: Props) {
  if (participants.length === 0) return null;

  return (
    <ul>
      {participants.map((p, index) => (
        <li key={index}>{p}</li>
      ))}
    </ul>
  );
}
