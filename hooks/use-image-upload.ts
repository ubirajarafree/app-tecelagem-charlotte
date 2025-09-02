import { useState } from 'react'

export function useImageUpload(initialImageUrl: string | null = null) {
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl)

  const handleSelecaoImagem = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setArquivoImagem(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  return {
    arquivoImagem, previewUrl, handleSelecaoImagem,
  }
}