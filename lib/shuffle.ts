export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Creates a valid Secret Santa assignment using derangement.
 * Ensures no one is assigned to themselves.
 * Returns an array where result[i] is the receiver for the person at index i.
 */
export function shuffleForSecretSanta<T>(participants: T[]): T[] {
  if (participants.length < 2) {
    throw new Error('Need at least 2 participants');
  }

  let result: T[];
  let attempts = 0;
  const maxAttempts = 100;

  // Keep shuffling until we get a valid derangement (no one gets themselves)
  do {
    result = shuffleArray([...participants]);
    attempts++;
    
    if (attempts > maxAttempts) {
      // Fallback: create a simple rotation
      result = [...participants.slice(1), participants[0]];
      break;
    }
  } while (participants.some((p, i) => p === result[i]));

  return result;
}
