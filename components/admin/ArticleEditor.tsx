'use client'

import { useRef, useState } from 'react'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import { articleExtensions } from '@/lib/articles/extensions'
import { isSafeHref } from '@/lib/articles/content'
import { uploadArticleImage } from '@/lib/articles/upload'
import type { ArticleDoc } from '@/lib/articles/types'

type Props = {
  articleId: string
  initialContent: ArticleDoc
  onChange: (doc: ArticleDoc) => void
  onError: (message: string) => void
}

type ToolbarAction = {
  label: string
  title: string
  isActive: (editor: Editor) => boolean
  run: (editor: Editor) => void
}

const ACTIONS: ToolbarAction[] = [
  { label: 'H2', title: 'Overskrift', isActive: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'H3', title: 'Underoverskrift', isActive: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: 'B', title: 'Fet', isActive: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { label: 'I', title: 'Kursiv', isActive: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { label: '• Liste', title: 'Punktliste', isActive: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { label: '1. Liste', title: 'Nummerert liste', isActive: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { label: '« Sitat', title: 'Sitat', isActive: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
]

const BUTTON = 'text-xs font-medium px-2.5 py-1.5 rounded-md border transition-colors disabled:opacity-50'

function buttonStyle(isActive: boolean) {
  return `${BUTTON} ${isActive
    ? 'bg-(--color-cta) text-white border-(--color-cta)'
    : 'border-(--color-border) text-(--color-text) hover:border-(--color-cta)'}`
}

function Toolbar({ editor, articleId, onError }: { editor: Editor; articleId: string; onError: (message: string) => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const active = useEditorState({
    editor,
    selector: ({ editor: e }): Record<string, boolean> => ({
      ...Object.fromEntries(ACTIONS.map((a) => [a.title, a.isActive(e)])),
      link: e.isActive('link'),
    }),
  })

  function editLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Lenkeadresse (https://… eller /travels)', previous ?? '')
    if (url === null) return
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!isSafeHref(url)) {
      onError('Ugyldig lenke. Bruk https://, mailto: eller en intern adresse som starter med /')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  async function insertImage(file: File | undefined) {
    if (!file) return
    setIsUploading(true)
    const result = await uploadArticleImage(file, articleId)
    setIsUploading(false)
    if (fileInput.current) fileInput.current.value = ''
    if (!result.ok) {
      onError(result.error)
      return
    }
    const alt = window.prompt('Beskriv bildet kort (vises for skjermlesere)') ?? ''
    editor.chain().focus().setImage({ src: result.url, alt }).run()
  }

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-(--color-border) px-3 py-2 sticky top-[52px] bg-white z-10 rounded-t-2xl">
      {ACTIONS.map((action) => (
        <button key={action.title} type="button" title={action.title} className={buttonStyle(Boolean(active?.[action.title]))} onClick={() => action.run(editor)}>
          {action.label}
        </button>
      ))}
      <button type="button" title="Lenke" className={buttonStyle(Boolean(active?.link))} onClick={editLink}>
        Lenke
      </button>
      <button type="button" title="Bilde" className={buttonStyle(false)} disabled={isUploading} onClick={() => fileInput.current?.click()}>
        {isUploading ? 'Laster opp …' : 'Bilde'}
      </button>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => insertImage(e.target.files?.[0])} />
    </div>
  )
}

export default function ArticleEditor({ articleId, initialContent, onChange, onError }: Props) {
  const editor = useEditor({
    extensions: articleExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose-fera min-h-[420px] px-5 py-4 focus:outline-none' },
    },
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as ArticleDoc),
  })

  return (
    <div className="bg-white border border-(--color-border) rounded-2xl">
      {editor ? (
        <>
          <Toolbar editor={editor} articleId={articleId} onError={onError} />
          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="min-h-[420px]" aria-busy="true" />
      )}
    </div>
  )
}
