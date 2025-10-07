import dynamic from 'next/dynamic'

// Dynamically import the page content with SSR disabled to prevent hydration errors
const NewOrderPageContent = dynamic(() => import('./page-content'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto py-6">
      <div className="text-center">Loading order form...</div>
    </div>
  )
})

export default function NewOrderPage() {
  return <NewOrderPageContent />
}
