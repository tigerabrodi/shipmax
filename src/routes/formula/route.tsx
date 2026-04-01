import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/formula')({
  component: FormulaPage,
})

function FormulaPage() {
  return (
    <div className="bg-bg flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-body text-text-primary text-heading">Formula</h1>
    </div>
  )
}
