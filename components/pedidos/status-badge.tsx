import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'processando' | 'concluido' | 'cancelado' | string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'processando':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processando</Badge>
    case 'concluido':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>
    case 'cancelado':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}