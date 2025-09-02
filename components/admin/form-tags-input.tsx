import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'

interface FormTagsInputProps {
  tags: string[]
  novaTag: string
  setNovaTag: (value: string) => void
  adicionarTag: () => void
  removerTag: (tag: string) => void
}

export function FormTagsInput({ tags, novaTag, setNovaTag, adicionarTag, removerTag }: FormTagsInputProps) {
  return (
    <div>
      <Label>Tags</Label>
      <div className="space-y-2 mt-2">
        <div className="flex gap-2">
          <Input placeholder="Adicionar tag" value={novaTag} onChange={(e) => setNovaTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())} />
          <Button type="button" onClick={adicionarTag} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removerTag(tag)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}