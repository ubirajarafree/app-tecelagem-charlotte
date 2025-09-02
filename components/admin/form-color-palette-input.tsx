import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'

interface FormColorPaletteInputProps {
  cores: { [key: string]: string }
  novaCor: { nome: string; valor: string }
  setNovaCor: (value: { nome: string; valor: string }) => void
  adicionarCor: () => void
  removerCor: (nome: string) => void
}

export function FormColorPaletteInput({ cores, novaCor, setNovaCor, adicionarCor, removerCor }: FormColorPaletteInputProps) {
  return (
    <div>
      <Label>Paleta de Cores</Label>
      <div className="space-y-2 mt-2">
        <div className="flex gap-2">
          <Input placeholder="Nome da cor" value={novaCor.nome} onChange={(e) => setNovaCor({ ...novaCor, nome: e.target.value })} />
          <Input type="color" value={novaCor.valor} onChange={(e) => setNovaCor({ ...novaCor, valor: e.target.value })} className="w-20 p-1" />
          <Button type="button" onClick={adicionarCor} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {Object.keys(cores).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {Object.entries(cores).map(([nome, valor]) => (
              <div key={nome} className="flex items-center gap-2 p-2 border rounded-lg">
                <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: valor }} />
                <span className="text-sm flex-1 capitalize">{nome}</span>
                <button type="button" onClick={() => removerCor(nome)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}