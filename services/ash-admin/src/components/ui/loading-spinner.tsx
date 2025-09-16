export function LoadingSpinner({ size = "medium" }: { size?: "small" | "medium" | "large" | "lg" }) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6", 
    large: "w-8 h-8",
    lg: "w-8 h-8"
  }

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}