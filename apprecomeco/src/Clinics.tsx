import { useState } from 'react'
import {
  Building2, CalendarDays, ChartNoAxesColumnIncreasing, Check, ChevronLeft, ChevronRight, Clock3, Heart,
  LockKeyhole, MapPin, Phone, Plus, Search, Send, Share2, Smile, Star, ThumbsDown, ThumbsUp, Users,
} from 'lucide-react'
import { admissionCategories, clinicTypes, httpUrl, regions, states } from './community'
import type { Clinic, Community, FamilyLink, SaveCommunity } from './community'
import { dateKey, formatDate, normalize } from './model'
import { art, Callout, Heading, LinkRow } from './ui'

const illustrations = ['clinica-frente', 'clinica-sala', 'clinica-quarto'].map(art)
const filters = { query: '', region: '', state: '', city: '', type: '' }

export function Clinics({ data }: { data: Community }) {
  const [values, setValues] = useState(filters)
  const [applied, setApplied] = useState<typeof filters | null>(null)
  const [savedOnly, setSavedOnly] = useState(false)
  const available = data.clinics.filter((clinic) => clinic.approved)
  const results = available.filter((clinic) => {
    if (savedOnly) return data.saved.includes(clinic.id)
    if (!applied) return false
    return normalize(`${clinic.name} ${clinic.city} ${clinic.state} ${clinic.type}`).includes(normalize(applied.query))
      && (!applied.region || regions[applied.region].includes(clinic.state))
      && (!applied.state || applied.state === clinic.state)
      && (!applied.city || normalize(clinic.city).includes(normalize(applied.city)))
      && (!applied.type || applied.type === clinic.type)
  })
  return <><Heading title="Clínicas de Reabilitação">Encontre clínicas, comunidades terapêuticas e tratamentos em todo o Brasil.</Heading>
    <form className="form" onSubmit={(event) => { event.preventDefault(); setSavedOnly(false); setApplied(values) }}>
      <label className="search-bar"><Search size={20} /><input type="search" aria-label="Buscar clínica" placeholder="Buscar clínica, cidade ou nome" value={values.query} onChange={(event) => setValues({ ...values, query: event.target.value })} /></label>
      <div className="panel clinic-filters">
        <label>Estado<select value={values.state} onChange={(event) => setValues({ ...values, state: event.target.value })}><option value="">Selecione o estado</option>{(values.region ? regions[values.region] : states).map((state) => <option key={state}>{state}</option>)}</select></label>
        <label>Região<select value={values.region} onChange={(event) => setValues({ ...values, region: event.target.value, state: '' })}><option value="">Selecione a região</option>{Object.keys(regions).map((region) => <option key={region}>{region}</option>)}</select></label>
        <label>Cidade<input placeholder="Selecione a cidade" value={values.city} onChange={(event) => setValues({ ...values, city: event.target.value })} /></label>
        <label>Tipo<select value={values.type} onChange={(event) => setValues({ ...values, type: event.target.value })}><option value="">Todos os tipos</option>{clinicTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      </div>
      <h2>Categorias de atendimento</h2>
      <div className="stack">{clinicTypes.map((type, index) => <button type="button" aria-pressed={values.type === type} className="button lavender full" key={type} onClick={() => setValues({ ...values, type: values.type === type ? '' : type })}>{index === 2 ? <Users size={20} /> : <Building2 size={20} />}{type}</button>)}</div>
      <button className="button primary full"><Search size={21} /> Buscar clínicas</button>
    </form>
    {(applied || savedOnly) && <section className="stack result-section">
      <div className="split-title"><div><h2>{savedOnly ? 'Clínicas salvas' : 'Clínicas cadastradas'}</h2><p>{results.length} {results.length === 1 ? 'resultado' : 'resultados'}</p></div>
        <button className="button soft" onClick={() => { setValues(filters); setApplied(null); setSavedOnly(false) }}>Limpar filtros</button></div>
      {results.length ? results.map((clinic) => <LinkRow href={`#clinica/${clinic.id}`} key={clinic.id} icon={clinic.sample || clinic.photo ? <img className="clinic-thumb" src={httpUrl(clinic.photo || '') || illustrations[0]} alt="" /> : <Building2 size={29} />}><strong>{clinic.name}</strong><small>{clinic.city} – {clinic.state}</small><span className="tag lavender">{clinic.type}</span>{clinic.sample && <small>Perfil demonstrativo</small>}</LinkRow>) : <p className="panel surface">Nenhuma clínica para os filtros escolhidos.</p>}
    </section>}
    <div className="actions"><button className="button soft" onClick={() => setSavedOnly(!savedOnly)}><Heart size={17} /> Clínicas salvas</button><a className="button soft" href="#cadastro-clinica"><Plus size={18} /> Cadastrar clínica</a></div>
    <Callout>As clínicas podem se cadastrar no aplicativo e aparecem na busca após aprovação do administrador.</Callout>
  </>
}

export function ClinicForm({ existing, submit }: { existing?: Clinic; submit: (clinic: Clinic) => void }) {
  return <form className="form" onSubmit={(event) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const value = (name: string) => String(fields.get(name) || '').trim()
    submit({ id: existing?.id || crypto.randomUUID(), name: value('name'), city: value('city'), state: value('state'),
      type: value('type'), address: value('address'), phone: value('phone'), hours: value('hours'), about: value('about'),
      photo: httpUrl(value('photo')), approved: existing?.approved || false, stats: existing?.stats })
  }}>
    <label>Nome da clínica<input name="name" maxLength={100} defaultValue={existing?.name} required /></label>
      <div className="two-grid"><label>Cidade<input name="city" maxLength={80} defaultValue={existing?.city} required /></label><label>Estado<select aria-label="Estado" name="state" defaultValue={existing?.state || ''} required><option value="">Selecione</option>{states.map((state) => <option key={state}>{state}</option>)}</select></label></div>
    <label>Tipo de atendimento<select name="type" defaultValue={existing?.type}>{clinicTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label>Endereço<input name="address" maxLength={180} defaultValue={existing?.address} required /></label>
    <div className="two-grid"><label>Telefone<input type="tel" name="phone" maxLength={25} defaultValue={existing?.phone} /></label><label>Funcionamento<input name="hours" maxLength={80} defaultValue={existing?.hours} required /></label></div>
    <label>Foto (URL pública, opcional)<input type="url" name="photo" defaultValue={existing?.photo} /></label>
    <label>Sobre a clínica<textarea rows={3} name="about" maxLength={800} defaultValue={existing?.about} required /></label>
    <button className="button primary full"><Send size={19} /> {existing ? 'Salvar alterações' : 'Enviar para aprovação'}</button>
  </form>
}

export function ClinicRegistration({ data, save }: { data: Community; save: SaveCommunity }) {
  return <><Heading title="Cadastrar clínica">Cadastre um perfil para a análise do administrador.</Heading>
    <Callout>Cadastro de demonstração neste navegador. Use dados fictícios.</Callout>
    <ClinicForm submit={(clinic) => {
      if (save({ ...data, clinics: [...data.clinics, clinic] }, 'Cadastro recebido para aprovação neste navegador.')) location.hash = 'portal-clinica'
    }} />
  </>
}

export function ClinicProfile({ clinic, data, save, notify }: { clinic: Clinic; data: Community; save: SaveCommunity; notify: (message: string) => void }) {
  const [index, setIndex] = useState(0)
  const saved = data.saved.includes(clinic.id)
  const own = data.reviews.find((review) => review.clinicId === clinic.id)
  const photos = clinic.sample ? illustrations : [httpUrl(clinic.photo || '')].filter(Boolean)
  const photo = photos[index]
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.address}, ${clinic.city} - ${clinic.state}`)}`
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: clinic.name, url: location.href })
      else { await navigator.clipboard.writeText(location.href); notify('Link copiado.') }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) notify('O navegador não conseguiu compartilhar o link.') }
  }
  return <><Heading title="Perfil da Clínica" />
    {photo && <div className="clinic-cover panel"><img src={photo} alt={`Foto ${index + 1} de ${clinic.name}`} />{photos.length > 1 && <>
      <button className="icon-button" aria-label="Foto anterior" onClick={() => setIndex((index + photos.length - 1) % photos.length)}><ChevronLeft size={20} /></button>
      <button className="icon-button" aria-label="Próxima foto" onClick={() => setIndex((index + 1) % photos.length)}><ChevronRight size={20} /></button>
    </>}</div>}
    <section className="panel surface clinic-summary">
      <h2>{clinic.name}</h2>{clinic.sample && <span className="tag peach">Perfil demonstrativo</span>}
      <p className="rating"><Star fill="currentColor" size={20} /> {own ? `${own.stars},0 (1 avaliação neste navegador)` : 'Sem avaliações'}</p>
      <span className="tag green">{clinic.type}</span>
      <div className="detail"><MapPin size={20} /><span>{clinic.address}<br />{clinic.city} – {clinic.state}</span></div>
      {clinic.phone && <div className="detail"><Phone size={19} /><span>{clinic.phone}</span><a className="button primary" href={`tel:${clinic.phone.replace(/[^0-9+]/g, '')}`}>Ligar</a></div>}
      <div className="detail"><Clock3 size={20} /><span>Funcionamento: {clinic.hours}</span></div><p>{clinic.about}</p>
      {!clinic.sample && <a href={mapUrl} className="button soft"><MapPin size={16} /> Ver no mapa</a>}
    </section>
    <LinkRow href={`#estatisticas-clinica/${clinic.id}`} icon={<ChartNoAxesColumnIncreasing size={22} />}><strong>Estatísticas da Clínica</strong><small>Internações voluntárias e involuntárias</small></LinkRow>
    {photos.length > 0 && <section><h2 className="section-title">Galeria de fotos</h2><div className="gallery">{photos.map((url, position) => <button key={url} onClick={() => setIndex(position)} aria-label={`Selecionar foto ${position + 1}`} aria-pressed={position === index}><img src={url} alt="" /></button>)}</div></section>}
    <div className="actions">
      <button className="button soft" aria-pressed={saved} onClick={() => save({ ...data, saved: saved ? data.saved.filter((id) => id !== clinic.id) : [...data.saved, clinic.id] }, saved ? 'Clínica removida das salvas.' : 'Clínica salva neste navegador.')}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Salva' : 'Salvar'}</button>
      <button className="button soft" onClick={() => void share()}><Share2 size={17} /> Compartilhar</button>
      <a className="button primary" href={`#avaliar-clinica/${clinic.id}`}><Star size={17} /> Avaliar clínica</a>
    </div>
  </>
}

export function ClinicReview({ clinic, data, save }: { clinic: Clinic; data: Community; save: SaveCommunity }) {
  const existing = data.reviews.find((review) => review.clinicId === clinic.id)
  const [patient, setPatient] = useState(existing ? 'sim' : '')
  const [liked, setLiked] = useState<boolean | undefined>(existing?.liked)
  const [stars, setStars] = useState(existing?.stars || 0)
  const [comment, setComment] = useState(existing?.comment || '')
  const [error, setError] = useState('')
  return <><Heading title="Avaliar Clínica">{clinic.name}{clinic.sample && ' · perfil demonstrativo'}</Heading>
    <form className="form" onSubmit={(event) => {
      event.preventDefault()
      if (patient !== 'sim' || liked === undefined || stars < 1) { setError('Confirme que foi paciente, indique como foi a experiência e escolha uma nota.'); return }
      if (save({ ...data, reviews: [...data.reviews.filter((item) => item.clinicId !== clinic.id), { clinicId: clinic.id, liked, stars, comment: comment.trim() }] }, 'Avaliação salva neste navegador.')) location.hash = `clinica/${clinic.id}`
    }}>
      <fieldset><legend>Você passou por esta clínica?</legend><div className="segments">
        <button type="button" aria-pressed={patient === 'sim'} onClick={() => setPatient('sim')}><Check size={18} /> Sim, fui paciente</button>
        <button type="button" aria-pressed={patient === 'nao'} onClick={() => setPatient('nao')}>Não, apenas conheço</button>
      </div></fieldset>
      {patient === 'nao' && <Callout>A avaliação é destinada a pessoas que já passaram pelo atendimento.</Callout>}
      <fieldset><legend>Você gostou do atendimento?</legend><div className="segments"><button type="button" aria-pressed={liked === true} onClick={() => setLiked(true)}><ThumbsUp size={18} /> Gostei</button><button type="button" aria-pressed={liked === false} onClick={() => setLiked(false)}><ThumbsDown size={18} /> Não gostei</button></div></fieldset>
      <div className="rating-stars" aria-label="Nota da avaliação">{[1, 2, 3, 4, 5].map((value) => <button type="button" className="bare-icon" aria-label={`${value} ${value === 1 ? 'estrela' : 'estrelas'}`} aria-pressed={stars === value} key={value} onClick={() => setStars(value)}><Star size={34} fill={value <= stars ? 'currentColor' : 'none'} /></button>)}</div>
      {stars > 0 && <p className="center">{['Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'][stars - 1]}</p>}
      <label>Deixe um breve comentário (opcional)<textarea value={comment} maxLength={200} rows={4} onChange={(event) => setComment(event.target.value)} placeholder="Conte como foi a sua experiência." /><small className="right">{comment.length}/200</small></label>
      {error && <p className="feedback" role="alert">{error}</p>}
      <button className="button primary full"><Send size={19} /> Enviar avaliação</button>
    </form>
  </>
}

const colors = ['#399736', '#a37bdb', '#eaad51', '#76b965', '#cec1d7']

export function ClinicStatistics({ clinic }: { clinic: Clinic }) {
  const stats = clinic.stats
  const total = stats ? stats.voluntary + stats.involuntary : 0
  const segments = stats?.shares.reduce<{ end: number; values: string[] }>((result, share, index) => ({
    end: result.end + share,
    values: [...result.values, `${colors[index]} ${result.end}% ${result.end + share}%`],
  }), { end: 0, values: [] })
  return <><Heading title="Estatísticas da Clínica">{clinic.name}</Heading>
    {!stats || !segments ? <p className="panel surface">Esta clínica ainda não forneceu estatísticas de atendimento.</p> : <>
      <Callout>Dados de demonstração dos últimos 12 meses.</Callout>
      <div className="two-grid"><section className="panel surface green"><Users size={25} /><h3>Internações voluntárias</h3><strong className="big-number">{stats.voluntary}</strong></section><section className="panel surface lavender"><LockKeyhole size={25} /><h3>Internações involuntárias</h3><strong className="big-number">{stats.involuntary}</strong></section></div>
      <section className="panel surface"><h2>Principais substâncias por internação</h2>
        <div className="donut-layout"><div className="donut" style={{ background: `conic-gradient(${[...segments.values, `#e9e0ce ${segments.end}% 100%`].join(',')})` }}><div>{total}<small>total</small></div></div>
          <ul className="chart-key">{admissionCategories.map((name, index) => <li key={name}><span style={{ background: colors[index] }} />{name}<strong>{stats.shares[index]}%</strong></li>)}</ul>
        </div></section>
    </>}
  </>
}

export function FamilyPortal({ data, save }: { data: Community; save: SaveCommunity }) {
  const links = data.links.filter((item) => item.authorized && (item.id !== 'example-family' || data.sampleFamily) && data.clinics.some((clinic) => clinic.approved && clinic.id === item.clinicId))
  const [selected, setSelected] = useState('')
  const current = links.find((item) => item.id === selected) || links[0]
  const clinic = data.clinics.find((item) => item.id === current?.clinicId)
  const days = current?.since ? Math.max(0, (Date.parse(dateKey()) - Date.parse(current.since)) / 86_400_000) : 38
  return <><Heading title="Portal da Família">Acompanhamento familiar autorizado.</Heading>
    <Callout green>Apenas familiares autorizados pelo paciente e pela clínica têm acesso ao acompanhamento real. Os dados desta tela são de demonstração.</Callout>
    {!current ? <section className="panel surface"><p>Nenhum vínculo familiar de demonstração está ativo.</p><button className="button soft full" onClick={() => save({ ...data, sampleFamily: true }, 'Exemplo familiar aberto.')}>Ver exemplo do portal</button></section> : <>
      {links.length > 1 && <label className="form">Acompanhamento<select value={current.id} onChange={(event) => setSelected(event.target.value)}>{links.map((item) => <option key={item.id} value={item.id}>{item.patient}</option>)}</select></label>}
      <section className="panel surface"><div className="split-title"><h2>{current.patient}</h2><span className="tag green">Em tratamento</span></div><p>Paciente acompanhado por {clinic?.name}.</p></section>
      <div className="three-grid">{[[CalendarDays, 'Dias em tratamento', `${days} dias`], [Check, 'Frequência', `${current.frequency}%`], [Smile, 'Estado emocional', current.mood]].map(([Icon, label, value]) => {
        const Symbol = Icon as typeof Smile
        return <div className="panel surface metric" key={String(label)}><Symbol size={22} /><small>{String(label)}</small><strong>{String(value)}</strong></div>
      })}</div>
      <div className="two-grid"><section className="panel surface"><h3>Evolução / Progresso</h3><p>{current.progress || 'Ainda sem atualização.'}</p></section><section className="panel surface"><h3>Próxima visita</h3><p>{current.visit ? formatDate(current.visit) : 'A confirmar'}</p></section></div>
      <section className="panel surface"><h2>Linha do tempo da recuperação</h2><ol className="timeline">{[[0, 'Admissão'], [7, '1ª semana'], [30, '30 dias'], [60, '60 dias']].map(([day, label]) => <li key={day} className={days >= Number(day) ? 'done' : ''}>{label}</li>)}</ol></section>
      {data.sampleFamily && <button className="button soft full" onClick={() => save({ ...data, sampleFamily: false }, 'Exemplo familiar fechado.')}>Fechar exemplo</button>}
    </>}
  </>
}

export function ClinicPortal({ data, save }: { data: Community; save: SaveCommunity }) {
  const [editing, setEditing] = useState<FamilyLink | null>(null)
  const [statsClinic, setStatsClinic] = useState('')
  const [statsError, setStatsError] = useState('')
  const clinics = data.clinics.filter((item) => !item.sample)
  const available = data.clinics.filter((item) => item.approved)
  const selectedClinic = clinics.find((item) => item.id === statsClinic)
  return <><Heading title="Portal da Clínica">Cadastros, acompanhamento e vínculos familiares.</Heading>
    <Callout>Ambiente de demonstração. Cadastre somente pacientes e contatos fictícios.</Callout>
    <a className="button primary full" href="#cadastro-clinica"><Plus size={18} /> Cadastrar clínica</a>
    <section className="stack"><h2 className="section-title">Meus cadastros</h2>{clinics.length ? clinics.map((clinic) => <div className="panel line-button" key={clinic.id}><Building2 size={23} /><strong>{clinic.name}</strong><span className={`tag ${clinic.approved ? 'green' : 'lavender'}`}>{clinic.approved ? 'Aprovada' : 'Pendente'}</span></div>) : <p className="panel surface">Nenhum cadastro enviado neste navegador.</p>}</section>
    {clinics.length > 0 && <section className="panel surface stack">
      <h2>Estatísticas de atendimento</h2>
      <div className="form"><label>Clínica para atualizar estatísticas<select aria-label="Clínica para atualizar estatísticas" value={statsClinic} onChange={(event) => { setStatsClinic(event.target.value); setStatsError('') }}><option value="">Escolha uma clínica</option>{clinics.map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}</select></label></div>
      {selectedClinic && <form key={selectedClinic.id} className="form" onSubmit={(event) => {
        event.preventDefault()
        const fields = new FormData(event.currentTarget)
        const shares = admissionCategories.map((name) => Number(fields.get(name)))
        if (shares.reduce((sum, share) => sum + share, 0) > 100) { setStatsError('A soma das porcentagens deve ser de até 100%.'); return }
        const stats = { voluntary: Number(fields.get('voluntary')), involuntary: Number(fields.get('involuntary')), shares }
        if (save({ ...data, clinics: data.clinics.map((item) => item.id === selectedClinic.id ? { ...item, stats } : item) }, 'Estatísticas de demonstração salvas.')) setStatsError('')
      }}><div className="two-grid"><label>Voluntárias<input name="voluntary" type="number" min="0" step="1" max="999999" defaultValue={selectedClinic.stats?.voluntary || 0} required /></label><label>Involuntárias<input name="involuntary" type="number" min="0" step="1" max="999999" defaultValue={selectedClinic.stats?.involuntary || 0} required /></label></div>
        <div className="two-grid">{admissionCategories.map((name, index) => <label key={name}>{name} (%)<input name={name} type="number" min="0" step="1" max="100" defaultValue={selectedClinic.stats?.shares[index] || 0} required /></label>)}</div>
        {statsError && <p role="alert" className="feedback">{statsError}</p>}<button className="button primary full">Salvar estatísticas</button>
      </form>}
    </section>}
    <h2 className="section-title">Cadastrar paciente e familiar</h2>
    <form className="form panel surface" key={editing?.id || 'new'} onSubmit={(event) => {
      event.preventDefault()
      const fields = new FormData(event.currentTarget)
      const v = (key: string) => String(fields.get(key) || '').trim()
      const link: FamilyLink = { id: editing?.id || crypto.randomUUID(), clinicId: v('clinic'), patient: v('patient'), family: v('family'), contact: v('contact'), since: v('since'), frequency: Number(v('frequency')), mood: v('mood'), progress: v('progress'), visit: v('visit'), authorized: fields.has('authorized') }
      if (save({ ...data, links: [...data.links.filter((item) => item.id !== link.id), link] }, 'Acompanhamento salvo neste navegador.')) { setEditing(null); event.currentTarget.reset() }
    }}>
      <label>Clínica<select name="clinic" defaultValue={editing?.clinicId} required>{available.map((item) => <option key={item.id} value={item.id}>{item.name}{item.sample ? ' (exemplo)' : ''}</option>)}</select></label>
      <div className="two-grid"><label>Paciente (fictício)<input name="patient" maxLength={80} defaultValue={editing?.patient} required /></label><label>Familiar (fictício)<input name="family" maxLength={80} defaultValue={editing?.family} required /></label></div>
      <label>Contato familiar (fictício)<input name="contact" maxLength={100} defaultValue={editing?.contact} /></label>
      <div className="two-grid"><label>Admissão<input type="date" name="since" max={dateKey()} defaultValue={editing?.since || dateKey()} required /></label><label>Próxima visita<input name="visit" type="date" defaultValue={editing?.visit} /></label></div>
      <div className="two-grid"><label>Frequência (%)<input name="frequency" type="number" min="0" max="100" defaultValue={editing?.frequency ?? 0} required /></label><label>Estado emocional<input name="mood" maxLength={40} defaultValue={editing?.mood} required /></label></div>
      <label>Evolução / Progresso<textarea name="progress" maxLength={500} rows={3} defaultValue={editing?.progress} /></label>
      <label className="check-line"><input type="checkbox" name="authorized" defaultChecked={editing?.authorized} /> Marcar vínculo de demonstração como autorizado</label>
      <button className="button primary full"><Check size={19} /> Salvar acompanhamento</button>
      {editing && <button className="button soft full" type="button" onClick={() => setEditing(null)}>Cancelar edição</button>}
    </form>
    {data.links.filter((item) => item.id !== 'example-family').map((item) => <button key={item.id} className="panel line-button full" onClick={() => setEditing(item)}><Users size={23} /><strong>{item.patient}</strong><span className="tag green">{item.authorized ? 'Autorizado' : 'Sem autorização'}</span></button>)}
  </>
}
