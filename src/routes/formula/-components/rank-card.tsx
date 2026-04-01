type RankCardProps = {
  letter: string
  range: string
  mobileRange?: string
  title?: string
  color: string
  bgColor: string
  borderColor: string
  rangeColor: string
}

function RankCard({
  letter,
  range,
  mobileRange,
  title,
  color,
  bgColor,
  borderColor,
  rangeColor,
}: RankCardProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center gap-0.5 border px-1 py-3 md:gap-1 md:px-2 md:py-4"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <span
        className="text-[22px] leading-[28px] font-bold md:text-[28px] md:leading-[34px]"
        style={{ color }}
      >
        {letter}
      </span>
      {mobileRange ? (
        <>
          <span
            className="text-[9px] leading-[12px] font-semibold md:hidden"
            style={{ color: rangeColor }}
          >
            {mobileRange}
          </span>
          <span
            className="hidden text-[10px] leading-[12px] font-semibold md:block"
            style={{ color: rangeColor }}
          >
            {range}
          </span>
        </>
      ) : (
        <span
          className="text-[9px] leading-[12px] font-semibold md:text-[10px]"
          style={{ color: rangeColor }}
        >
          {range}
        </span>
      )}
      {title && (
        <span className="hidden text-[9px] leading-[12px] font-medium text-[#DBEAFE4D] md:block">
          {title}
        </span>
      )}
    </div>
  )
}

export { RankCard, type RankCardProps }
