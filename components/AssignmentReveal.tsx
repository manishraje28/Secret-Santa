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
    <div style={{ marginTop: 20 }}>
      <h2>Find Your Assignment</h2>

      <select
        value={selectedName}
        onChange={(e) => setSelectedName(e.target.value)}
      >
        <option value="">Select your name</option>
        {participants.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {selectedName && (
        <p style={{ marginTop: 10, fontSize: 18 }}>
          🎁 You are Secret Santa for{" "}
          <strong>{assignments[selectedName]}</strong>
        </p>
      )}
    </div>
  );
}
