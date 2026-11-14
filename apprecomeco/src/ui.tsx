import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight, Info, X } from 'lucide-react'
import { catalog, categories } from './model'
import type { Category, Substance } from './model'

export const art = (name: string) => `./arte/${name}.png`

export function SubstanceIcon({ item }: { item: Category | Substance }) {
  const category = typeof item === 'string' ? item : item.category
  const icon = typeof item === 'string' ? undefined : item.icon || catalog.find((entry) => entry.id === item.id)?.icon
  const source = icon || categories.find((entry) => entry.id === category)?.icon || 'outras'
  return <span className="substance-icon"><img src={art(source)} alt="" width="39" height="39" /></span>
}

export function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return <header className="page-heading"><h1>{title}</h1>{children && <p>{children}</p>}</header>
}

export function Callout({ children, green = false }: { children: ReactNode; green?: boolean }) {
  return <div className={`callout ${green ? 'green' : ''}`}><Info size={20} /><div>{children}</div></div>
}

export function LinkRow({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return <a className="panel link-row" href={href}>{icon}<div>{children}</div><ChevronRight size={19} /></a>
}

export function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => { dialog.current?.showModal() }, [])
  return <dialog ref={dialog} className="dialog" aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); close() }}>
    <header className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="Fechar" onClick={close}><X size={21} /></button></header>
    {children}
  </dialog>
}
