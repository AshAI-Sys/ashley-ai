import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
  className?: string
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  className,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  
  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const selectDate = (day: number) => {
    const selectedDate = new Date(year, month, day)
    if (disabled && disabled(selectedDate)) return
    onSelect?.(selectedDate)
  }
  
  const isSelected = (day: number) => {
    if (!selected) return false
    const date = new Date(year, month, day)
    return date.toDateString() === selected.toDateString()
  }
  
  const isToday = (day: number) => {
    const date = new Date(year, month, day)
    return date.toDateString() === today.toDateString()
  }
  
  const isDisabled = (day: number) => {
    if (!disabled) return false
    const date = new Date(year, month, day)
    return disabled(date)
  }
  
  const renderCalendarDays = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayIsSelected = isSelected(day)
      const dayIsToday = isToday(day)
      const dayIsDisabled = isDisabled(day)
      
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          disabled={dayIsDisabled}
          className={cn(
            "h-9 w-9 text-center text-sm p-0 font-normal rounded-md",
            "hover:bg-accent hover:text-accent-foreground",
            "focus:bg-accent focus:text-accent-foreground focus:outline-none",
            dayIsSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            dayIsToday && !dayIsSelected && "bg-accent text-accent-foreground",
            dayIsDisabled && "text-muted-foreground opacity-50 cursor-not-allowed"
          )}
        >
          {day}
        </button>
      )
    }
    
    return days
  }
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(dayName => (
          <div key={dayName} className="h-9 w-9 text-center text-muted-foreground text-xs font-normal flex items-center justify-center">
            {dayName}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }