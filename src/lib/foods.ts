// Rough kcal/100g by food category, for the manual meal log (photo + weight + category).
// These are deliberately coarse ballparks, shown with a range — never presented as precise.
export interface FoodCategory {
  key: string
  label: string
  kcalPer100: number
}

export const FOODS: FoodCategory[] = [
  { key: 'soup', label: 'Soep', kcalPer100: 45 },
  { key: 'salad', label: 'Salade / rauwkost', kcalPer100: 60 },
  { key: 'veg', label: 'Groente (gekookt)', kcalPer100: 70 },
  { key: 'fruit', label: 'Fruit', kcalPer100: 60 },
  { key: 'yoghurt', label: 'Yoghurt / kwark', kcalPer100: 75 },
  { key: 'mixed', label: 'Gemengde maaltijd', kcalPer100: 130 },
  { key: 'potato', label: 'Aardappel / rijst / pasta', kcalPer100: 150 },
  { key: 'meatfish', label: 'Vlees / vis', kcalPer100: 185 },
  { key: 'bread', label: 'Brood / broodje', kcalPer100: 250 },
  { key: 'fried', label: 'Gebakken / vet gerecht', kcalPer100: 290 },
  { key: 'cheese', label: 'Kaas / noten', kcalPer100: 380 },
  { key: 'snack', label: 'Snack / koek / gebak', kcalPer100: 450 },
]

export function foodByKey(key: string): FoodCategory | undefined {
  return FOODS.find((f) => f.key === key)
}

export function estimateKcal(grams: number, kcalPer100: number): number {
  return Math.round((grams * kcalPer100) / 100)
}
