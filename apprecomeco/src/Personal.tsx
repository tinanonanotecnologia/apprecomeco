import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight, BookOpen, CalendarDays, ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight,
  CircleCheck, Clock3, Grid2X2, Heart, Mic, Minus, Pencil, PiggyBank, Plus, Quote, Search, Target, Users, X,
} from 'lucide-react'
import { categories, dateKey, formatDate, milestones, money, normalize, reflections, streak } from './model'
import type { Category, Data, Entry, Substance, Track } from './model'
import { art, Callout, Heading, SubstanceIcon } from './ui'

export type SaveData = (next: Data, message: string) => boolean

export function Home({ data, catalog, today, message, add }: {
  data: Data; catalog: Substance[]; today: string; message: string; add: () => void
}) {
  const starter = ['alcool', 'maconha', 'cocaina', 'outras'].map((id) => catalog.find((item) => item.id === id) ||
    { id, name: id === 'outras' ? 'Outras' : id === 'alcool' ? 'Álcool' : id === 'maconha' ? 'Cannabis' : 'Cocaína', category: 'outras' as const })
  const cards = [...data.tracks.map((item) => item.substance), ...starter.filter((item) => !data.tracks.some((track) => track.substance.id === item.id))]
  return <>
    <section className="home-hero"><img src={art('nascer-do-sol')} alt="" /><div>
      <h1>Olá, Guerreiro!</h1><p>Cada dia limpo é uma<br /> nova vitória!</p>
    </div></section>
    <section className="home-days panel">
      <h2>Meus dias limpos</h2>
      <div className="counter-grid">{cards.map((item) => {
        const track = data.tracks.find((row) => row.substance.id === item.id)
        return <a href={track ? `#uso/${encodeURIComponent(item.id)}` : `#registrar/${encodeURIComponent(item.id)}`} className="panel counter" key={item.id}>
          <SubstanceIcon item={item} /><strong>{item.id === 'maconha' ? 'Cannabis' : item.name}</strong>
          <span>{track ? `${streak(track, data.entries, today)} dias` : 'Começar'}</span>
        </a>
      })}<button className="panel counter add-counter" onClick={add}><Plus size={25} /><strong>Adicionar substância</strong></button></div>
    </section>
    <section className="message-panel lavender"><Quote size={27} /><div><h2>Mensagem do dia</h2><p>{message || 'Você é mais forte do que a vontade de usar. Continue firme, um dia de cada vez. A sua recuperação importa!'}</p></div></section>
    <section className="message-panel peach"><Users size={25} /><div><h2>Reflexão familiar</h2><p>Sua família também caminha com você. O seu esforço de hoje é um cuidado com quem te ama.</p></div></section>
    <a className="button primary full" href="#biblioteca"><BookOpen size={21} /> Biblioteca de Frases</a>
  </>
}

const mainCategories = categories.slice(0, 6)
const drugCategories = categories.filter(({ id }) => ['estimulantes', 'depressores', 'alucinogenos', 'opioides', 'inalantes', 'outras'].includes(id))
const popular = ['alcool', 'cigarro', 'maconha', 'cocaina', 'crack', 'mdma', 'lanca', 'narguile']
const drinkNames = ['cerveja', 'chopp', 'vinho-tinto', 'vinho-branco', 'espumante', 'vodca', 'uísque', 'cachaca', 'rum', 'gin', 'tequila', 'licor', 'drinks']

function inCategory(item: Substance, category: Category | 'todas') {
  if (category === 'todas') return true
  if (category === 'ilicitas') return ['ilicitas', 'cannabis', 'estimulantes', 'alucinogenos', 'sinteticas', 'inalantes', 'opioides'].includes(item.category)
  if (category === 'opioides') return item.id === 'opioides' || item.category === 'opioides'
  if (category === 'depressores') return ['medicamentos', 'depressores'].includes(item.category)
  return item.category === category
}

type SearchRecognition = { lang: string; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; start(): void }

export function RegisterCatalog({ catalog, data, select, add, request, initialCategory = 'todas', list = false }: {
  catalog: Substance[]; data: Data; select: (item: Substance) => void; add: (category?: Category) => void
  request: (name: string) => void; initialCategory?: Category | 'todas'; list?: boolean
}) {
  const [query, search] = useState('')
  const [category, filter] = useState(initialCategory)
  const [showAll, setAll] = useState(list)
  const [letter, setLetter] = useState('')
  const [chosen, choose] = useState<Substance | null>(null)
  const [amount, setAmount] = useState(1)
  const [voiceError, setVoiceError] = useState(false)
  const lookup = normalize(query)
  const isDrinks = !lookup && category === 'bebidas' && !showAll
  const drugs = category === 'ilicitas'
  const matches = catalog.filter((item) => inCategory(item, category)
    && normalize(`${item.name} ${item.aliases || ''}`).includes(lookup)
    && (!letter || normalize(item.name).startsWith(letter)))
  if (showAll && !lookup) matches.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  const buttons = (items: readonly { id: Category; name: string }[], compact = false) => <div className={compact ? 'mini-grid' : 'category-grid'}>{items.map((item) => (
    <button key={item.id} className="panel category" onClick={() => { filter(item.id); search(''); setLetter(''); choose(null); setAll(false) }}>
      <SubstanceIcon item={item.id} /><strong>{item.name}</strong>{!compact && <ChevronRight size={19} />}
    </button>
  ))}</div>
  function voiceSearch() {
    const browser = window as Window & { webkitSpeechRecognition?: new () => SearchRecognition; SpeechRecognition?: new () => SearchRecognition }
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition
    setVoiceError(!Recognition)
    if (!Recognition) return
    const recognition = new Recognition()
    recognition.lang = 'pt-BR'
    recognition.onresult = (event) => { search(event.results[0][0].transcript); setLetter('') }
    recognition.onerror = () => setVoiceError(true)
    try { recognition.start() } catch { setVoiceError(true) }
  }
  function toggleCategory(next: Category | 'todas') {
    filter(next); setLetter(''); choose(null)
  }
  return <>
    <Heading title={showAll ? 'Todas as substâncias' : 'Registrar consumo'} />
    <div className="section-title">Buscar substância</div>
    <div className="search-bar"><Search size={21} /><input type="search" aria-label="Buscar substância" placeholder="Buscar substância" value={query} onChange={(event) => { search(event.target.value); setLetter('') }} />
      {query ? <button className="bare-icon" aria-label="Limpar busca" onClick={() => search('')}><X size={21} /></button> : <button className="bare-icon" aria-label="Buscar por voz" onClick={voiceSearch}><Mic size={19} /></button>}
    </div>
    {voiceError && <p className="feedback">Busca por voz indisponível. Digite o nome da substância.</p>}
    {!lookup && !showAll && category === 'todas' && <>
      <Callout><strong>Busca inteligente:</strong> encontre substâncias pelo nome, variações e nomes comuns usados no Brasil.</Callout>
      {data.tracks.length > 0 && <><h2 className="section-title">Meu acompanhamento</h2><div className="stack">{data.tracks.map((track) => <button key={track.substance.id} className="panel line-button" onClick={() => select(track.substance)}><SubstanceIcon item={track.substance} /><strong>{track.substance.name}</strong><ChevronRight size={19} /></button>)}</div></>}
      <h2 className="section-title">Categorias</h2>{buttons(mainCategories)}
      <button className="panel line-button full" onClick={() => { setAll(true); setLetter('') }}><Grid2X2 size={21} /><strong>Todas as substâncias (Brasil)</strong><ChevronRight size={19} /></button>
      <h2 className="section-title">Mais usadas</h2><div className="mini-grid">{popular.map((id) => catalog.find((item) => item.id === id)).filter((item): item is Substance => Boolean(item)).map((item) => <button className="panel category" key={item.id} onClick={() => select(item)}><SubstanceIcon item={item} /><strong>{item.name}</strong></button>)}</div>
    </>}
    {showAll && <><div className="chips" aria-label="Filtros do catálogo">
      {([['todas', 'Todas'], ['bebidas', 'Álcool'], ['tabaco', 'Tabaco'], ['ilicitas', 'Drogas'], ['outras', 'Outras']] as const).map(([id, title]) => <button key={id} aria-pressed={category === id} onClick={() => toggleCategory(id)}>{title}</button>)}
      </div><div className="alphabet" aria-label="Índice alfabético">{Array.from(new Set(catalog.filter((item) => inCategory(item, category)).map((item) => normalize(item.name)[0]))).sort().map((initial) => <button key={initial} aria-pressed={letter === initial} onClick={() => setLetter(letter === initial ? '' : initial)}>{initial.toUpperCase()}</button>)}</div></>}
    {isDrinks && <><div className="segments"><button aria-pressed onClick={() => toggleCategory('bebidas')}>Bebidas alcoólicas</button><button aria-pressed={false} onClick={() => toggleCategory('ilicitas')}>Outras drogas</button></div>
      <h2 className="section-title">Qual bebida você bebeu?</h2><div className="drink-grid">
        {drinkNames.map((id) => catalog.find((item) => item.id === id)).filter((item): item is Substance => Boolean(item)).map((item) => <button key={item.id} className="panel category" aria-pressed={chosen?.id === item.id} onClick={() => choose(item)}><SubstanceIcon item={item} /><strong>{item.name}</strong></button>)}
        <button className="panel category" onClick={() => add('bebidas')}><SubstanceIcon item="outras" /><strong>Outra bebida</strong></button>
      </div>
      <div className="quantity-label">Quantidade <small>Dose / lata / taça</small><Quantity value={amount} onChange={setAmount} /></div>
      <a className={`button primary full ${chosen ? '' : 'visually-disabled'}`} aria-disabled={!chosen} href={chosen ? `#registrar/${encodeURIComponent(chosen.id)}/${amount}` : undefined} onClick={(event) => { if (!chosen) event.preventDefault() }}>Continuar</a>
    </>}
    {drugs && !lookup && !showAll && <><h2 className="section-title">Ou explore por categoria</h2>{buttons(drugCategories, true)}</>}
    {!isDrinks && (lookup || showAll || category !== 'todas') && <>
      <div className="stack">{matches.map((item) => <button key={item.id} className="panel line-button" onClick={() => select(item)}><SubstanceIcon item={item} /><strong>{item.name}</strong><ChevronRight size={18} /></button>)}</div>
      <Callout><strong>Não encontrou?</strong> {lookup ? <button className="inline-button" onClick={() => request(query.trim())}>Solicite a inclusão ao administrador.</button> : 'Você pode adicionar uma substância ao acompanhamento.'}</Callout>
    </>}
    <button className="button soft full" onClick={() => add(category === 'todas' ? undefined : category)}><Plus size={18} /> Adicionar substância</button>
  </>
}

function Quantity({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  return <span className="quantity">
    <button type="button" aria-label="Diminuir quantidade" disabled={!value} onClick={() => onChange(Math.max(0, value - 1))}><Minus size={19} /></button>
    <input type="number" min="0" max="999" step="1" aria-label="Quantidade" value={value || ''} placeholder="—" onChange={(event) => onChange(Math.max(0, Math.min(999, Math.trunc(Number(event.target.value) || 0))))} />
    <button type="button" aria-label="Aumentar quantidade" disabled={value >= 999} onClick={() => onChange(Math.min(999, value + 1))}><Plus size={19} /></button>
  </span>
}

export function TrackForm({ choices, substance, category, today, submit }: {
  choices: Substance[]; substance?: Substance; category?: Category; today: string; submit: (track: Track) => string | undefined
}) {
  const [selected, setSelected] = useState(substance?.id || '')
  const [error, setError] = useState('')
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const existing = substance || choices.find((item) => item.id === selected)
    const name = String(fields.get('name') || '').trim()
    if (!existing && !name) { setError('Informe o nome da substância.'); return }
    setError(submit({
      substance: existing || { id: crypto.randomUUID(), name, category: fields.get('category') as Category },
      start: String(fields.get('start')), dailyCost: Number(fields.get('cost') || 0),
    }) || '')
  }
  return <form className="form" onSubmit={onSubmit}>
    {substance ? <div className="panel line-button"><SubstanceIcon item={substance} /><strong>{substance.name}</strong></div> : <>
      <label>Substância<select value={selected} onChange={(event) => setSelected(event.target.value)}>
        <option value="">Adicionar outra substância</option>{choices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
      {!selected && <><label>Nome<input name="name" required maxLength={60} /></label>
        <label>Categoria<select name="category" defaultValue={category || 'outras'}>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></>}
    </>}
    <label>Data de início<input name="start" type="date" max={today} defaultValue={today} required /></label>
    <label>Gasto diário estimado em R$ (opcional)<input name="cost" type="number" min="0" max="100000" step=".01" inputMode="decimal" placeholder="0,00" /></label>
    {error && <p className="feedback" role="alert">{error}</p>}
    <button className="button primary full"><Plus size={18} /> Iniciar acompanhamento</button>
  </form>
}

export function Record({ track, today, initialDate, amount, data, submit }: {
  track: Track; today: string; initialDate?: string; amount?: number; data: Data; submit: (entry: Entry) => void
}) {
  const [day, setDay] = useState(initialDate || today)
  const current = data.entries.find((entry) => entry.date === day && entry.substanceId === track.substance.id)
  return <>
    <Heading title="Registrar uso" />
    <div className="panel line-button record-item"><SubstanceIcon item={track.substance} /><div><h2>{track.substance.name}</h2><p>{categories.find((item) => item.id === track.substance.category)?.name}</p></div></div>
    <label className="date-inline">Data do registro <input type="date" aria-label="Data do registro" value={day} min={track.start} max={today} onChange={(event) => { if (event.target.validity.valid && event.target.value) setDay(event.target.value) }} /></label>
    <RecordFields key={day} entry={current} track={track} day={day} amount={amount} submit={submit} />
  </>
}

function RecordFields({ track, day, amount, entry, submit }: {
  track: Track; day: string; amount?: number; entry?: Entry; submit: (entry: Entry) => void
}) {
  const [used, setUsed] = useState<boolean | undefined>(entry?.used)
  const [quantity, setQuantity] = useState(entry?.quantity ?? amount ?? 0)
  const drinks = track.substance.category === 'bebidas'
  return <form className="form record-form" onSubmit={(event) => {
    event.preventDefault()
    if (used === undefined) return
    const fields = new FormData(event.currentTarget)
    submit({
      substanceId: track.substance.id, date: day, used, quantity: used && quantity ? quantity : undefined,
      unit: used && quantity ? String(fields.get('unit') || '') : undefined,
      observation: String(fields.get('observation') || '').trim() || undefined,
    })
  }}>
    <fieldset><legend>Como foi hoje?</legend><div className="segments record-options">
      <label className={used === false ? 'selected' : ''}><input type="radio" name="result" required checked={used === false} onChange={() => setUsed(false)} /><CircleCheck size={19} /> Não usei</label>
      <label className={used === true ? 'selected used' : ''}><input type="radio" name="result" required checked={used === true} onChange={() => setUsed(true)} /><span className="red-dot" /> Usei</label>
    </div></fieldset>
    <fieldset disabled={used === false} className="record-quantity"><legend>Quantidade (opcional)</legend><Quantity value={quantity} onChange={setQuantity} />
      {drinks && <label className="unit-field">Unidade<select aria-label="Unidade" name="unit" defaultValue={entry?.unit || 'Lata (350 ml)'}><option>Lata (350 ml)</option><option>Garrafa</option><option>Taça</option><option>Dose</option><option>Outro</option></select></label>}</fieldset>
    <label>Observação (opcional)<span className="field-with-icon"><Pencil size={17} /><textarea rows={2} name="observation" maxLength={500} placeholder="Ex.: vontade, gatilho, situação..." defaultValue={entry?.observation} /></span></label>
    <button className="button primary full"><CircleCheck size={20} /> Salvar registro</button>
  </form>
}

const moods = [['Ótimo', '😁'], ['Bem', '🙂'], ['Neutro', '😐'], ['Ansioso', '😟'], ['Triste', '☹️'], ['Cansado', '😴']] as const
const triggers = ['Estresse', 'Ansiedade', 'Conflito', 'Solidão', 'Ambiente', 'Amizades', 'Tédio', 'Outros']

export function Diary({ data, today, save }: { data: Data; today: string; save: SaveData }) {
  const [day, setDay] = useState(today)
  const note = data.notes.find((item) => item.date === day)
  return <><Heading title="Meu Diário">Registre como se sentiu hoje, seus gatilhos e aprendizados.</Heading>
    <label className="date-inline">Data <input aria-label="Data da anotação" type="date" value={day} max={today} onChange={(event) => setDay(event.target.value || today)} /></label>
    <DiaryForm key={day} note={note} onSave={(mood, trigger, text) => save({ ...data, notes: [...data.notes.filter((item) => item.date !== day), { date: day, mood, trigger, text }] }, 'Diário salvo neste navegador.')} />
    {data.notes.length > 0 && <section className="stack"><h2>Anotações anteriores</h2>{[...data.notes].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <button className="panel line-button" key={item.date} onClick={() => setDay(item.date)}><CalendarDays size={20} /><strong>{formatDate(item.date)} · {item.mood}</strong><ChevronRight size={18} /></button>)}</section>}
  </>
}

function DiaryForm({ note, onSave }: { note?: Data['notes'][number]; onSave: (mood: string, trigger: string, text: string) => void }) {
  const [mood, setMood] = useState(note?.mood || '')
  const [tags, setTags] = useState(note?.trigger.split(', ').filter(Boolean) || [])
  const [custom, setCustom] = useState(false)
  return <form className="form" onSubmit={(event) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const extra = String(fields.get('extra') || '').trim()
    onSave(mood, [...new Set([...tags, ...(extra ? [extra] : [])])].join(', '), String(fields.get('text') || '').trim())
  }}>
    <fieldset><legend>Meu humor hoje</legend><div className="moods">{moods.map(([name, face]) => <label key={name} className="panel"><input type="radio" name="humor" required checked={mood === name} onChange={() => setMood(name)} /><span aria-hidden>{face}</span>{name}</label>)}
      {note?.mood && !moods.some(([name]) => name === note.mood) && <label className="panel"><input type="radio" name="humor" checked={mood === note.mood} onChange={() => setMood(note.mood)} />{note.mood}</label>}</div></fieldset>
    <fieldset><legend>Gatilhos de hoje</legend><div className="chips">{[...new Set([...triggers, ...tags])].map((item) => <button type="button" key={item} aria-pressed={tags.includes(item)} onClick={() => setTags(tags.includes(item) ? tags.filter((value) => value !== item) : [...tags, item])}>{item}</button>)}<button type="button" onClick={() => setCustom(!custom)} aria-label="Adicionar outro gatilho"><Plus size={17} /></button></div>
      {custom && <label>Outro gatilho<input name="extra" maxLength={80} /></label>}</fieldset>
    <label>Anotação livre<span className="field-with-icon"><Pencil size={18} /><textarea name="text" rows={4} placeholder="Escreva aqui como foi o seu dia..." maxLength={2000} defaultValue={note?.text} /></span></label>
    <button className="button primary full"><CircleCheck size={19} /> Salvar diário</button>
  </form>
}

function lastUse(data: Data) {
  return data.entries.filter((item) => item.used).map((item) => item.date).sort().at(-1)
}

function longest(data: Data, today: string) {
  return Math.max(0, ...data.tracks.map((track) => {
    const dates = data.entries.filter((item) => item.substanceId === track.substance.id && item.used).map((item) => item.date).sort()
    let start = track.start
    let result = 0
    for (const end of [...dates, today]) {
      if (end < start) continue
      result = Math.max(result, Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000))
      start = end
    }
    return result
  }))
}

export function HistoryPage({ data, today }: { data: Data; today: string }) {
  const [period, setPeriod] = useState('Mensal')
  const [tab, setTab] = useState('Gráfico')
  const [chart, setChart] = useState('Substâncias')
  const [base, setBase] = useState(today)
  const date = new Date(base + 'T12:00:00')
  const start = new Date(date)
  if (period === 'Semanal') start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  if (period === 'Mensal') start.setDate(1)
  if (period === 'Anual') start.setMonth(0, 1)
  const end = new Date(start)
  if (period === 'Semanal') end.setDate(end.getDate() + 7)
  if (period === 'Mensal') end.setMonth(end.getMonth() + 1)
  if (period === 'Anual') end.setFullYear(end.getFullYear() + 1)
  const startKey = dateKey(start)
  const endKey = dateKey(end)
  const entries = data.entries.filter((item) => item.date >= startKey && item.date < endKey).sort((a, b) => b.date.localeCompare(a.date))
  const label = period === 'Semanal' ? `Semana de ${formatDate(startKey)}` : new Intl.DateTimeFormat('pt-BR', period === 'Anual' ? { year: 'numeric' } : { month: 'long', year: 'numeric' }).format(start)
  const counts = data.tracks.map((item) => ({ item, count: entries.filter((entry) => entry.substanceId === item.substance.id && !entry.used).length }))
  const groupKeys = period === 'Anual' ? 12 : period === 'Mensal' ? 5 : 7
  const periods = Array.from({ length: groupKeys }, (_, index) => {
    const current = new Date(start)
    if (period === 'Anual') current.setMonth(index)
    else current.setDate(start.getDate() + index * (period === 'Mensal' ? 7 : 1))
    const next = new Date(current)
    if (period === 'Anual') next.setMonth(next.getMonth() + 1)
    else next.setDate(next.getDate() + (period === 'Mensal' ? 7 : 1))
    const label = period === 'Anual' ? new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(current) : period === 'Mensal' ? `Sem ${index + 1}` : new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(current)
    const count = new Set(entries.filter((entry) => !entry.used && entry.date >= dateKey(current) && entry.date < dateKey(next)).map((entry) => entry.date)).size
    return { label, count }
  })
  const max = Math.max(1, ...(chart === 'Substâncias' ? counts : periods).map((item) => item.count))
  const previous = new Date(start)
  if (period === 'Anual') previous.setFullYear(previous.getFullYear() - 1)
  else if (period === 'Mensal') previous.setMonth(previous.getMonth() - 1)
  else previous.setDate(previous.getDate() - 7)
  const previousStart = dateKey(previous)
  const previousCount = new Set(data.entries.filter((entry) => !entry.used && entry.date >= previousStart && entry.date < startKey).map((entry) => entry.date)).size
  const cleanDays = new Set(entries.filter((entry) => !entry.used).map((entry) => entry.date)).size
  const variation = cleanDays - previousCount
  function move(back: boolean) {
    if (!back) { setBase(endKey); return }
    const previous = new Date(start)
    previous.setDate(previous.getDate() - 1)
    setBase(dateKey(previous))
  }
  const recent = lastUse(data)
  return <><Heading title="Meu Histórico" />
    <div className="segments">{['Semanal', 'Mensal', 'Anual'].map((item) => <button key={item} aria-pressed={period === item} onClick={() => setPeriod(item)}>{item}</button>)}</div>
    <div className="panel period-picker"><button className="bare-icon" aria-label="Período anterior" onClick={() => move(true)}><ChevronLeft size={20} /></button><strong>{label}</strong><button className="bare-icon" aria-label="Próximo período" disabled={endKey > today} onClick={() => move(false)}><ChevronRight size={20} /></button></div>
    <div className="segments">{['Gráfico', 'Registros'].map((item) => <button key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === 'Gráfico' ? <section className="panel surface"><h2>Dias limpos no período</h2>{counts.length ? <>
      <div className="chips">{['Substâncias', 'Evolução'].map((item) => <button key={item} aria-pressed={chart === item} onClick={() => setChart(item)}>{item}</button>)}</div>
      <div className="bar-chart">{chart === 'Substâncias'
        ? counts.map(({ item, count }) => <div key={item.substance.id} className="chart-column"><strong>{count}</strong><span className="chart-bar" style={{ height: `${Math.max(3, count / max * 105)}px` }} /><SubstanceIcon item={item.substance} /><small>{item.substance.name}</small></div>)
        : periods.map(({ label, count }) => <div key={label} className="chart-column"><strong>{count}</strong><span className="chart-bar" style={{ height: `${Math.max(3, count / max * 105)}px` }} /><small>{label}</small></div>)}</div></> : <p className="muted">Registre seu primeiro dia para ver o gráfico.</p>}</section> :
      <section className="stack">{entries.length ? entries.map((entry) => {
        const track = data.tracks.find((item) => item.substance.id === entry.substanceId)
        return track && <a className="panel line-button" key={entry.substanceId + entry.date} href={`#uso/${encodeURIComponent(entry.substanceId)}/${entry.date}`}><SubstanceIcon item={track.substance} /><div><strong>{track.substance.name}</strong><small>{formatDate(entry.date)}{entry.quantity ? ` · ${entry.quantity} ${entry.unit || ''}` : ''}</small>{entry.observation && <small>{entry.observation}</small>}</div><span className={entry.used ? 'tag peach' : 'tag green'}>{entry.used ? 'Usei' : 'Não usei'}</span></a>
      }) : <p className="panel surface">Nenhum registro neste período.</p>}</section>}
    <div className="two-grid"><div className="panel surface"><CalendarDays size={24} /><h3>Maior período</h3><strong>{longest(data, today)} dias</strong></div><div className="panel surface"><Clock3 size={24} /><h3>Última recaída</h3><strong>{recent ? formatDate(recent) : 'Sem registro'}</strong></div></div>
    {data.tracks.length > 0 && <div className="message-panel green"><ChartNoAxesColumnIncreasing size={22} /><div><h3>Evolução do período</h3><p>{cleanDays} dias com registro sem uso. {variation >= 0 ? '+' : ''}{variation} em relação ao período anterior.</p></div></div>}
  </>
}

export function Achievements({ data, today }: { data: Data; today: string }) {
  const best = longest(data, today)
  const next = [...milestones, 180, 365].find((goal) => goal > best)
  const total = data.tracks.reduce((sum, track) => sum + track.dailyCost * streak(track, data.entries, today), 0)
  return <><Heading title="Minhas Conquistas">Cada marco registra uma etapa da sua jornada.</Heading>
    <div className="panel medals">{milestones.map((goal) => <figure key={goal} className={best >= goal ? '' : 'locked'}><img src={art(`medalha-${goal}`)} alt={`Medalha de ${goal} dias`} /><figcaption>{best >= goal ? 'Conquistada' : 'A conquistar'}</figcaption></figure>)}</div>
    <h2 className="section-title">Próximas metas</h2><div className="message-panel lavender"><Target size={29} /><div><h3>{next ? `Rumo aos ${next} dias!` : 'Todos os marcos foram conquistados'}</h3><p>{next ? `${Math.max(0, next - best)} dias para esse marco.` : 'Continue acompanhando a sua evolução.'}</p></div></div>
    <h2 className="section-title">Economia Conquistada</h2><div className="message-panel green savings-card"><PiggyBank size={40} /><div><p>Total economizado na sequência atual</p><strong>{money.format(total)}</strong></div></div>
    {data.tracks.length > 0 && <div className="stack">{data.tracks.map((track) => <div className="panel line-button" key={track.substance.id}><SubstanceIcon item={track.substance} /><strong>{track.substance.name}</strong><span>{streak(track, data.entries, today)} dias</span></div>)}</div>}
    <a className="button soft full" href="#historico"><ChartNoAxesColumnIncreasing size={17} /> Ver histórico <ArrowRight size={16} /></a>
  </>
}

export function Library({ data, save }: { data: Data; save: SaveData }) {
  const [theme, setTheme] = useState('Todas')
  return <><Heading title="Biblioteca de Frases">Reflexões, orientações e palavras de esperança para você e sua família.</Heading>
    <div className="chips" aria-label="Temas">{['Todas', ...reflections.map((item) => item.theme), 'Favoritas'].map((item) => <button key={item} aria-pressed={theme === item} onClick={() => setTheme(item)}>{item}</button>)}</div>
    <div className="stack">{reflections.filter((item) => theme === 'Todas' || theme === item.theme || theme === 'Favoritas' && data.favorites.includes(item.id)).map((item, index) => {
      const favorite = data.favorites.includes(item.id)
      return <figure className={`message-panel quote-card ${['green', 'peach', 'lavender'][index % 3]}`} key={item.id}>
        <Quote size={26} /><div><blockquote>{item.text}</blockquote><figcaption>{item.theme}{item.source && ` · ${item.source}`}</figcaption></div>
        <button className="bare-icon" aria-label={`${favorite ? 'Remover dos favoritos' : 'Favoritar'}: ${item.theme}`} aria-pressed={favorite} onClick={() => save({ ...data, favorites: favorite ? data.favorites.filter((id) => id !== item.id) : [...data.favorites, item.id] }, favorite ? 'Frase removida dos favoritos.' : 'Frase favoritada.')}><Heart size={21} fill={favorite ? 'currentColor' : 'none'} /></button>
      </figure>
    })}{theme === 'Favoritas' && !data.favorites.length && <p className="panel surface">Você ainda não tem frases favoritas.</p>}</div>
  </>
}
