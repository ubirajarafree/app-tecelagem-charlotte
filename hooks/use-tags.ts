import { useState } from 'react'

export function useTags(initialTags: string[] = []) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [novaTag, setNovaTag] = useState('')

  const adicionarTag = () => {
    const tagLimpada = novaTag.trim()
    if (tagLimpada && !tags.includes(tagLimpada)) {
      setTags([...tags, tagLimpada])
      setNovaTag('')
    }
  }

  const removerTag = (tagRemover: string) => {
    setTags(tags.filter(tag => tag !== tagRemover))
  }

  return {
    tags, novaTag, setNovaTag, adicionarTag, removerTag,
  }
}