import { useState } from 'react'

type PaletaCores = { [key: string]: string }

export function useColorPalette(initialColors: PaletaCores = {}) {
  const [cores, setCores] = useState<PaletaCores>(initialColors)
  const [novaCor, setNovaCor] = useState({ nome: '', valor: '#000000' })

  const adicionarCor = () => {
    const nomeCor = novaCor.nome.trim()
    if (nomeCor && novaCor.valor) {
      setCores({ ...cores, [nomeCor]: novaCor.valor })
      setNovaCor({ nome: '', valor: '#000000' })
    }
  }

  const removerCor = (nomeRemover: string) => {
    const novasCores = { ...cores }
    delete novasCores[nomeRemover]
    setCores(novasCores)
  }

  return {
    cores, novaCor, setNovaCor, adicionarCor, removerCor,
  }
}