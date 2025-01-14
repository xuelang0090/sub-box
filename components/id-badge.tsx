import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface IdBadgeProps {
  id: string
  truncateLength?: number
}

export function IdBadge({ id, truncateLength = 6 }: IdBadgeProps) {
  const truncatedId = `${id.slice(0, truncateLength)}...`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="secondary" className="font-mono">
            {truncatedId}
          </Badge>
        </TooltipTrigger> 
        <TooltipContent>
          <p className="font-mono">{id}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 