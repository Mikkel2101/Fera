import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { isSafeHref } from './content'

// Samme hviteliste som sanitizeDoc og ArticleBody. Alt annet fjernes ved innliming.
export const articleExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    strike: false,
    underline: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      isAllowedUri: (url) => isSafeHref(url),
    },
  }),
  Image.configure({ inline: false, allowBase64: false }),
]
