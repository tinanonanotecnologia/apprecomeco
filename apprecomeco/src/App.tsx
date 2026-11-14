import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownToLine, Bell, BookOpen, Building2, ChartNoAxesColumnIncreasing, ChevronLeft, CirclePlay, CircleUserRound,
  Clapperboard, HeartHandshake, History, House, LockKeyhole, Menu, ShieldCheck, Trophy, Users, X,
} from 'lucide-react'
import { Achievements, Diary, HistoryPage, Home, Library, Record, RegisterCatalog, TrackForm } from './Personal'
import { Groups, Professionals, Support } from './Support'
import { ClinicPortal, ClinicProfile, ClinicRegistration, Clinics, ClinicReview, ClinicStatistics, FamilyPortal } from './Clinics'
import { Admin } from './Admin'
import { Social } from './Social'
import { art, Callout, Heading, LinkRow, Modal } from './ui'
import { clearMedia, initialCommunity, readCommunity, readViewedPosts, resetCommunity, storyLifetime, writeCommunity, writeViewedPosts } from './community'
import type { SaveCommunity } from './community'
import { clearData, dateKey, empty, normalize, persist, readData } from './model'
import type { Category, Substance } from './model'
import type { SaveData } from './Personal'

const tabs = [
  { id: 'inicio', label: 'Início', icon: House },
  { id: 'registrar', label: 'Registrar', icon: ChartNoAxesColumnIncreasing },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'conquistas', label: 'Conquistas', icon: Trophy },
  { id: 'apoio', label: 'Apoio', icon: HeartHandshake },
] as const

const menu = [
  { id: 'diario', label: 'Meu Diário', icon: BookOpen },
  { id: 'biblioteca', label: 'Biblioteca de Frases', icon: BookOpen },
  { id: 'grupos', label: 'Grupos de Apoio', icon: Users },
  { id: 'profissionais', label: 'Profissionais de Confiança', icon: HeartHandshake },
  { id: 'clinicas', label: 'Clínicas de Reabilitação', icon: Building2 },
  { id: 'comunidade', label: 'Reels & Stories', icon: Clapperboard },
  { id: 'familia', label: 'Portal da Família', icon: Users },
  { id: 'portal-clinica', label: 'Portal da Clínica', icon: Building2 },
  { id: 'admin', label: 'Painel do Administrador', icon: ShieldCheck },
  { id: 'privacidade', label: 'Privacidade', icon: LockKeyhole },
] as const

const parents: Record<string, string> = {
  uso: 'registrar', grupos: 'apoio', profissionais: 'apoio', clinicas: 'apoio', clinica: 'clinicas',
  'estatisticas-clinica': 'clinicas', 'avaliar-clinica': 'clinicas', 'cadastro-clinica': 'clinicas',
  'portal-clinica': 'clinicas', familia: 'inicio', biblioteca: 'inicio',
}
const supported = new Set<string>([...tabs.map(({ id }) => id), ...menu.map(({ id }) => id), ...Object.keys(parents), 'perfil'])
type InstallPrompt = Event & { prompt(): Promise<unknown> }
type Add = { substance?: Substance; category?: Category; amount?: number }

function getRoute() {
  const [slug, ...parts] = location.hash.slice(1).split('/')
  const page = slug === 'progresso' ? 'historico' : supported.has(slug) ? slug : 'inicio'
  try { return { page, id: decodeURIComponent(parts[0] || ''), extra: decodeURIComponent(parts[1] || '') } }
  catch { return { page, id: '', extra: '' } }
}

export default function App() {
  const [route, setRoute] = useState(getRoute)
  const [data, setData] = useState(readData)
  const [community, setCommunity] = useState(readCommunity)
  const [add, setAdd] = useState<Add | null>(null)
  const [clear, setClear] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const [viewedPosts, setViewedPosts] = useState(readViewedPosts)
  const [, refreshPosts] = useState(0)
  const [notice, setNotice] = useState('')
  const [install, setInstall] = useState<InstallPrompt | null>(null)
  const main = useRef<HTMLElement>(null)
  const today = dateKey()
  const { page, id, extra } = route
  const now = Date.now()
  const activePosts = community.posts.filter((post) => post.kind === 'Reels' || post.created + storyLifetime > now)
    .sort((a, b) => b.created - a.created)
  const nextStoryExpiry = activePosts.filter((post) => post.kind === 'Stories').at(-1)?.created
  const viewed = new Set(viewedPosts)
  const unread = activePosts.filter((post) => !viewed.has(post.id)).length
  const openedPost = page === 'comunidade' && activePosts.find((post) => post.id === id)
  const unreadPostId = openedPost && !viewed.has(openedPost.id) ? openedPost.id : ''
  const selectedClinic = community.clinics.find((item) => item.approved && item.id === id)
  const selectedTrack = data.tracks.find((item) => item.substance.id === id)
  const requested = page === 'registrar' && id && id !== 'outras' && community.catalog.find((item) => item.id === id)
  const amount = Number(extra) > 0 && Number(extra) <= 999 ? Math.trunc(Number(extra)) : undefined

  useEffect(() => {
    function navigate() {
      setRoute(getRoute())
      setDrawer(false)
      setNotifications(false)
      setAdd(null)
      window.scrollTo(0, 0)
      main.current?.focus({ preventScroll: true })
    }
    function sync() { setData(readData()); setCommunity(readCommunity()); setViewedPosts(readViewedPosts()) }
    function onInstall(event: Event) { event.preventDefault(); setInstall(event as InstallPrompt) }
    function onInstalled() { setInstall(null) }
    window.addEventListener('hashchange', navigate)
    window.addEventListener('storage', sync)
    window.addEventListener('beforeinstallprompt', onInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('hashchange', navigate)
      window.removeEventListener('storage', sync)
      window.removeEventListener('beforeinstallprompt', onInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (nextStoryExpiry === undefined) return
    const delay = Math.max(1, nextStoryExpiry + storyLifetime - Date.now() + 1)
    const timeout = window.setTimeout(() => refreshPosts((value) => value + 1), delay)
    return () => window.clearTimeout(timeout)
  }, [nextStoryExpiry])

  useEffect(() => {
    if (!unreadPostId) return
    const updated = [...new Set([...readViewedPosts(), unreadPostId])]
    setViewedPosts((previous) => [...new Set([...previous, ...updated])])
    try { writeViewedPosts(updated) }
    catch { /* Keep the notification read for this session if storage is unavailable. */ }
  }, [unreadPostId])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 4800)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (page !== 'registrar' || !id) return
    if (selectedTrack) {
      location.replace(`#uso/${encodeURIComponent(id)}${amount ? `/q-${amount}` : ''}`)
      return
    }
    setAdd(requested ? { substance: requested, amount } : {})
  }, [page, id, amount, requested, selectedTrack])

  const save: SaveData = (next, message) => {
    try { persist(next); setData(next); setNotice(message); return true }
    catch { setNotice('O navegador não conseguiu salvar os dados.'); return false }
  }
  const saveCommunity: SaveCommunity = (next, message) => {
    try { writeCommunity(next); setCommunity(next); setNotice(message); return true }
    catch { setNotice('O navegador não conseguiu salvar os dados.'); return false }
  }

  function select(item: Substance) {
    if (data.tracks.some((track) => track.substance.id === item.id)) location.hash = `uso/${encodeURIComponent(item.id)}`
    else setAdd({ substance: item })
  }
  function closeAdd() {
    setAdd(null)
    if (page === 'registrar' && id) location.replace('#registrar')
  }
  function goBack() {
    if (page === 'admin' && id) { location.hash = 'admin'; return }
    if (page === 'comunidade' && id) { location.hash = 'comunidade'; return }
    if (selectedClinic && ['estatisticas-clinica', 'avaliar-clinica'].includes(page)) { location.hash = `clinica/${selectedClinic.id}`; return }
    location.hash = parents[page] || 'inicio'
  }
  function primaryPage(value: string): string {
    if (tabs.some((tab) => tab.id === value)) return value
    return parents[value] ? primaryPage(parents[value]) : ''
  }
  const active = primaryPage(page)
  const installButton = install && <button className="button primary full" onClick={async () => { await install.prompt(); setInstall(null); setDrawer(false) }}><ArrowDownToLine size={18} /> Instalar aplicativo</button>
  const appMenu = menu.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} onClick={() => setDrawer(false)} aria-current={page === id ? 'page' : undefined}><Icon size={20} /> {label}</a>)
  const message = community.message && (!community.messageDate || community.messageDate <= today) ? community.message : ''

  return <>
    <a href="#conteudo" className="skip-link" onClick={(event) => { event.preventDefault(); main.current?.focus() }}>Pular para o conteúdo</a>
    <div className="app-layout">
      <aside className="desktop-menu panel"><a href="#inicio" className="brand"><img src={art('marca')} alt="" /><span>Recomeço</span></a><nav aria-label="Mais opções">{appMenu}</nav>{installButton}</aside>
      <div className="app-surface">
        <header className={`app-header${page === 'inicio' ? ' home-header' : ''}`}>
          <button className="bare-icon" aria-label={page === 'inicio' ? 'Abrir menu' : 'Voltar'} onClick={() => page === 'inicio' ? setDrawer(true) : goBack()}>{page === 'inicio' ? <Menu size={24} /> : <ChevronLeft size={26} />}</button>
          <a href="#inicio" className="brand"><img src={art('marca')} alt="" /><span>Recomeço</span></a>
          {page === 'inicio' ? <div className="header-actions">
            <button type="button" className="bare-icon notification-button" aria-haspopup="dialog"
              aria-label={unread ? `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Notificações'}
              onClick={() => setNotifications(true)}>
              <Bell size={22} />
              {unread > 0 && <span className="notification-count" aria-hidden="true">{unread > 99 ? '99+' : unread}</span>}
            </button>
            <a className="bare-icon profile-button" aria-label="Meu perfil" href="#perfil"><CircleUserRound size={25} /></a>
          </div> : <button className="bare-icon" aria-label="Abrir menu" onClick={() => setDrawer(true)}><Menu size={22} /></button>}
        </header>
        <main ref={main} id="conteudo" tabIndex={-1}>
          {page === 'inicio' && <Home data={data} catalog={community.catalog} today={today} message={message} add={() => setAdd({})} />}
          {page === 'registrar' && <RegisterCatalog catalog={community.catalog} data={data} select={select} add={(category) => setAdd({ category })} request={(name) => {
            if (!name) return
            if (community.requests.some((item) => normalize(item) === normalize(name))) { setNotice('Este nome já está na lista de solicitações.'); return }
            saveCommunity({ ...community, requests: [...community.requests, name] }, 'Solicitação registrada neste navegador.')
          }} />}
          {page === 'uso' && (selectedTrack ? <Record key={id + extra} track={selectedTrack} today={today} data={data}
            initialDate={/^\d{4}-\d{2}-\d{2}$/.test(extra) && extra >= selectedTrack.start && extra <= today ? extra : undefined}
            amount={/^q-\d+$/.test(extra) && Number(extra.slice(2)) <= 999 ? Number(extra.slice(2)) : undefined} submit={(entry) => {
              const entries = data.entries.filter((item) => item.substanceId !== entry.substanceId || item.date !== entry.date)
              if (save({ ...data, entries: [...entries, entry] }, 'Registro salvo.')) location.hash = 'historico'
            }} /> : <><Heading title="Registrar uso">Selecione uma substância para cadastrar ou registrar.</Heading><a className="button primary full" href="#registrar">Buscar substância</a></>)}
          {page === 'historico' && <HistoryPage data={data} today={today} />}
          {page === 'conquistas' && <Achievements data={data} today={today} />}
          {page === 'diario' && <Diary data={data} today={today} save={save} />}
          {page === 'apoio' && <Support />}
          {page === 'biblioteca' && <Library data={data} save={save} />}
          {page === 'grupos' && <Groups data={community} />}
          {page === 'profissionais' && <Professionals data={community} />}
          {page === 'clinicas' && <Clinics data={community} />}
          {page === 'clinica' && selectedClinic && <ClinicProfile key={id} clinic={selectedClinic} data={community} save={saveCommunity} notify={setNotice} />}
          {page === 'avaliar-clinica' && selectedClinic && <ClinicReview key={id} clinic={selectedClinic} data={community} save={saveCommunity} />}
          {page === 'estatisticas-clinica' && selectedClinic && <ClinicStatistics clinic={selectedClinic} />}
          {['clinica', 'avaliar-clinica', 'estatisticas-clinica'].includes(page) && !selectedClinic && <><Heading title="Clínica indisponível" /><a className="button primary full" href="#clinicas">Buscar clínicas</a></>}
          {page === 'cadastro-clinica' && <ClinicRegistration data={community} save={saveCommunity} />}
          {page === 'portal-clinica' && <ClinicPortal data={community} save={saveCommunity} />}
          {page === 'familia' && <FamilyPortal data={community} save={saveCommunity} />}
          {page === 'comunidade' && <Social data={community} activePosts={activePosts} postId={id} save={saveCommunity} notify={setNotice} />}
          {page === 'admin' && <Admin section={id} data={community} personal={data} save={saveCommunity} />}
          {page === 'perfil' && <><Heading title="Meu Perfil" /><Callout>Perfil de demonstração. Use um nome fictício.</Callout><form className="panel surface form" onSubmit={(event) => {
            event.preventDefault()
            const fields = new FormData(event.currentTarget)
            saveCommunity({ ...community, name: String(fields.get('name') || '').trim() }, 'Perfil salvo neste navegador.')
          }}><label>Nome<input name="name" defaultValue={community.name} maxLength={80} /></label><div className="panel surface"><h2>Visualizações de perfil</h2><p>Disponível quando a comunidade estiver conectada.</p></div><button className="button primary full">Salvar perfil</button></form><a className="button soft full" href="#privacidade"><LockKeyhole size={17} /> Privacidade</a></>}
          {page === 'privacidade' && <><Heading title="Privacidade" /><section className="panel surface stack"><h2>Dados neste navegador</h2><p>Esta versão usa dados locais. Use apenas informações fictícias. Pessoas com acesso ao mesmo perfil do navegador podem ver os dados armazenados.</p><button className="button danger full" onClick={() => setClear(true)}>Limpar dados deste navegador</button></section>{installButton}</>}
          <footer className="app-footer"><a href="#privacidade">Versão de desenvolvimento · Use dados fictícios</a></footer>
        </main>
        <nav className="tab-bar" aria-label="Menu principal">{tabs.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} aria-current={active === id ? 'page' : undefined}><Icon size={23} /><span>{label}</span></a>)}</nav>
      </div>
    </div>
    {notifications && <Modal title="Notificações" close={() => setNotifications(false)}>
      {activePosts.length ? <ul className="stack notification-list">{activePosts.map((post) => {
        const isNew = !viewed.has(post.id)
        const kind = post.kind === 'Reels' ? 'Reel' : 'Story'
        return <li key={post.id}>
          <LinkRow href={`#comunidade/${encodeURIComponent(post.id)}`} icon={kind === 'Reel' ? <CirclePlay size={23} /> : <span className="story-ring" />}>
            <small>{isNew ? 'Novo ' : ''}{kind}</small>
            <strong>{post.title}</strong>
          </LinkRow>
        </li>
      })}</ul> : <p className="panel surface">Você ainda não tem notificações de Reels ou Stories.</p>}
    </Modal>}
    {drawer && <Modal title="Menu do Recomeço" close={() => setDrawer(false)}><nav className="drawer-nav" aria-label="Mais opções">{appMenu}</nav>{installButton}</Modal>}
    {add && <Modal title="Adicionar substância" close={closeAdd}><TrackForm choices={community.catalog} substance={add.substance} category={add.category} today={today} submit={(track) => {
      if (data.tracks.some((item) => item.substance.id === track.substance.id || normalize(item.substance.name) === normalize(track.substance.name))) return 'Você já acompanha esta substância.'
      if (save({ ...data, tracks: [...data.tracks, track] }, 'Substância adicionada.')) { setAdd(null); location.hash = `uso/${encodeURIComponent(track.substance.id)}${add.amount ? `/q-${add.amount}` : ''}` }
    }} /></Modal>}
    {clear && <Modal title="Limpar os dados?" close={() => setClear(false)}><p>Registros, anotações, mídias e cadastros de demonstração serão apagados deste navegador.</p><div className="actions">
      <button className="button soft" onClick={() => setClear(false)}>Cancelar</button><button className="button danger" onClick={async () => {
        try {
          await clearMedia(); clearData(); resetCommunity(); sessionStorage.removeItem('recomeco:admin-demo')
          setData(empty); setCommunity(initialCommunity); setViewedPosts([]); setClear(false); setNotice('Dados apagados deste navegador.')
        } catch { setNotice('Não foi possível limpar os dados deste navegador.') }
      }}><X size={17} /> Apagar dados</button></div></Modal>}
    <div className="notice" role="status">{notice && <span>{notice}</span>}</div>
  </>
}
