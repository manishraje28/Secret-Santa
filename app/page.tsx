import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>🎅 Secret Santa</h1>

      <p>
        Organize Secret Santa easily for your gym, friends, or office.
      </p>

      <Link href="/event">
        <button style={{ marginTop: 20 }}>
          Create / Join Event
        </button>
      </Link>
    </main>
  );
}
