type Props = {
  participant: string;
  wishlist: string[];
  onAddItem: (item: string) => void;
};

import { useState } from "react";

export default function WishlistInput({
  participant,
  wishlist,
  onAddItem,
}: Props) {
  const [item, setItem] = useState("");

  return (
    <div style={{ marginTop: 20 }}>
      <h3>🎁 {participant}&apos;s Wishlist</h3>

      <input
        type="text"
        placeholder="Add wishlist item"
        value={item}
        onChange={(e) => setItem(e.target.value)}
      />

      <button
        onClick={() => {
          if (!item.trim()) return;
          onAddItem(item.trim());
          setItem("");
        }}
      >
        Add
      </button>

      {wishlist.length > 0 && (
        <ul>
          {wishlist.map((w, index) => (
            <li key={index}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
