interface DateTimeProps {
  date: string | Date
  format?: "datetime" | "date" | "time"
}

export function DateTime({ date, format = "datetime" }: DateTimeProps) {
  const d = typeof date === "string" ? new Date(date) : date
  
  let options: Intl.DateTimeFormatOptions = {}
  
  switch (format) {
    case "datetime":
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
      break
    case "date":
      options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }
      break
    case "time":
      options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
      break
  }

  return (
    <time dateTime={d.toISOString()}>
      {d.toLocaleString('zh-CN', options)}
    </time>
  )
} 