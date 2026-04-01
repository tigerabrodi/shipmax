function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-caption font-semibold tracking-[2px] text-[#93C5FD99] uppercase">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-6">{children}</div>
    </div>
  )
}

function StateLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-caption text-text-dim" />
    </div>
  )
}

export { Section, StateLabel }
