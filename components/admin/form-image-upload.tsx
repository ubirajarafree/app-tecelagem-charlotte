import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

interface FormImageUploadProps {
  previewUrl: string | null
  handleSelecaoImagem: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function FormImageUpload({ previewUrl, handleSelecaoImagem }: FormImageUploadProps) {
  return (
    <FormItem>
      <FormLabel>Imagem da Estampa</FormLabel>
      <FormControl>
        <div className="flex items-center gap-4">
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
          )}
          <Label htmlFor="picture" className="flex-1 flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
              <p className="text-xs text-gray-500">PNG, JPG ou WEBP</p>
            </div>
            <Input id="picture" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleSelecaoImagem} />
          </Label>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}