import { Toaster as SonnerToaster } from 'sonner'

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      fill="none"
      height="18"
      viewBox="0 0 18 18"
      width="18"
    >
      <circle
        cx="9"
        cy="9"
        r="7"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="var(--color-blue)"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      visibleToasts={5}
      gap={8}
      icons={{ loading: <LoadingSpinner /> }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex items-center gap-3 w-[356px] border border-border-subtle bg-bg px-4 py-3.5 shadow-lg font-body',
          title: 'text-[13px] font-semibold text-text-primary',
          description: 'text-[11px] text-text-dim',
          actionButton:
            'text-[11px] font-semibold px-3 py-1.5 bg-blue/15 text-blue-light hover:bg-blue/25 transition-colors',
          cancelButton:
            'text-[11px] font-medium text-text-dim hover:text-text-secondary transition-colors',
          closeButton:
            'text-text-dim hover:text-text-secondary transition-colors',
          success:
            'border-l-[3px] !border-l-rank-c [&_[data-icon]]:text-rank-c',
          info: 'border-l-[3px] !border-l-blue [&_[data-icon]]:text-blue',
          error:
            'border-l-[3px] !border-l-rank-e [&_[data-icon]]:text-rank-e',
        },
      }}
    />
  )
}
