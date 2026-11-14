import { useState } from 'react'
import {
  BookOpen, Building2, ChartNoAxesColumnIncreasing, Check, ClipboardCheck, HeartHandshake, Pencil,
  Pill, Plus, Search, Settings, ShieldCheck, Stethoscope, Trash2, UserRound, Users,
} from 'lucide-react'
import { categories, normalize } from './model'
import type { Category, Data, Substance } from './model'
import { httpUrl } from './community'
import type { Community, Group, Professional, SaveCommunity } from './community'
import { ClinicForm } from './Clinics'
import { Callout, Heading, LinkRow, Modal, SubstanceIcon } from './ui'

const modules = [
  { id: 'substancias', title: 'Substâncias', detail: 'Gerenciar catálogo', icon: Pill },
  { id: 'grupos', title: 'Grupos de Apoio', detail: 'WhatsApp e Facebook', icon: Users },
  { id: 'profissionais', title: 'Profissionais', detail: 'Cadastrar e validar', icon: Stethoscope },
  { id: 'clinicas', title: 'Clínicas de Reabilitação', detail: 'Gerenciar cadastros', icon: Building2 },
  { id: 'aprovacoes', title: 'Aprovações Pendentes', detail: 'Revisar clínicas', icon: ClipboardCheck },
  { id: 'mensagens', title: 'Mensagens do Dia', detail: 'Editar e programar', icon: BookOpen },
  { id: 'usuarios', title: 'Usuários', detail: 'Cadastros de demonstração', icon: UserRound },
  { id: 'configuracoes', title: 'Configurações', detail: 'Preferências e dados locais', icon: Settings },
  { id: 'relatorios', title: 'Relatórios e Estatísticas', detail: 'Uso, cadastros e avaliações', icon: ChartNoAxesColumnIncreasing },
]

export function Admin({ section, data, personal, save }: { section: string; data: Community; personal: Data; save: SaveCommunity }) {
  const [active, setActive] = useState(() => sessionStorage.getItem('recomeco:admin-demo') === '1')
  const pending = data.clinics.filter((item) => !item.approved).length
  if (!active) return <><Heading title="Painel do Administrador">Gestão completa da plataforma.</Heading>
    <Callout>Área demonstrativa. As alterações afetam apenas este navegador. Use dados fictícios.</Callout>
    <button className="button primary full" onClick={() => { sessionStorage.setItem('recomeco:admin-demo', '1'); setActive(true) }}><ShieldCheck size={19} /> Abrir painel de demonstração</button>
  </>
  const module = modules.find((item) => item.id === section)
  if (!module) return <div className="admin-dashboard">
    <Heading title="Painel do Administrador">Gestão do Aplicativo</Heading>
    <span className="tag admin-tag"><ShieldCheck size={17} /> Administrador · demonstração</span>
    <div className="category-grid">{modules.map(({ id, title, detail, icon: Icon }) => <a key={id} className="panel category admin-tile" href={`#admin/${id}`}><Icon size={26} /><strong>{title}</strong><small>{detail}</small>{id === 'aprovacoes' && pending > 0 && <span className="badge-count">{pending}</span>}</a>)}</div>
    <Callout>As clínicas aparecem na busca somente após aprovação do administrador.</Callout>
    <button className="button soft full" onClick={() => { sessionStorage.removeItem('recomeco:admin-demo'); setActive(false) }}>Sair da demonstração</button>
  </div>
  return <><Heading title={`Gestão – ${module.title}`} />
    {section === 'substancias' && <ManageCatalog data={data} save={save} />}
    {section === 'grupos' && <ManageDirectory kind="groups" data={data} save={save} />}
    {section === 'profissionais' && <ManageDirectory kind="professionals" data={data} save={save} />}
    {['clinicas', 'aprovacoes'].includes(section) && <ManageClinics data={data} save={save} pendingOnly={section === 'aprovacoes'} />}
    {section === 'mensagens' && <form className="form panel surface" onSubmit={(event) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      save({ ...data, message: String(form.get('message')).trim(), messageDate: String(form.get('date')) }, 'Mensagem do dia salva.')
    }}><label>Mensagem do dia<textarea name="message" defaultValue={data.message} rows={4} maxLength={220} /></label><label>Publicar a partir de (opcional)<input type="date" name="date" defaultValue={data.messageDate} /></label><button className="button primary full"><Check size={18} /> Salvar mensagem</button></form>}
    {section === 'usuarios' && <div className="stack"><div className="panel surface"><h2>Perfil deste navegador</h2><p>{data.name || 'Nome ainda não informado'}</p></div>{data.links.filter((item) => item.id !== 'example-family').map((item) => <div key={item.id} className="panel line-button"><Users size={20} /><strong>{item.patient}</strong></div>)}<LinkRow href="#portal-clinica" icon={<Building2 size={20} />}><strong>Gerenciar vínculos no Portal da Clínica</strong></LinkRow></div>}
    {section === 'configuracoes' && <div className="stack"><Callout>As permissões de contas reais dependem da conexão com autenticação e banco de dados.</Callout><LinkRow href="#perfil" icon={<UserRound size={20} />}><strong>Editar meu perfil</strong></LinkRow><LinkRow href="#privacidade" icon={<Settings size={20} />}><strong>Configurações do aplicativo</strong></LinkRow></div>}
    {section === 'relatorios' && <><Callout>Estatísticas dos dados armazenados neste navegador.</Callout><div className="category-grid">
      {[[personal.tracks.length, 'Substâncias acompanhadas'], [personal.entries.length, 'Registros de consumo'], [data.clinics.filter((item) => !item.sample).length, 'Cadastros de clínicas'], [data.reviews.length, 'Avaliações'], [data.groups.length, 'Grupos'], [personal.notes.length, 'Anotações']].map(([count, label]) => <div className="panel surface metric" key={label}><strong className="big-number">{count}</strong><span>{label}</span></div>)}
    </div></>}
  </>
}

function RowActions({ name, edit, remove }: { name: string; edit: () => void; remove: () => void }) {
  return <span className="row-actions"><button className="bare-icon" aria-label={`Editar ${name}`} onClick={edit}><Pencil size={18} /></button><button className="bare-icon danger-text" aria-label={`Remover ${name}`} onClick={remove}><Trash2 size={19} /></button></span>
}

function ManageCatalog({ data, save }: { data: Community; save: SaveCommunity }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todas')
  const [item, setItem] = useState<Partial<Substance> | null>(null)
  const [remove, setRemove] = useState<Substance | null>(null)
  const filtered = data.catalog.filter((entry) => normalize(entry.name).includes(normalize(query)) && (
    filter === 'Todas' || filter === 'Álcool' && entry.category === 'bebidas' ||
    filter === 'Tabaco' && entry.category === 'tabaco' || filter === 'Outras' && entry.category === 'outras' ||
    filter === 'Drogas' && !['bebidas', 'tabaco', 'outras'].includes(entry.category)
  ))
  return <>
    <button className="button primary full" onClick={() => setItem({})}><Plus size={20} /> Adicionar ao catálogo</button>
    <div className="search-bar"><Search size={20} /><input type="search" aria-label="Buscar no catálogo" placeholder="Buscar substância..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    <div className="chips">{['Todas', 'Álcool', 'Drogas', 'Tabaco', 'Outras'].map((label) => <button key={label} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}</div>
    <div className="stack">{filtered.map((entry) => <div className="panel line-button" key={entry.id}><SubstanceIcon item={entry} /><strong>{entry.name}</strong><RowActions name={entry.name} edit={() => setItem(entry)} remove={() => setRemove(entry)} /></div>)}</div>
    {data.requests.length > 0 && <section className="stack"><h2 className="section-title">Solicitações de inclusão</h2>{data.requests.map((name) => <button className="panel line-button" key={name} onClick={() => setItem({ name })}><Plus size={19} /><strong>{name}</strong></button>)}</section>}
    {item && <Modal title={item.id ? 'Editar substância' : 'Adicionar substância'} close={() => setItem(null)}>
      <form className="form" onSubmit={(event) => {
        event.preventDefault()
        const fields = new FormData(event.currentTarget)
        const name = String(fields.get('name')).trim()
        if (!name) return
        const next: Substance = { ...item, name, id: item.id || crypto.randomUUID(), category: String(fields.get('category')) as Category, aliases: String(fields.get('aliases')).trim() }
        const catalog = item.id ? data.catalog.map((entry) => entry.id === item.id ? next : entry) : [...data.catalog, next]
        if (save({ ...data, catalog, requests: data.requests.filter((request) => normalize(request) !== normalize(name)) }, 'Catálogo atualizado.')) setItem(null)
      }}><label>Nome<input name="name" defaultValue={item.name} maxLength={80} required /></label>
        <label>Categoria<select name="category" defaultValue={item.category || 'outras'}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Sinônimos<input name="aliases" defaultValue={item.aliases} maxLength={150} /></label><button className="button primary full"><Check size={18} /> Salvar substância</button></form>
    </Modal>}
    {remove && <Modal title="Remover do catálogo?" close={() => setRemove(null)}><p>{remove.name} deixará de aparecer na busca. Registros de acompanhamento seguem disponíveis.</p><button className="button danger full" onClick={() => { if (save({ ...data, catalog: data.catalog.filter((entry) => entry.id !== remove.id) }, 'Substância removida do catálogo.')) setRemove(null) }}>Remover substância</button></Modal>}
  </>
}

function ManageDirectory({ kind, data, save }: { kind: 'groups' | 'professionals'; data: Community; save: SaveCommunity }) {
  const [item, setItem] = useState<Partial<Group & Professional> | null>(null)
  const [remove, setRemove] = useState<Group | Professional | null>(null)
  const group = kind === 'groups'
  const noun = group ? 'grupo' : 'profissional'
  const entries = data[kind]
  const removeEntry = () => group
    ? save({ ...data, groups: data.groups.filter((entry) => entry.id !== remove?.id) }, 'Grupo removido.')
    : save({ ...data, professionals: data.professionals.filter((entry) => entry.id !== remove?.id) }, 'Profissional removido.')
  return <><button className="button primary full" onClick={() => setItem({})}><Plus size={20} /> Cadastrar {noun}</button>
    <div className="stack">{entries.length ? entries.map((entry) => <div className="panel line-button" key={entry.id}><HeartHandshake size={20} /><div><strong>{entry.name}</strong><small>{'network' in entry ? entry.network : entry.specialty}</small></div><RowActions name={entry.name} edit={() => setItem(entry)} remove={() => setRemove(entry)} /></div>) : <p className="panel surface">Nenhum cadastro neste navegador.</p>}</div>
    {item && <Modal title={item.id ? `Editar ${noun}` : `Cadastrar ${noun}`} close={() => setItem(null)}><form className="form" onSubmit={(event) => {
      event.preventDefault()
      const fields = new FormData(event.currentTarget)
      const v = (key: string) => String(fields.get(key) || '').trim()
      const common = { id: item.id || crypto.randomUUID(), name: v('name'), about: v('about') }
      if (group) {
        const url = httpUrl(v('url'))
        const network = v('network') as Group['network']
        const host = url ? new URL(url).hostname.toLowerCase() : ''
        if (!(network === 'WhatsApp' ? (host === 'chat.whatsapp.com' || host === 'whatsapp.com') : (host === 'facebook.com' || host.endsWith('.facebook.com')))) {
          const field = event.currentTarget.elements.namedItem('url') as HTMLInputElement
          field.setCustomValidity('Informe um link válido para a rede selecionada.')
          field.reportValidity()
          return
        }
        if (save({ ...data, groups: [...data.groups.filter((entry) => entry.id !== common.id), { ...common, network, url }] }, 'Grupo salvo.')) setItem(null)
        return
      }
      const next = { ...common, specialty: v('specialty'), registry: v('registry'), phone: v('phone'), website: httpUrl(v('website')) }
      if (save({ ...data, professionals: [...data.professionals.filter((entry) => entry.id !== common.id), next] }, 'Profissional salvo.')) setItem(null)
    }}><label>Nome<input name="name" maxLength={100} defaultValue={item.name} required /></label>
      {group ? <><label>Rede<select name="network" defaultValue={item.network} onChange={(event) => (event.currentTarget.form?.elements.namedItem('url') as HTMLInputElement | null)?.setCustomValidity('')}><option>WhatsApp</option><option>Facebook</option></select></label><label>Link do grupo<input name="url" type="url" defaultValue={item.url} onInput={(event) => event.currentTarget.setCustomValidity('')} required /></label></> :
        <><label>Especialidade<input name="specialty" defaultValue={item.specialty} required maxLength={100} /></label><label>Registro profissional<input name="registry" defaultValue={item.registry} required maxLength={40} /></label><label>Telefone<input name="phone" type="tel" defaultValue={item.phone} maxLength={25} /></label><label>Site<input name="website" type="url" defaultValue={item.website} /></label></>}
      <label>Descrição<textarea name="about" defaultValue={item.about} rows={3} maxLength={300} required /></label><button className="button primary full"><Check size={18} /> Salvar {noun}</button>
    </form></Modal>}
    {remove && <Modal title={`Remover ${noun}?`} close={() => setRemove(null)}><p>{remove.name}</p><button className="button danger full" onClick={() => { if (removeEntry()) setRemove(null) }}>Confirmar remoção</button></Modal>}
  </>
}

function ManageClinics({ data, save, pendingOnly }: { data: Community; save: SaveCommunity; pendingOnly: boolean }) {
  const [editing, setEditing] = useState('')
  const clinics = data.clinics.filter((item) => !item.sample && (!pendingOnly || !item.approved))
  const selected = clinics.find((item) => item.id === editing)
  return <div className="stack">{clinics.length ? clinics.map((item) => <article className="panel surface" key={item.id}><h2>{item.name}</h2><p>{item.city} – {item.state}</p><p>{item.about}</p>
    <span className={`tag ${item.approved ? 'green' : 'lavender'}`}>{item.approved ? 'Aprovada' : 'Pendente'}</span>
    <div className="actions"><button className="button soft" onClick={() => setEditing(item.id)}><Pencil size={17} /> Editar cadastro</button>
      <button className={`button ${item.approved ? 'soft' : 'primary'}`} onClick={() => save({ ...data, clinics: data.clinics.map((entry) => entry.id === item.id ? { ...entry, approved: !entry.approved } : entry) }, item.approved ? 'Clínica removida da busca.' : 'Clínica aprovada e disponível na busca.')}><Check size={17} />{item.approved ? 'Retirar aprovação' : 'Aprovar clínica'}</button></div>
  </article>) : <p className="panel surface">Nenhuma clínica {pendingOnly ? 'pendente de aprovação' : 'cadastrada'} neste navegador.</p>}
    {selected && <Modal title="Editar cadastro da clínica" close={() => setEditing('')}><ClinicForm existing={selected} submit={(item) => {
      if (save({ ...data, clinics: data.clinics.map((entry) => entry.id === item.id ? item : entry) }, 'Cadastro atualizado.')) setEditing('')
    }} /></Modal>}
  </div>
}
