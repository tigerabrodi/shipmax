function HeroHeader() {
  return (
    <div className="flex flex-col items-center gap-1 pt-12">
      <h1 className="font-display text-display-mobile tracking-[4px] text-[#EFF6FF] md:text-[72px] md:leading-none md:tracking-[8px]">
        SHIPMAX
      </h1>
      <div className="mt-1.5 flex items-center gap-2 md:mt-2.5 md:gap-2.5">
        <div className="h-px w-[30px] bg-gradient-to-r from-transparent to-[rgba(96,165,250,0.5)] md:w-[60px]" />
        <span className="text-[9px] font-medium tracking-[3px] text-[#60A5FA59] md:text-[10px] md:tracking-[4px]">
          RANK PROTOCOL
        </span>
        <div className="h-px w-[30px] bg-gradient-to-l from-transparent to-[rgba(96,165,250,0.5)] md:w-[60px]" />
      </div>
    </div>
  )
}

export { HeroHeader }
