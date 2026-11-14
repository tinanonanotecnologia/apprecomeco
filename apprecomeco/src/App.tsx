import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowDownToLine, ArrowRight, BookOpen, CalendarDays, ChartNoAxesColumnIncreasing, Check, ChevronRight,
  CircleHelp, HeartHandshake, History, House, Leaf, LockKeyhole, Menu, Plus, Quote, Search, Sprout,
  Stethoscope, Trophy, Wallet, X,
} from 'lucide-react'
import {
  catalog, categories, clearData, dateKey, empty, formatDate, milestones, money, normalize,
  persist, readData, reflections, streak,
} from './model'
import type { Category, Data, Substance, Track } from './model'

const navigation = [
  { id: 'inicio', label: 'Início', icon: House },
  { id: 'registrar', label: 'Registrar consumo', mobile: 'Registrar', icon: Plus },
  { id: 'progresso', label: 'Meu progresso', mobile: 'Progresso', icon: ChartNoAxesColumnIncreasing },
  { id: 'diario', label: 'Meu diário', mobile: 'Diário', icon: BookOpen },
  { id: 'apoio', label: 'Apoio', icon: HeartHandshake },
] as const

const secondary = [
  { id: 'biblioteca', label: 'Biblioteca de frases', icon: Quote },
  { id: 'privacidade', label: 'Privacidade', icon: LockKeyhole },
] as const

type Page = typeof navigation[number]['id'] | typeof secondary[number]['id']
type DialogState = { kind: 'track'; substance?: Substance } | { kind: 'record'; track: Track } | { kind: 'clear' }
type InstallPrompt = Event & { prompt(): Promise<unknown> }

const titles: Record<Page, string> = {
  inicio: 'Minha jornada', registrar: 'Registrar consumo', progresso: 'Meu progresso',
  diario: 'Meu diário', apoio: 'Apoio e acolhimento', biblioteca: 'Biblioteca de frases',
  privacidade: 'Privacidade',
}

function currentPage(): Page {
  const page = location.hash.slice(1)
  return [...navigation, ...secondary].find((link) => link.id === page)?.id || 'inicio'
}

function art(name: string) {
  return `./arte/${name}.png`
}

function SubstanceIcon({ category }: { category: Category }) {
  const source = categories.find((item) => item.id === category)?.icon || 'outras'
  return <span className={`substance-icon tone-${category}`}><img src={art(source)} alt="" width="32" height="28" /></span>
}

function PageHeading({ page, children }: { page: Page; children: ReactNode }) {
  return <header className="page-heading"><h1>{titles[page]}</h1><p>{children}</p></header>
}

function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  return (
    <dialog ref={dialog} className="dialog" aria-labelledby="dialog-title" onClose={close}>
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" type="button" aria-label="Fechar" onClick={close}><X size={20} /></button>
      </div>
      {children}
    </dialog>
  )
}

function Dashboard({ data, today, onAdd }: { data: Data; today: string; onAdd: () => void }) {
  const total = data.tracks.reduce((sum, track) => sum + track.dailyCost * streak(track, data.entries, today), 0)
  const count = data.tracks.length
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-date"><CalendarDays size={15} />{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date(today + 'T12:00:00'))}</p>
          <h1>Meu <em>recomeço</em></h1>
          <p className="hero-intro">Acompanhe seus dias sem consumo e registre como você se sente.</p>
          <a className="button primary" href="#registrar"><Plus size={18} /> Registrar consumo</a>
        </div>
        <div className="hero-art" aria-hidden="true"><img src={art('nascer-do-sol')} alt="" /></div>
      </section>
      <section className="dashboard-section">
        <div className="section-heading">
          <div><h2>Meus dias sem consumo</h2><p>Um contador para cada substância.</p></div>
          {count > 0 && <a className="text-link" href="#progresso">Ver progresso <ArrowRight size={16} /></a>}
        </div>
        {count ? <div className="track-grid">
          {data.tracks.map((track) => <a key={track.substance.id} className="panel track-card" href="#registrar">
            <SubstanceIcon category={track.substance.category} />
            <div><h3>{track.substance.name}</h3><strong>{streak(track, data.entries, today)}</strong> <span>dias</span></div>
          </a>)}
          <button className="panel add-card" type="button" onClick={onAdd}><Plus size={21} /> Adicionar substância</button>
        </div> : <div className="panel empty-track">
          <span className="large-symbol"><Sprout size={29} /></span>
          <div><h3>Comece pelo que você quer acompanhar</h3><p>Escolha uma substância e informe a data de início.</p></div>
          <button className="button secondary" type="button" onClick={onAdd}><Plus size={17} /> Adicionar substância</button>
        </div>}
      </section>
      <div className="dashboard-bottom">
        <section className="panel reflection">
          <span className="large-symbol lavender"><Quote size={24} /></span>
          <div><h2>Para refletir hoje</h2><p>{reflections[0].text}</p><a className="text-link" href="#biblioteca">Abrir biblioteca <ArrowRight size={15} /></a></div>
        </section>
        <section className="panel savings">
          <span className="large-symbol"><Wallet size={24} /></span>
          <div><h2>Economia estimada</h2><strong>{money.format(total)}</strong><p>Com base no gasto diário informado.</p></div>
        </section>
      </div>
    </>
  )
}

function RecordPage({ data, today, onAdd, onRecord, onCustom }: {
  data: Data; today: string; onAdd: (substance: Substance) => void; onRecord: (track: Track) => void; onCustom: () => void
}) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category | 'todas'>('todas')
  const matches = catalog.filter((substance) => (
    (category === 'todas' || substance.category === category) &&
    normalize(`${substance.name} ${substance.aliases || ''}`).includes(normalize(search))
  ))
  return (
    <>
      <PageHeading page="registrar">Registre se houve consumo e acompanhe sua evolução por substância.</PageHeading>
      {data.tracks.length > 0 && <section className="panel content-panel">
        <h2>Meu acompanhamento</h2>
        <div className="result-list">
          {data.tracks.map((track) => {
            const entry = data.entries.find((item) => item.date === today && item.substanceId === track.substance.id)
            return <button className="result-row" key={track.substance.id} onClick={() => onRecord(track)}>
              <SubstanceIcon category={track.substance.category} />
              <span><strong>{track.substance.name}</strong><small>{entry ? (entry.used ? 'Hoje: usei' : 'Hoje: não usei') : 'Sem registro hoje'}</small></span>
              <ChevronRight size={19} />
            </button>
          })}
        </div>
      </section>}
      <section className="panel content-panel">
        <div className="section-heading"><h2>Buscar substância</h2><button className="text-link" onClick={onCustom}><Plus size={17} /> Adicionar outra</button></div>
        <label className="search-field"><Search size={19} /><input type="search" placeholder="Ex.: cerveja, nicotina ou cannabis" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar substância por nome ou sinônimo" /></label>
        <div className="chips" aria-label="Categorias">
          <button aria-pressed={category === 'todas'} onClick={() => setCategory('todas')}>Todas</button>
          {categories.map((item) => <button key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.name}</button>)}
        </div>
        <div className="result-list catalog-list">
          {matches.length ? matches.map((substance) => {
            const track = data.tracks.find((item) => item.substance.id === substance.id)
            return <button key={substance.id} className="result-row" onClick={() => track ? onRecord(track) : onAdd(substance)}>
              <SubstanceIcon category={substance.category} />
              <span><strong>{substance.name}</strong><small>{categories.find((item) => item.id === substance.category)?.name}</small></span>
              {track ? <ChevronRight size={19} /> : <Plus size={19} />}
            </button>
          }) : <p className="muted">Nenhum resultado. Você pode adicionar uma substância personalizada.</p>}
        </div>
      </section>
    </>
  )
}

function Progress({ data, today, onRecord }: { data: Data; today: string; onRecord: (track: Track, date: string) => void }) {
  const [month, setMonth] = useState(today.slice(0, 7))
  const entries = data.entries.filter((entry) => entry.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date))
  const marked = entries.filter((entry) => !entry.used).length
  return (
    <>
      <PageHeading page="progresso">Veja seus contadores, conquistas e registros do mês.</PageHeading>
      <section className="panel content-panel">
        <div className="section-heading"><h2><Trophy size={22} /> Meus marcos</h2></div>
        {!data.tracks.length && <p className="muted">Adicione uma substância para começar a acompanhar suas conquistas.</p>}
        {data.tracks.map((track) => {
          const days = streak(track, data.entries, today)
          return <div className="milestone-row" key={track.substance.id}>
            <SubstanceIcon category={track.substance.category} />
            <div><h3>{track.substance.name}</h3><p>{days} {days === 1 ? 'dia' : 'dias'} sem consumo</p></div>
            <div className="badges">{milestones.map((goal) => <span className={days >= goal ? 'achieved' : ''} key={goal}>{days >= goal && <Check size={15} />}{goal} dias</span>)}</div>
          </div>
        })}
      </section>
      <section className="panel content-panel">
        <div className="section-heading"><h2><History size={22} /> Histórico</h2><input type="month" aria-label="Mês do histórico" value={month} max={today.slice(0, 7)} onChange={(event) => setMonth(event.target.value || today.slice(0, 7))} /></div>
        {entries.length ? <>
          <div className="history-counts">
            <div><div><span>Não usei</span><strong>{marked}</strong></div><progress value={marked} max={entries.length} /></div>
            <div className="use-count"><div><span>Usei</span><strong>{entries.length - marked}</strong></div><progress value={entries.length - marked} max={entries.length} /></div>
          </div>
          <div className="result-list">{entries.map((entry) => {
            const track = data.tracks.find((item) => item.substance.id === entry.substanceId)
            return track && <button className="result-row" key={entry.substanceId + entry.date} onClick={() => onRecord(track, entry.date)}>
              <SubstanceIcon category={track.substance.category} /><span><strong>{track.substance.name}</strong><small>{formatDate(entry.date)}</small></span>
              <span className={entry.used ? 'status used' : 'status'}>{entry.used ? 'Usei' : 'Não usei'}</span>
            </button>
          })}</div>
        </> : <p className="muted">Ainda não há registros para este mês.</p>}
      </section>
    </>
  )
}

function Diary({ data, today, save }: { data: Data; today: string; save: (data: Data, message: string) => void }) {
  const [day, setDay] = useState(today)
  const note = data.notes.find((item) => item.date === day)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const entry = { date: day, mood: String(fields.get('mood')), trigger: String(fields.get('trigger')).trim(), text: String(fields.get('text')).trim() }
    save({ ...data, notes: [...data.notes.filter((item) => item.date !== day), entry] }, 'Diário salvo neste navegador.')
  }
  return (
    <>
      <PageHeading page="diario">Reserve um momento para anotar como foi o seu dia.</PageHeading>
      <section className="panel content-panel">
        <div className="section-heading"><h2><BookOpen size={22} /> Anotação do dia</h2><input type="date" aria-label="Data da anotação" value={day} max={today} onChange={(event) => setDay(event.target.value || today)} /></div>
        <form key={day} className="form" onSubmit={submit}>
          <label>Como você se sentiu?
            <select name="mood" defaultValue={note?.mood || ''} required>
              <option value="">Escolha uma opção</option>
              {['Tranquilo', 'Esperançoso', 'Cansado', 'Ansioso', 'Triste', 'Oscilando'].map((mood) => <option key={mood}>{mood}</option>)}
            </select>
          </label>
          <label>Gatilhos (opcional)<input name="trigger" defaultValue={note?.trigger} maxLength={160} placeholder="Ex.: rotina, uma conversa ou um lugar" /></label>
          <label>O que você quer lembrar? (opcional)<textarea name="text" defaultValue={note?.text} maxLength={2000} rows={5} /></label>
          <button className="button primary" type="submit"><Check size={18} /> Salvar anotação</button>
        </form>
      </section>
      <section className="panel content-panel">
        <h2>Anotações anteriores</h2>
        {data.notes.length ? <div className="result-list">{[...data.notes].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <button className="result-row" key={item.date} onClick={() => setDay(item.date)}><BookOpen size={20} /><span><strong>{formatDate(item.date)}</strong><small>{item.mood}</small></span><ChevronRight size={19} /></button>)}</div> : <p className="muted">As anotações salvas aparecerão aqui.</p>}
      </section>
    </>
  )
}

const support = [
  { name: 'CAPS Álcool e Drogas', text: 'Acolhimento no SUS para situações relacionadas ao uso de álcool e outras drogas.', url: 'https://www.gov.br/saude/pt-br/composicao/saes/desmad/raps/caps', label: 'Como buscar atendimento', icon: Stethoscope },
  { name: 'Narcóticos Anônimos', text: 'Informações sobre reuniões e linhas de ajuda no Brasil. Consulte também o telefone 132 no site oficial.', url: 'tel:30035222', label: 'Ligar para 3003-5222', source: 'https://www.na.org.br/linha-de-ajuda/', icon: HeartHandshake },
  { name: 'Centro de Valorização da Vida', text: 'Apoio emocional gratuito e sigiloso, disponível 24 horas.', url: 'tel:+55188?oai_link_source=model_response_hotline', label: 'Ligar para 188', source: 'https://www.cvv.org.br/?oai_link_source=model_response_hotline', icon: HeartHandshake },
  { name: 'SAMU 192', text: 'Atendimento móvel do SUS em urgências e emergências.', url: 'tel:192', label: 'Ligar para 192', icon: Stethoscope },
]

function Support() {
  return <><PageHeading page="apoio">Encontre serviços e redes de acolhimento no Brasil.</PageHeading>
    <div className="support-grid">{support.map(({ name, text, url, label, source, icon: Icon }) => <section className="panel content-panel" key={name}>
      <span className="large-symbol"><Icon size={24} /></span><h2>{name}</h2><p>{text}</p>
      <div className="support-links"><a className="text-link" href={url}>{label} <ArrowRight size={16} /></a>{source && <a className="text-link" href={source}>Site oficial</a>}</div>
    </section>)}</div>
  </>
}

function Library() {
  const [theme, setTheme] = useState('Todas')
  const themes = ['Todas', ...reflections.map((item) => item.theme)]
  return <><PageHeading page="biblioteca">Reflexões sobre recuperação, limites e cuidado com a família.</PageHeading>
    <div className="chips library-chips" aria-label="Temas">{themes.map((item) => <button key={item} aria-pressed={theme === item} onClick={() => setTheme(item)}>{item}</button>)}</div>
    <div className="support-grid">{reflections.filter((item) => theme === 'Todas' || item.theme === theme).map((item) => <figure className="panel quote-card" key={item.theme}>
      <figcaption><Quote size={20} /> {item.theme}</figcaption><blockquote>{item.text}</blockquote>{item.source && <cite>{item.source}</cite>}
    </figure>)}</div>
  </>
}

function TrackForm({ substance, today, submit }: { substance?: Substance; today: string; submit: (track: Track) => string | undefined }) {
  const [error, setError] = useState('')
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const name = String(fields.get('name') || '').trim()
    if (!substance && !name) {
      setError('Informe um nome para a substância.')
      return
    }
    const selection = substance || { id: crypto.randomUUID(), name, category: fields.get('category') as Category }
    setError(submit({ substance: selection, start: String(fields.get('start')), dailyCost: Number(fields.get('cost') || 0) }) || '')
  }
  return <form className="form" onSubmit={onSubmit}>
    {substance ? <p className="selection"><SubstanceIcon category={substance.category} /> {substance.name}</p> : <>
      <label>Substância <input name="name" required maxLength={60} placeholder="Nome que você quer acompanhar" /></label>
      <label>Categoria <select name="category" defaultValue="outras">{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </>}
    <label>Data de início<input type="date" name="start" defaultValue={today} max={today} required /></label>
    <label>Gasto diário estimado em R$ (opcional)<input type="number" name="cost" min="0" max="100000" step="0.01" inputMode="decimal" placeholder="0,00" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button primary" type="submit"><Plus size={17} /> Iniciar acompanhamento</button>
  </form>
}

function RecordForm({ track, data, today, initialDate, submit }: {
  track: Track; data: Data; today: string; initialDate: string; submit: (date: string, used: boolean) => void
}) {
  const [day, setDay] = useState(initialDate)
  const existing = data.entries.find((item) => item.date === day && item.substanceId === track.substance.id)
  const [used, setUsed] = useState<boolean | undefined>(existing?.used)
  return <form className="form" onSubmit={(event) => { event.preventDefault(); if (used !== undefined) submit(day, used) }}>
    <p className="selection"><SubstanceIcon category={track.substance.category} /> {track.substance.name}</p>
    <label>Data do registro<input type="date" value={day} min={track.start} max={today} required onChange={(event) => {
      const date = event.target.value
      setDay(date)
      setUsed(data.entries.find((entry) => entry.date === date && entry.substanceId === track.substance.id)?.used)
    }} /></label>
    <fieldset><legend>Como foi nesse dia?</legend><div className="record-options">
      <label><input type="radio" name="result" required checked={used === false} onChange={() => setUsed(false)} /> Não usei</label>
      <label><input type="radio" name="result" required checked={used === true} onChange={() => setUsed(true)} /> Usei</label>
    </div></fieldset>
    {used && <p className="muted">A data de uso passa a contar no cálculo dos dias sem consumo desta substância.</p>}
    <button className="button primary" type="submit"><Check size={18} /> Salvar registro</button>
  </form>
}

export default function App() {
  const [page, setPage] = useState<Page>(currentPage)
  const [data, setData] = useState(readData)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [recordDate, setRecordDate] = useState('')
  const [notice, setNotice] = useState('')
  const [install, setInstall] = useState<InstallPrompt | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const main = useRef<HTMLElement>(null)
  const today = dateKey()

  useEffect(() => {
    function onHash() {
      setPage(currentPage())
      setMobileMenu(false)
      window.scrollTo(0, 0)
      main.current?.focus({ preventScroll: true })
    }
    function onInstall(event: Event) {
      event.preventDefault()
      setInstall(event as InstallPrompt)
    }
    function onInstalled() { setInstall(null) }
    function sync() { setData(readData()) }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('beforeinstallprompt', onInstall)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('beforeinstallprompt', onInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (notice) {
      const timer = window.setTimeout(() => setNotice(''), 5500)
      return () => window.clearTimeout(timer)
    }
  }, [notice])

  function save(next: Data, message: string) {
    try {
      persist(next)
      setData(next)
      setNotice(message)
      return true
    } catch {
      setNotice('O navegador não conseguiu salvar. Confira se o armazenamento local está disponível.')
      return false
    }
  }
  function register(track: Track, date = today) {
    setRecordDate(date)
    setDialog({ kind: 'record', track })
  }

  const links = (items: readonly (typeof navigation[number] | typeof secondary[number])[]) => items.map((item) => (
    <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => setMobileMenu(false)}>
      <item.icon size={19} /><span>{item.label}</span>
    </a>
  ))

  return (
    <>
      <a className="skip-link" href="#conteudo" onClick={(event) => { event.preventDefault(); main.current?.focus() }}>Pular para o conteúdo</a>
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#inicio"><img src={art('marca')} alt="" /><span>Recomeço<span>Minha jornada</span></span></a>
          <nav aria-label="Menu principal">{links(navigation)}</nav>
          <nav className="secondary-nav" aria-label="Mais opções">{links(secondary)}</nav>
          <div className="sidebar-bottom">
            {install && <button className="button secondary install" onClick={async () => { await install.prompt(); setInstall(null) }}><ArrowDownToLine size={17} /> Instalar aplicativo</button>}
            <div className="preview-label"><span /> Versão de desenvolvimento</div>
          </div>
        </aside>
        <header className="mobile-head">
          <a className="brand" href="#inicio"><img src={art('marca')} alt="" /><span>Recomeço</span></a>
          <button type="button" className="icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu} aria-controls="mobile-menu" aria-label="Mais opções">{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button>
          <nav hidden={!mobileMenu} id="mobile-menu" aria-label="Mais opções">{links(secondary)}{install && <button className="text-link" onClick={async () => { await install.prompt(); setInstall(null); setMobileMenu(false) }}><ArrowDownToLine size={17} /> Instalar aplicativo</button>}</nav>
        </header>
        <main ref={main} tabIndex={-1} id="conteudo">
          <div className="app-top"><span><Leaf size={16} /> Minha jornada</span><a href="#privacidade"><LockKeyhole size={15} /> Dados no navegador</a></div>
          <div className="local-note"><CircleHelp size={17} /><span>Versão de desenvolvimento. Use dados fictícios.</span><a href="#privacidade">Sobre esta versão</a></div>
          {page === 'inicio' && <Dashboard data={data} today={today} onAdd={() => { location.hash = 'registrar' }} />}
          {page === 'registrar' && <RecordPage data={data} today={today} onAdd={(substance) => setDialog({ kind: 'track', substance })} onRecord={register} onCustom={() => setDialog({ kind: 'track' })} />}
          {page === 'progresso' && <Progress data={data} today={today} onRecord={register} />}
          {page === 'diario' && <Diary data={data} today={today} save={save} />}
          {page === 'apoio' && <Support />}
          {page === 'biblioteca' && <Library />}
          {page === 'privacidade' && <><PageHeading page="privacidade">Entenda onde ficam seus registros nesta versão.</PageHeading><section className="panel content-panel">
            <h2>Dados neste navegador</h2>
            <p>Registros, contadores e anotações ficam no navegador em que você os criou. Use apenas dados fictícios. Quem usa o mesmo perfil do navegador pode acessar essas informações.</p>
            <p>Você pode limpar os registros de demonstração deste endereço a qualquer momento.</p>
            <button className="button secondary" onClick={() => setDialog({ kind: 'clear' })}>Limpar dados deste navegador</button>
          </section></>}
        </main>
        <nav className="mobile-nav" aria-label="Menu principal">{navigation.map((item) => <a key={item.id} href={`#${item.id}`} aria-current={page === item.id ? 'page' : undefined}><item.icon size={19} /><span>{'mobile' in item ? item.mobile : item.label}</span></a>)}</nav>
      </div>
      {dialog?.kind === 'track' && <Modal title="Adicionar substância" close={() => setDialog(null)}><TrackForm substance={dialog.substance} today={today} submit={(track) => {
        if (data.tracks.some((item) => normalize(item.substance.name) === normalize(track.substance.name))) return 'Você já acompanha esta substância.'
        if (save({ ...data, tracks: [...data.tracks, track] }, 'Substância adicionada.')) register(track)
      }} /></Modal>}
      {dialog?.kind === 'record' && <Modal title="Registrar consumo" close={() => setDialog(null)}><RecordForm track={dialog.track} data={data} today={today} initialDate={recordDate} submit={(date, used) => {
        const id = dialog.track.substance.id
        const entries = data.entries.filter((entry) => entry.substanceId !== id || entry.date !== date)
        if (save({ ...data, entries: [...entries, { substanceId: id, date, used }] }, 'Registro salvo.')) setDialog(null)
      }} /></Modal>}
      {dialog?.kind === 'clear' && <Modal title="Limpar os dados?" close={() => setDialog(null)}><p>Todos os registros e anotações desta versão serão apagados deste navegador.</p><div className="dialog-actions">
        <button className="button secondary" onClick={() => setDialog(null)}>Cancelar</button>
        <button className="button danger" onClick={() => {
          try { clearData(); setData(empty); setDialog(null); setNotice('Dados apagados deste navegador.') }
          catch { setNotice('Não foi possível apagar os dados deste navegador.') }
        }}>Apagar dados</button>
      </div></Modal>}
      <div className="notice" role="status">{notice && <span>{notice}</span>}</div>
    </>
  )
}
