export const categories = [
  { id: 'bebidas', name: 'Bebidas alcoólicas', icon: 'bebidas' },
  { id: 'tabaco', name: 'Tabaco e derivados', icon: 'tabaco' },
  { id: 'cannabis', name: 'Cannabis', icon: 'cannabis' },
  { id: 'estimulantes', name: 'Estimulantes', icon: 'medicamentos' },
  { id: 'medicamentos', name: 'Medicamentos controlados', icon: 'medicamentos' },
  { id: 'outras', name: 'Outras substâncias', icon: 'outras' },
] as const

export type Category = typeof categories[number]['id']
export type Substance = { id: string; name: string; category: Category; aliases?: string }
export type Track = { substance: Substance; start: string; dailyCost: number }
export type Entry = { substanceId: string; date: string; used: boolean }
export type Note = { date: string; mood: string; trigger: string; text: string }
export type Data = { tracks: Track[]; entries: Entry[]; notes: Note[] }

export const catalog: Substance[] = [
  { id: 'alcool', name: 'Álcool', category: 'bebidas', aliases: 'bebida alcoólica etanol' },
  { id: 'cerveja', name: 'Cerveja', category: 'bebidas', aliases: 'chopp chope' },
  { id: 'vinho', name: 'Vinho', category: 'bebidas' },
  { id: 'cachaca', name: 'Cachaça', category: 'bebidas', aliases: 'pinga aguardente' },
  { id: 'vodca', name: 'Vodca', category: 'bebidas', aliases: 'vodka' },
  { id: 'uísque', name: 'Uísque', category: 'bebidas', aliases: 'whisky whiskey' },
  { id: 'gin', name: 'Gin', category: 'bebidas' },
  { id: 'rum', name: 'Rum', category: 'bebidas' },
  { id: 'tequila', name: 'Tequila', category: 'bebidas' },
  { id: 'espumante', name: 'Espumante', category: 'bebidas', aliases: 'champanhe prosecco' },
  { id: 'licor', name: 'Licor', category: 'bebidas' },
  { id: 'cigarro', name: 'Cigarro', category: 'tabaco', aliases: 'nicotina fumo' },
  { id: 'vape', name: 'Cigarro eletrônico', category: 'tabaco', aliases: 'vape pod nicotina' },
  { id: 'narguile', name: 'Narguilé', category: 'tabaco', aliases: 'tabaco hookah' },
  { id: 'charuto', name: 'Charuto', category: 'tabaco' },
  { id: 'maconha', name: 'Maconha', category: 'cannabis', aliases: 'cannabis erva thc' },
  { id: 'haxixe', name: 'Haxixe', category: 'cannabis', aliases: 'cannabis hash' },
  { id: 'cocaina', name: 'Cocaína', category: 'estimulantes', aliases: 'pó' },
  { id: 'crack', name: 'Crack', category: 'estimulantes' },
  { id: 'anfetamina', name: 'Anfetaminas', category: 'estimulantes', aliases: 'rebite metanfetamina' },
  { id: 'mdma', name: 'MDMA', category: 'estimulantes', aliases: 'ecstasy êxtase' },
  { id: 'benzodiazepinicos', name: 'Benzodiazepínicos', category: 'medicamentos', aliases: 'clonazepam diazepam alprazolam' },
  { id: 'opioides', name: 'Opioides', category: 'medicamentos', aliases: 'codeína fentanil morfina oxicodona tramadol heroína' },
  { id: 'cetamina', name: 'Cetamina', category: 'medicamentos', aliases: 'ketamina' },
  { id: 'inalantes', name: 'Inalantes', category: 'outras', aliases: 'solventes lança perfume loló' },
  { id: 'lsd', name: 'LSD', category: 'outras', aliases: 'ácido alucinógenos' },
  { id: 'psilocibina', name: 'Psilocibina', category: 'outras', aliases: 'cogumelos alucinógenos' },
]

const storageKey = 'recomeco:preview:v1'
export const empty: Data = { tracks: [], entries: [], notes: [] }
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
    return Array.isArray(data.tracks) && Array.isArray(data.entries) && Array.isArray(data.notes) ? data : empty
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
  { theme: 'Superação', text: 'Um dia difícil não apaga o caminho que você já percorreu.' },
  { theme: 'Família', text: 'Quem acompanha um recomeço também precisa encontrar um lugar onde possa ser ouvido.' },
  { theme: 'Limites', text: 'Você pode cuidar de alguém e ainda reservar tempo para cuidar de si.' },
  { theme: 'Diálogo', text: 'Perguntar como a pessoa está e escutar a resposta já é uma forma de estar presente.' },
  { theme: 'Acolhimento', text: 'Quando não souber por onde começar, pense em uma pessoa com quem você pode conversar.' },
  { theme: 'Fé', text: 'Há tempo de chorar e tempo de rir, tempo de prantear e tempo de dançar.', source: 'Eclesiastes 3:4' },
]
