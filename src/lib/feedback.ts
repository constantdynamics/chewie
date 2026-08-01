/**
 * Spoken-word feedback for a finished bite.
 *
 * Bites are judged against the chew target: well short, short, nearly there, on
 * target, long, or very long. Anything at or past the target still earns its star —
 * the "late" lines nudge, they never take something away. Tone stays warm: no
 * shaming, no scolding, and never a suggestion to eat less food.
 */
export type FeedbackKind = 'veryEarly' | 'early' | 'nearlyThere' | 'onTarget' | 'late' | 'veryLate'

export function classifyBite(countedSec: number, targetSec: number): FeedbackKind {
  if (targetSec <= 0) return 'onTarget'
  const ratio = countedSec / targetSec
  if (ratio < 0.35) return 'veryEarly'
  if (ratio < 0.75) return 'early'
  if (ratio < 1) return 'nearlyThere'
  if (ratio <= 1.6) return 'onTarget'
  if (ratio <= 2.6) return 'late'
  return 'veryLate'
}

export const FEEDBACK: Record<FeedbackKind, string[]> = {
  // --- Well short of the target (14) -------------------------------------
  veryEarly: [
    "Hup, die ging er snel doorheen. Probeer eens dubbel zo lang.",
    "Dat was meer slikken dan kauwen. Geen ramp — volgende hap rustiger.",
    "Zo snel merkt je maag er nog niets van. Neem er even de tijd voor.",
    "Die hap had nog een heel leven voor zich.",
    "Bijna doorgeslikt voor je begon. Volgende keer wat langer malen.",
    "Snelheidsrecord — maar daar spelen we dit spel niet voor.",
    "Je kaken hebben nauwelijks werk gehad. Gun ze wat meer.",
    "Zo mis je de smaak. Probeer 'm eens echt te proeven.",
    "Dat ging als een trein. Zet 'm even op een lager tempo.",
    "Nog even doorbijten — letterlijk.",
    "Je tong heeft 'm amper gezien. Volgende hap langer.",
    "Kort maar krachtig. Nu graag alleen dat tweede.",
    "Dat telt eerder als happen dan als kauwen.",
    "Rustig aan, er zit niemand achter je aan.",
  ],

  // --- Clearly short, but on the way (14) --------------------------------
  early: [
    "Halverwege gestopt — je bent op de goede weg.",
    "Iets te snel, maar het scheelt al minder.",
    "Nog een paar tellen erbij en je hebt 'm.",
    "Goed op weg, alleen de finish nog.",
    "Je zit er net onder. Volgende hap even doorzetten.",
    "Bijna. Tel in je hoofd rustig door.",
    "Dat was een korte. De volgende mag wat luier.",
    "Je kauwt al beter dan gemiddeld — nu nog even volhouden.",
    "Nog niet helemaal. Geef 'm wat meer tijd.",
    "Prima aanzet, alleen wat vroeg afgekapt.",
    "Je haalt de helft. Nu de andere helft erbij.",
    "Nog even geduld met die hap.",
    "Kort. Maar je weet inmiddels hoe het voelt als het klopt.",
    "Een tandje langzamer en je zit goed.",
  ],

  // --- A whisker short (14) ----------------------------------------------
  nearlyThere: [
    "Zó dichtbij! Nog een tel of twee.",
    "Net te vroeg — je voelde 'm bijna.",
    "Op een haartje na. De volgende is 'm.",
    "Bijna raak. Eén ademteug langer.",
    "Je was er bijna. Nog even doortellen.",
    "Millimeterwerk — net niet.",
    "Zo dichtbij dat het bijna telt. Bijna.",
    "Nog één kauwbeweging en je had 'm gehad.",
    "Net onder de streep. Volgende keer pak je 'm.",
    "Je bent er zo goed als. Rustig blijven.",
    "Bijna, bijna. Niet versnellen nu.",
    "Een fractie te vroeg. Je gevoel klopt al aardig.",
    "Dat scheelde niets. De volgende is raak.",
    "Nipt te kort — maar je zit in het ritme.",
  ],

  // --- Landed it (20) -----------------------------------------------------
  onTarget: [
    "Precies goed. Ster verdiend!",
    "Mooi getimed — ster erbij.",
    "Dat is 'm. Perfect gekauwd.",
    "Strak in het doel. Ster!",
    "Goud waard, die hap.",
    "Precies zoals bedoeld. Ster binnen.",
    "Zo hoort het te voelen. Ster verdiend.",
    "Netjes op tijd. Volgende hap net zo.",
    "Raak! Je ritme zit goed.",
    "Perfecte hap. Ster erbij.",
    "Helemaal goed getimed.",
    "Dat is smullen én scoren. Ster!",
    "In de roos. Ster verdiend.",
    "Je hebt 'm precies te pakken.",
    "Zuiver getimed. Ster binnen.",
    "Prachtig ritme. Ster erbij.",
    "Dat is de bedoeling. Mooi zo.",
    "Vol in het doel. Ster!",
    "Je zit lekker in je tempo. Ster.",
    "Klopt als een bus. Ster erbij.",
  ],

  // --- Past the target, star still earned (14) ---------------------------
  late: [
    "Ster binnen! Je mocht 'm al even doorslikken.",
    "Ruim gehaald — je had al mogen slikken.",
    "Meer dan genoeg gekauwd. Slik gerust eerder.",
    "Ster verdiend, en dan nog wat. Let op je seintje.",
    "Je bent voorbij het doel gekauwd. Mag hoor.",
    "Netjes — al was het iets langer dan nodig.",
    "Goed gedaan. Het seintje stond al even te stralen.",
    "Ster in de pocket. Je mag 'm eerder loslaten.",
    "Grondig! Iets té grondig misschien.",
    "Doel gehaald met marge. De volgende mag korter.",
    "Je nam de tijd. Ruim de tijd.",
    "Ster erbij. Kijk gerust naar je seintje.",
    "Lekker rustig — misschien iets te rustig.",
    "Mooi. Je had 'm al eerder mogen doorsturen.",
  ],

  // --- Far past the target, star still earned (12) -----------------------
  veryLate: [
    "Die hap heeft echt geleefd. Ster verdiend!",
    "Kauwmarathon. Petje af, maar het mag korter.",
    "Ster binnen — al was dit ruim dubbel het doel.",
    "Zat je even te dromen? Ster heb je in elk geval.",
    "Dat was een heel verhaal voor één hap.",
    "Ruimschoots gehaald. Slik gerust als je seintje komt.",
    "Je hebt 'm helemaal fijngemalen. Ster erbij.",
    "Zo lang hoeft het echt niet. Maar netjes wel.",
    "Je seintje stond al eeuwen te gloeien. Ster is binnen.",
    "Kampioen doorkauwen. De volgende mag vlotter.",
    "Dat is grondiger dan grondig.",
    "Ster verdiend — en je kaken hebben overgewerkt.",
  ],
}

/** How many "too early / too late" lines exist, i.e. everything but the praise pool. */
export const NUDGE_COUNT =
  FEEDBACK.veryEarly.length +
  FEEDBACK.early.length +
  FEEDBACK.nearlyThere.length +
  FEEDBACK.late.length +
  FEEDBACK.veryLate.length

/**
 * Returns a picker that walks each pool in a shuffled order, so a line never
 * repeats until every other line of that kind has been shown.
 */
export function createFeedbackPicker() {
  const queues: Partial<Record<FeedbackKind, string[]>> = {}

  const refill = (kind: FeedbackKind): string[] => {
    const pool = [...FEEDBACK[kind]]
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool
  }

  return (kind: FeedbackKind): string => {
    let q = queues[kind]
    if (!q || q.length === 0) q = queues[kind] = refill(kind)
    return q.pop() as string
  }
}
