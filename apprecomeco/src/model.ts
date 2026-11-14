export const categories = [
  { id: 'bebidas', name: 'Bebidas alcoólicas', icon: 'bebidas' },
  { id: 'ilicitas', name: 'Drogas ilícitas', icon: 'cannabis' },
  { id: 'medicamentos', name: 'Medicamentos controlados', icon: 'medicamentos' },
  { id: 'tabaco', name: 'Tabaco e derivados', icon: 'tabaco' },
  { id: 'sinteticas', name: 'Substâncias sintéticas', icon: 'sinteticas' },
  { id: 'outras', name: 'Outras substâncias', icon: 'outras' },
  { id: 'cannabis', name: 'Cannabis', icon: 'cannabis' },
  { id: 'estimulantes', name: 'Estimulantes', icon: 'cocaina' },
  { id: 'depressores', name: 'Depressores', icon: 'depressores' },
  { id: 'alucinogenos', name: 'Alucinógenos', icon: 'alucinogenos' },
  { id: 'opioides', name: 'Opioides', icon: 'opioides' },
  { id: 'inalantes', name: 'Inalantes', icon: 'inalantes' },
] as const

export type Category = typeof categories[number]['id']
export type Substance = { id: string; name: string; category: Category; aliases?: string; icon?: string }
export type Track = { substance: Substance; start: string; dailyCost: number }
export type Entry = { substanceId: string; date: string; used: boolean; quantity?: number; unit?: string; observation?: string }
export type Note = { date: string; mood: string; trigger: string; text: string }
export type Data = { tracks: Track[]; entries: Entry[]; notes: Note[]; favorites: string[] }

export const catalog: Substance[] = [
  { id: 'alcool', name: 'Álcool', category: 'bebidas', aliases: 'bebida alcoólica etanol' },
  { id: 'cerveja', name: 'Cerveja', category: 'bebidas', aliases: 'chopp chope' },
  { id: 'chopp', name: 'Chopp', category: 'bebidas', aliases: 'chope' },
  { id: 'vinho', name: 'Vinho', category: 'bebidas', icon: 'vinho-tinto' },
  { id: 'vinho-tinto', name: 'Vinho tinto', category: 'bebidas', icon: 'vinho-tinto' },
  { id: 'vinho-branco', name: 'Vinho branco', category: 'bebidas', icon: 'vinho-branco' },
  { id: 'cachaca', name: 'Cachaça', category: 'bebidas', aliases: 'pinga aguardente', icon: 'cachaca' },
  { id: 'vodca', name: 'Vodka', category: 'bebidas', aliases: 'vodca', icon: 'vodka' },
  { id: 'uísque', name: 'Whisky', category: 'bebidas', aliases: 'uísque whiskey', icon: 'whisky' },
  { id: 'gin', name: 'Gin', category: 'bebidas', icon: 'gin' },
  { id: 'rum', name: 'Rum', category: 'bebidas', icon: 'rum' },
  { id: 'tequila', name: 'Tequila', category: 'bebidas', icon: 'tequila' },
  { id: 'espumante', name: 'Espumante', category: 'bebidas', aliases: 'champanhe prosecco', icon: 'espumante' },
  { id: 'licor', name: 'Licor', category: 'bebidas', icon: 'licor' },
  { id: 'drinks', name: 'Drinks', category: 'bebidas', aliases: 'coquetel caipirinha', icon: 'drinks' },
  { id: 'cigarro', name: 'Cigarro', category: 'tabaco', aliases: 'nicotina fumo' },
  { id: 'vape', name: 'Cigarro eletrônico', category: 'tabaco', aliases: 'vape pod nicotina' },
  { id: 'narguile', name: 'Narguilé', category: 'tabaco', aliases: 'tabaco hookah', icon: 'narguile' },
  { id: 'charuto', name: 'Charuto', category: 'tabaco' },
  { id: 'maconha', name: 'Maconha', category: 'cannabis', aliases: 'cannabis erva thc' },
  { id: 'haxixe', name: 'Haxixe', category: 'cannabis', aliases: 'cannabis hash' },
  { id: 'cocaina', name: 'Cocaína', category: 'estimulantes', aliases: 'pó', icon: 'cocaina' },
  { id: 'crack', name: 'Crack', category: 'estimulantes', aliases: 'cocaína', icon: 'crack' },
  { id: 'pasta-base', name: 'Pasta base (Cocaína)', category: 'estimulantes', icon: 'cocaina' },
  { id: 'merla', name: 'Merla', category: 'estimulantes', aliases: 'cocaína', icon: 'cannabis' },
  { id: 'cloridrato', name: 'Cloridrato de cocaína', category: 'estimulantes', icon: 'sinteticas' },
  { id: 'anfetamina', name: 'Anfetaminas', category: 'estimulantes', aliases: 'rebite metanfetamina' },
  { id: 'mdma', name: 'Ecstasy (MDMA)', category: 'sinteticas', aliases: 'êxtase estimulante', icon: 'ecstasy' },
  { id: 'benzodiazepinicos', name: 'Benzodiazepínicos', category: 'medicamentos', aliases: 'clonazepam diazepam alprazolam' },
  { id: 'opioides', name: 'Opioides', category: 'medicamentos', aliases: 'codeína fentanil morfina oxicodona tramadol heroína' },
  { id: 'cetamina', name: 'Cetamina', category: 'medicamentos', aliases: 'ketamina' },
  { id: 'inalantes', name: 'Inalantes', category: 'inalantes', aliases: 'solventes' },
  { id: 'lanca', name: 'Lança-perfume', category: 'inalantes', aliases: 'loló lança perfume', icon: 'cocaina' },
  { id: 'lsd', name: 'LSD', category: 'alucinogenos', aliases: 'ácido alucinógenos' },
  { id: 'psilocibina', name: 'Psilocibina', category: 'alucinogenos', aliases: 'cogumelos alucinógenos' },
]

const storageKey = 'recomeco:preview:v1'
export const empty: Data = { tracks: [], entries: [], notes: [], favorites: [] }
export const normalize = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export function dateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`))
}

export const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function streak(track: Track, entries: Entry[], today: string) {
  const lastUse = entries.filter((entry) => entry.used && entry.substanceId === track.substance.id && entry.date <= today)
    .reduce((latest, entry) => entry.date > latest ? entry.date : latest, track.start)
  return Math.max(0, Math.round((Date.parse(today) - Date.parse(lastUse)) / 86_400_000))
}

export function readData(): Data {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return empty
    const data = JSON.parse(raw)
    if (!Array.isArray(data.tracks) || !Array.isArray(data.entries) || !Array.isArray(data.notes)) return empty
    return { ...empty, ...data, favorites: Array.isArray(data.favorites) ? data.favorites : [] }
  } catch {
    return empty
  }
}

export function persist(data: Data) {
  localStorage.setItem(storageKey, JSON.stringify(data))
}

export function clearData() {
  localStorage.removeItem(storageKey)
}

export const milestones = [7, 30, 90]

export const reflections = [
  { id: 'familia', theme: 'Família', text: 'A dor da família muitas vezes é invisível. Ela se expressa na preocupação, no medo, na saudade de ver quem amamos bem novamente.' },
  { id: 'limites', theme: 'Codependência', text: 'Codependência não é culpa. Cuidar de quem amamos também exige limites, equilíbrio e autocuidado.' },
  { id: 'superacao', theme: 'Superação', text: 'Um dia difícil não apaga o caminho que você já percorreu.' },
  { id: 'dialogo', theme: 'Diálogo', text: 'O diálogo e a aceitação abrem caminhos para a confiança, o apoio e a reconstrução dos laços familiares.' },
  { id: 'apoio', theme: 'Acolhimento', text: 'Você não está sozinho. Há ajuda, tratamento e pessoas que se importam com a sua recuperação.' },
  { id: 'fe', theme: 'Bíblicas', text: 'Tudo posso naquele que me fortalece.', source: 'Filipenses 4:13' },
]
