/**
 * HUD-style decorative frame elements.
 * Desktop only — hidden on mobile.
 */

function TopOrnament() {
  return (
    <div className="pointer-events-none absolute top-[18px] left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
      <div className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(96,165,250,0.3)]" />
      <div className="size-1.5 rotate-45 border border-[rgba(96,165,250,0.3)]" />
      <div className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(96,165,250,0.3)]" />
      <div className="size-1.5 rotate-45 border border-[rgba(96,165,250,0.3)]" />
      <div className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(96,165,250,0.3)]" />
    </div>
  )
}

type StatusBarProps = {
  totalRanked: number
}

function StatusBar({ totalRanked }: StatusBarProps) {
  return (
    <div className="pointer-events-none absolute bottom-7 left-10 hidden items-center gap-3 md:flex">
      <div className="bg-blue size-1.5" />
      <span className="text-micro font-medium tracking-[2px] text-[#60A5FA40]">
        SYSTEM.READY
      </span>
      <div className="h-px w-[30px] bg-[rgba(96,165,250,0.15)]" />
      <span className="text-micro font-medium text-[#60A5FA33]">
        {totalRanked.toLocaleString()} RANKED
      </span>
    </div>
  )
}

function BottomRightTicks() {
  return (
    <div className="pointer-events-none absolute right-10 bottom-7 hidden items-center gap-1 md:flex">
      <div className="h-0.5 w-3 bg-[rgba(96,165,250,0.15)]" />
      <div className="h-0.5 w-3 bg-[rgba(96,165,250,0.15)]" />
      <div className="h-0.5 w-3 bg-[rgba(96,165,250,0.15)]" />
    </div>
  )
}

type FrameDecorationProps = {
  totalRanked: number
}

function FrameDecoration({ totalRanked }: FrameDecorationProps) {
  return (
    <>
      {/* Double border frame */}
      <div className="pointer-events-none absolute inset-5 hidden border border-[rgba(59,130,246,0.2)] md:block" />
      <div className="pointer-events-none absolute inset-[22px] hidden border border-[rgba(59,130,246,0.1)] md:block" />

      <TopOrnament />
      <StatusBar totalRanked={totalRanked} />
      <BottomRightTicks />
    </>
  )
}

export { FrameDecoration }
