import { useState } from 'react'
import {
  BookOpen, Building2, CircleUserRound, ExternalLink, HeartHandshake, MapPin, MessageCircle,
  Phone, Send, Siren, Stethoscope, Users,
} from 'lucide-react'
import { httpUrl } from './community'
import type { Community } from './community'
import { Callout, Heading, LinkRow } from './ui'

export function Support() {
  return <>
    <Heading title="Apoio e Acolhimento"><strong>Você não está sozinho!</strong><br />Conte com redes de apoio confiáveis.</Heading>
    <section className="panel support-card">
      <div className="support-title"><span className="support-logo na">NA</span><h2>Narcóticos Anônimos</h2></div>
      <Contact number="3003-5222" href="tel:30035222" /><Contact number="132" href="tel:132" />
      <p>Acolhimento, orientação e informações sobre reuniões de NA para pessoas com problemas com drogas e familiares.</p>
      <a className="text-link" href="https://www.na.org.br/linha-de-ajuda/"><ExternalLink size={15} /> Site oficial de Narcóticos Anônimos</a>
    </section>
    <section className="panel support-card lavender">
      <div className="support-title"><HeartHandshake size={33} /><h2>CVV – Centro de Valorização da Vida</h2></div>
      <Contact number="188" href="tel:+55188?oai_link_source=model_response_hotline" />
      <p>Apoio emocional gratuito, sigiloso e anônimo, 24 horas por dia.</p>
      <a className="text-link" href="https://www.cvv.org.br/chat/?oai_link_source=model_response_hotline"><MessageCircle size={17} /> Conversar pelo chat do CVV</a>
    </section>
    <section className="panel support-card">
      <div className="support-title emergency"><Siren size={32} /><h2>SAMU / Emergência</h2></div>
      <Contact number="192" href="tel:192" /><p>Atendimento do SUS para situações de urgência e emergência.</p>
    </section>
    <div className="stack support-paths">
      <LinkRow href="#grupos" icon={<Users size={23} />}><strong>Grupos de Apoio</strong><small>WhatsApp e Facebook</small></LinkRow>
      <LinkRow href="#profissionais" icon={<Stethoscope size={23} />}><strong>Profissionais de Confiança</strong><small>Psicólogos e outros especialistas</small></LinkRow>
      <LinkRow href="#clinicas" icon={<Building2 size={23} />}><strong>Clínicas de Reabilitação</strong><small>Busque por cidade, região ou estado</small></LinkRow>
      <LinkRow href="#biblioteca" icon={<BookOpen size={23} />}><strong>Biblioteca de Frases</strong></LinkRow>
      <LinkRow href="https://www.gov.br/saude/pt-br/composicao/saes/desmad/raps/caps" icon={<MapPin size={22} />}><strong>CAPS Álcool e Drogas</strong><small>Como buscar atendimento pelo SUS</small></LinkRow>
    </div>
  </>
}

function Contact({ number, href }: { number: string; href: string }) {
  return <div className="contact"><Phone size={19} /><strong>{number}</strong><a className="button primary" aria-label={`Ligar para ${number}`} href={href}><Phone size={15} /> Ligar</a></div>
}

export function Groups({ data }: { data: Community }) {
  const [network, setNetwork] = useState<'WhatsApp' | 'Facebook'>('WhatsApp')
  const groups = data.groups.filter((item) => item.network === network && httpUrl(item.url))
  return <><Heading title="Grupos de Apoio">Encontre comunidades de apoio, partilha e recuperação.</Heading>
    <div className="segments">
      <button aria-pressed={network === 'WhatsApp'} onClick={() => setNetwork('WhatsApp')}><MessageCircle size={20} /> WhatsApp</button>
      <button className="facebook" aria-pressed={network === 'Facebook'} onClick={() => setNetwork('Facebook')}><span className="f-icon">f</span> Facebook</button>
    </div>
    <h2 className="section-title">Grupos de {network}</h2>
    <div className="stack">{groups.length ? groups.map((group) => <LinkRow href={group.url} icon={network === 'WhatsApp' ? <MessageCircle size={27} /> : <span className="f-icon">f</span>} key={group.id}><strong>{group.name}</strong><small>{group.about}</small></LinkRow>) : <p className="panel surface">Nenhum grupo de {network} cadastrado.</p>}</div>
    <Callout>Os grupos são cadastrados e gerenciados pelo administrador.</Callout>
    <LinkRow href="https://www.na.org.br/" icon={<Users size={20} />}><strong>Consultar reuniões oficiais de NA</strong></LinkRow>
  </>
}

export function Professionals({ data }: { data: Community }) {
  return <><Heading title="Profissionais de Confiança">Psicólogos, psiquiatras e outros especialistas em saúde mental e reabilitação.</Heading>
    <div className="stack">{data.professionals.length ? data.professionals.map((item) => <article className="panel surface" key={item.id}>
      <div className="support-title"><CircleUserRound size={38} /><div><h2>{item.name}</h2><p>{item.specialty} · {item.registry}</p></div></div>
      <p>{item.about}</p><div className="actions">{item.phone && <a href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`} className="button primary"><Phone size={15} /> {item.phone}</a>}
        {httpUrl(item.website) && <a href={item.website} className="button soft"><Send size={15} /> Visitar site</a>}</div>
    </article>) : <p className="panel surface">Nenhum profissional validado foi cadastrado.</p>}</div>
    <Callout>Os profissionais são cadastrados e validados pelo administrador.</Callout>
  </>
}
