// Gentle, non-shaming tips shown during a pause. Kept short so they never distract at the table.
export const TIPS: string[] = [
  'Kauwen maakt verteringsenzymen vrij — geef ze even de tijd.',
  'Je darmen hebben ~20 minuten nodig om verzadiging te melden.',
  'Goed kauwen maakt de deeltjes kleiner, zodat je meer voedingsstoffen opneemt.',
  'Je speeksel begint de vertering al in je mond.',
  'Let eens op de verschillende smaken in deze hap.',
  'Adem rustig terwijl je kauwt.',
  'Voel de textuur van het eten in je mond.',
  'Langzamer eten kan een opgeblazen gevoel verminderen.',
  'Leg je bestek even neer tijdens de pauze.',
  'Proef bewust — waar begint de smaak, waar eindigt hij?',
  'Even ademruimte. Er is geen haast.',
  'Rustig eten mag ook gewoon prettig zijn.',
]

// Deterministic-ish pick that avoids the previous index.
export function pickTip(prev: number): { text: string; index: number } {
  if (TIPS.length === 0) return { text: '', index: -1 }
  let i = Math.floor(Math.random() * TIPS.length)
  if (TIPS.length > 1 && i === prev) i = (i + 1) % TIPS.length
  return { text: TIPS[i], index: i }
}
