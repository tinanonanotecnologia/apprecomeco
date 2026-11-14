import { catalog } from './model'
import type { Substance } from './model'

export const regions: Record<string, string[]> = {
  Norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
}
export const states = Object.values(regions).flat().sort()
export const clinicTypes = ['Serviço de saúde mental', 'Hospital psiquiátrico', 'Associação / organização']
export type AdmissionStats = { voluntary: number; involuntary: number; shares: number[] }
export const admissionCategories = ['Álcool', 'Cocaína', 'Crack', 'Cannabis', 'Outras']
export type Clinic = { id: string; name: string; city: string; state: string; type: string; address: string; phone: string; hours: string; about: string; photo?: string; approved: boolean; sample?: boolean; stats?: AdmissionStats }
export type Group = { id: string; name: string; network: 'WhatsApp' | 'Facebook'; url: string; about: string }
export type Professional = { id: string; name: string; specialty: string; registry: string; phone: string; website: string; about: string }
export type Review = { clinicId: string; stars: number; comment: string; liked: boolean }
export type FamilyLink = { id: string; clinicId: string; patient: string; family: string; contact: string; since: string; frequency: number; mood: string; progress: string; visit: string; authorized: boolean }
export type Post = { id: string; kind: 'Reels' | 'Stories'; title: string; created: number }
export const storyLifetime = 86_400_000
export type Community = {
  clinics: Clinic[]; reviews: Review[]; saved: string[]; groups: Group[]; professionals: Professional[]
  catalog: Substance[]; requests: string[]; links: FamilyLink[]; posts: Post[]
  message: string; messageDate: string; name: string; sampleFamily: boolean
}

const sampleClinics: Clinic[] = [
  { id: 'recomecar', name: 'Clínica Recomeçar', city: 'Campinas', state: 'SP', type: clinicTypes[0], address: 'Rua das Acácias, 123 · Jardim Taquaral', phone: '', hours: '24 horas', about: 'Exemplo de perfil para visualizar endereço, galeria e informações de atendimento.', approved: true, sample: true, stats: { voluntary: 246, involuntary: 68, shares: [34, 24, 17, 13, 12] } },
  { id: 'nova-vida', name: 'Comunidade Nova Vida', city: 'Campinas', state: 'SP', type: clinicTypes[2], address: 'Endereço demonstrativo', phone: '', hours: 'Horário demonstrativo', about: 'Exemplo de comunidade terapêutica.', approved: true, sample: true },
  { id: 'vida-plena', name: 'Clínica Vida Plena', city: 'Sorocaba', state: 'SP', type: clinicTypes[1], address: 'Endereço demonstrativo', phone: '', hours: 'Horário demonstrativo', about: 'Exemplo de perfil de hospital psiquiátrico.', approved: true, sample: true },
]

export const initialCommunity: Community = {
  clinics: sampleClinics, reviews: [], saved: [], groups: [], professionals: [], catalog, requests: [],
  links: [
    { id: 'example-family', clinicId: 'recomecar', patient: 'João P. S. (exemplo)', family: 'Familiar de demonstração', contact: '', since: '', frequency: 100, mood: 'Estável', progress: 'Participação nas atividades e evolução acompanhada pela equipe.', visit: '', authorized: true },
  ],
  posts: [], message: '', messageDate: '', name: '', sampleFamily: false,
}
const key = 'recomeco:comunidade:v1'
const viewedPostsKey = 'recomeco:publicacoes-vistas:v1'

export function readViewedPosts(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(viewedPostsKey) || '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch { return [] }
}

export function writeViewedPosts(ids: string[]) {
  localStorage.setItem(viewedPostsKey, JSON.stringify(ids))
}

export function readCommunity(): Community {
  try { return { ...initialCommunity, ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return initialCommunity }
}
export function writeCommunity(data: Community) { localStorage.setItem(key, JSON.stringify(data)) }
export function resetCommunity() {
  localStorage.removeItem(key)
  localStorage.removeItem(viewedPostsKey)
}
export type SaveCommunity = (next: Community, message: string) => boolean

function openMedia(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('recomeco-comunidade', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('midia')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function media<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openMedia()
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction('midia', mode)
    const request = operation(transaction.objectStore('midia'))
    transaction.oncomplete = () => { db.close(); resolve(request.result) }
    transaction.onabort = () => { db.close(); reject(transaction.error || request.error) }
  })
}

export const saveMedia = (id: string, file: Blob) => media('readwrite', (store) => store.put(file, id))
export const getMedia = (id: string) => media<Blob | undefined>('readonly', (store) => store.get(id))
export const deleteMedia = (id: string) => media('readwrite', (store) => store.delete(id))
export const clearMedia = () => media('readwrite', (store) => store.clear())

export function httpUrl(input: string) {
  if (!input) return ''
  try { const url = new URL(input); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' }
  catch { return '' }
}
