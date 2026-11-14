import { useEffect, useState } from 'react'
import { CirclePlay, Eye, Plus, Trash2, Upload } from 'lucide-react'
import { deleteMedia, getMedia, saveMedia } from './community'
import type { Community, Post, SaveCommunity } from './community'
import { art, Callout, Heading, Modal } from './ui'

const formats = [
  { name: 'Reels', image: 'capa-reels', text: 'Vídeos curtos, verticais e dinâmicos para informar, inspirar e apoiar a recuperação.' },
  { name: 'Stories', image: 'capa-stories', text: 'Atualizações do dia a dia e bastidores de pessoas e instituições cadastradas no app.' },
] as const
export function Social({ data, activePosts, postId, save, notify }: {
  data: Community; activePosts: Post[]; postId: string; save: SaveCommunity; notify: (message: string) => void
}) {
  const [section, setSection] = useState<Post['kind'] | ''>('')
  const [upload, setUpload] = useState(false)
  const [busy, setBusy] = useState(false)
  const [remove, setRemove] = useState<Post | null>(null)
  if (postId) {
    const post = activePosts.find((item) => item.id === postId)
    return <>
      <Heading title={post ? post.title : 'Publicação indisponível'}>{post && (post.kind === 'Reels' ? 'Reel' : 'Story')}</Heading>
      {post ? <article className="panel surface"><PostMedia key={post.id} id={post.id} /></article> :
        <p className="panel surface">A publicação foi removida ou o Story expirou.</p>}
      <a className="button soft full" href="#comunidade">Ver Reels e Stories</a>
    </>
  }
  const visible = activePosts.filter((post) => post.kind === section)
  return <><Heading title="Reels & Stories">Histórias, informações e inspirações da comunidade Recomeço.</Heading>
    <div className="two-grid">{formats.map((format) => <button className="panel social-card" key={format.name} aria-pressed={section === format.name} onClick={() => setSection(format.name)}>
      <h2>{format.name === 'Reels' ? <CirclePlay size={22} /> : <span className="story-ring" />}{format.name}</h2><p>{format.text}</p><img src={art(format.image)} alt="" />
    </button>)}</div>
    <div className="message-panel lavender"><Eye size={25} /><p>O perfil exibe a contagem de visualizações sem revelar a identidade de quem visitou. A contagem real depende da comunidade conectada.</p></div>
    {section && <section className="stack">
      <div className="split-title"><h2>{section}</h2><button className="button primary" onClick={() => setUpload(true)}><Plus size={18} /> Adicionar {section === 'Reels' ? 'Reel' : 'Story'}</button></div>
      {visible.length ? visible.map((post) => <article key={post.id} className="panel surface"><div className="split-title"><h3><a href={`#comunidade/${encodeURIComponent(post.id)}`}>{post.title}</a></h3><button className="bare-icon danger-text" aria-label={`Remover ${post.title}`} onClick={() => setRemove(post)}><Trash2 size={20} /></button></div><PostMedia id={post.id} /></article>) : <p className="panel surface">Nenhum conteúdo local para exibir.</p>}
    </section>}
    {upload && <Modal title={section === 'Reels' ? 'Adicionar Reel' : 'Adicionar Story'} close={() => { if (!busy) setUpload(false) }}>
      <Callout>O conteúdo fica somente neste navegador. Escolha uma mídia de teste.</Callout>
      <form className="form" onSubmit={async (event) => {
        event.preventDefault()
        if (!section || busy) return
        const fields = new FormData(event.currentTarget)
        const file = fields.get('file')
        if (!(file instanceof File) || !file.size || file.size > 20 * 1024 * 1024 || !(section === 'Reels' ? file.type.startsWith('video/') : /^(image|video)\//.test(file.type))) {
          notify('Selecione uma mídia compatível de até 20 MB.')
          return
        }
        const post: Post = { id: crypto.randomUUID(), kind: section, title: String(fields.get('title')).trim(), created: Date.now() }
        setBusy(true)
        try {
          await saveMedia(post.id, file)
          if (save({ ...data, posts: [...data.posts, post] }, 'Conteúdo salvo neste navegador.')) setUpload(false)
          else await deleteMedia(post.id)
        } catch { notify('Não foi possível salvar a mídia neste navegador.') }
        finally { setBusy(false) }
      }}><label>Título<input name="title" required maxLength={100} /></label>
        <label>Arquivo (até 20 MB)<input type="file" name="file" accept={section === 'Reels' ? 'video/*' : 'image/*,video/*'} required /></label>
        <button className="button primary full" disabled={busy}><Upload size={18} /> {busy ? 'Salvando…' : 'Salvar conteúdo'}</button></form>
    </Modal>}
    {remove && <Modal title="Remover conteúdo?" close={() => { if (!busy) setRemove(null) }}><p>{remove.title}</p>
      <button className="button danger full" disabled={busy} onClick={async () => {
        setBusy(true)
        try {
          if (save({ ...data, posts: data.posts.filter((post) => post.id !== remove.id) }, 'Conteúdo removido.')) {
            await deleteMedia(remove.id)
            setRemove(null)
          }
        } catch { notify('Não foi possível remover o arquivo armazenado.') }
        finally { setBusy(false) }
      }}>Confirmar remoção</button>
    </Modal>}
  </>
}

function PostMedia({ id }: { id: string }) {
  const [media, setMedia] = useState<{ url: string; video: boolean } | null>()
  useEffect(() => {
    let url = ''
    let active = true
    void getMedia(id).then((blob) => {
      if (!active) return
      if (!blob) { setMedia(null); return }
      url = URL.createObjectURL(blob)
      setMedia({ url, video: blob.type.startsWith('video/') })
    }, () => { if (active) setMedia(null) })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [id])
  if (media === undefined) return <p>Carregando mídia…</p>
  if (!media) return <p>Arquivo indisponível neste navegador.</p>
  return media.video ? <video className="post-media" src={media.url} controls playsInline /> : <img className="post-media" src={media.url} alt="Imagem do conteúdo local" />
}
