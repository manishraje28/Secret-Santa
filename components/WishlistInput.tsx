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
    <section>
      <div className="flex items-center gap-2 mb-5">
        <svg className="w-5 h-5" style={{ color: 'var(--ice)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 
          className="text-sm font-medium uppercase tracking-wider"
          style={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.1em' }}
        >
          Your wishlist
        </h3>
      </div>

      <p 
        className="text-sm mb-4"
        style={{ color: 'rgba(255, 255, 255, 0.5)' }}
      >
        Add items you&apos;d like to receive, {participant}
      </p>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add a wishlist item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && item.trim()) {
              onAddItem(item.trim());
              setItem("");
            }
          }}
          className="flex-1 px-4 py-3.5 text-base rounded-lg transition-all duration-200"
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'white',
            outline: 'none',
          }}
        />
        <button
          onClick={() => {
            if (!item.trim()) return;
            onAddItem(item.trim());
            setItem("");
          }}
          className="px-6 py-3.5 text-sm font-medium rounded-lg transition-all duration-200"
          style={{ 
            background: 'linear-gradient(135deg, var(--pine) 0%, var(--pine-light) 100%)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          Add
        </button>
      </div>

      {wishlist.length > 0 && (
        <ul className="mt-5 space-y-2">
          {wishlist.map((w, index) => (
            <li 
              key={index}
              className="text-sm py-3 px-4 rounded-lg flex items-center gap-3"
              style={{ 
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
              }}
            >
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: 'var(--pine-light)' }}
              />
              {w}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
