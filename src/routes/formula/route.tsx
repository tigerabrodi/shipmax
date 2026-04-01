import { createFileRoute, Link } from '@tanstack/react-router'
import './formula.css'
import { FactorCard } from './-components/factor-card'
import { RankCard } from './-components/rank-card'

export const Route = createFileRoute('/formula')({
  component: FormulaPage,
})

const FACTORS = [
  {
    title: 'Consistency',
    percentage: '30%',
    description:
      'How many weeks out of 52 had at least 1 contribution. Rewards showing up regularly over binge-and-ghost patterns.',
    mobileDescription: 'How many weeks out of 52 had at least 1 contribution.',
    scoreRef: '48-52 weeks = 90-100 · 40-47 = 70-89 · 30-39 = 50-69',
    mobileScoreRef: '48-52wk = 90-100 · 40-47 = 70-89',
  },
  {
    title: 'Recent Activity',
    percentage: '25%',
    description:
      'Last 30 days vs your monthly average. Are you ramping up, steady, or falling off?',
    mobileDescription:
      'Last 30 days vs your monthly average. Ramping up or falling off?',
    scoreRef: 'ratio > 1.5 = 80-100 · 1.0-1.5 = 60-79 · 0.5-1.0 = 30-59',
    mobileScoreRef: 'ratio > 1.5 = 80-100 · 1.0-1.5 = 60-79',
  },
  {
    title: 'Volume',
    percentage: '20%',
    description:
      "Total contributions in the last year. 1,500+ maxes this out. That's roughly 4 per day.",
    mobileDescription: 'Total contributions in the year. 1,500+ maxes it out.',
    scoreRef: 'score = min(100, contributions / 1500 × 100)',
  },
  {
    title: 'Stars',
    percentage: '15%',
    description:
      'Total stars across all public repos. Log scaled because stars grow exponentially.',
    mobileDescription: 'Total stars across repos. Log scaled.',
    scoreRef: '10★ ≈ 25 · 100★ ≈ 50 · 1k★ ≈ 75 · 10k+ = 100',
    mobileScoreRef: '10★≈25 · 100★≈50 · 1k★≈75 · 10k+=100',
  },
] as const

const COMMUNITY = {
  title: 'Community Engagement',
  mobileTitle: 'Community',
  percentage: '10%',
  description:
    'PRs opened + issues opened + PR reviews. Shows participation beyond just committing. 300+ total actions maxes this out.',
  mobileDescription: 'PRs + issues + reviews. 300+ maxes it out.',
  fullWidth: true,
} as const

const RANKS = [
  {
    letter: 'S',
    range: '85-100',
    mobileRange: '85+',
    title: 'National Level',
    color: '#FBBF24',
    bgColor: '#FBBF2408',
    borderColor: '#FBBF2426',
    rangeColor: '#FBBF2480',
  },
  {
    letter: 'A',
    range: '70-84',
    title: 'S-Gate Survivor',
    color: '#A78BFA',
    bgColor: '#A78BFA08',
    borderColor: '#A78BFA26',
    rangeColor: '#A78BFA80',
  },
  {
    letter: 'B',
    range: '55-69',
    title: 'B-Rank Hunter',
    color: '#3B82F6',
    bgColor: '#3B82F608',
    borderColor: '#3B82F626',
    rangeColor: '#3B82F680',
  },
  {
    letter: 'C',
    range: '40-54',
    title: 'C-Rank Hunter',
    color: '#22C55E',
    bgColor: '#22C55E08',
    borderColor: '#22C55E26',
    rangeColor: '#22C55E80',
  },
  {
    letter: 'D',
    range: '20-39',
    title: 'E-Gate Fodder',
    color: '#6B7280',
    bgColor: '#6B728008',
    borderColor: '#6B728026',
    rangeColor: '#6B728080',
  },
  {
    letter: 'E',
    range: '0-19',
    title: 'Unawakened',
    color: '#EF4444',
    bgColor: '#EF444408',
    borderColor: '#EF444426',
    rangeColor: '#EF444480',
  },
] as const

function FormulaPage() {
  return (
    <div className="formula-page relative flex min-h-screen flex-col items-center overflow-clip">
      {/* Decorative border — desktop only */}
      <div className="pointer-events-none absolute inset-4 hidden border border-[#3B82F61F] md:block" />

      {/* Header */}
      <div className="relative flex flex-col items-center gap-1 pt-9 md:gap-1.5 md:pt-12">
        <h2 className="font-display text-[16px] leading-[20px] font-bold tracking-[3px] text-[#DBEAFE80] md:text-[20px] md:leading-[24px] md:tracking-[4px]">
          SHIPMAX
        </h2>
        <h1 className="text-[18px] leading-[22px] font-bold tracking-[3px] text-[#DBEAFE] md:text-[32px] md:leading-[40px] md:tracking-[4px]">
          HOW YOUR RANK IS CALCULATED
        </h1>

        {/* Desktop: divider with SYSTEM BLUEPRINT text */}
        <div className="mt-1 hidden items-center gap-[10px] md:flex">
          <div className="formula-line-left h-px w-[50px]" />
          <span className="text-[10px] leading-[12px] font-medium tracking-[4px] text-[#60A5FA4D]">
            SYSTEM BLUEPRINT
          </span>
          <div className="formula-line-right h-px w-[50px]" />
        </div>

        {/* Mobile: centered gradient line */}
        <div className="formula-line-center mt-1 h-px w-[80px] md:hidden" />
      </div>

      {/* Formula equation bar */}
      <div className="mt-5 w-full px-4 md:mt-8 md:w-[800px] md:px-0">
        <div className="border border-[#3B82F626] bg-[#3B82F608] px-4 py-3.5 md:px-8 md:py-5">
          <p className="text-center text-[10px] leading-[160%] font-medium text-[#DBEAFE73] md:hidden">
            Final = Consistency(30%) + Activity(25%) + Volume(20%) + Stars(15%)
            + Community(10%)
          </p>
          <p className="hidden text-center text-[13px] leading-[16px] font-medium tracking-[1px] text-[#DBEAFE80] md:block">
            Final Score = (Consistency × 0.30) + (Activity × 0.25) + (Volume ×
            0.20) + (Stars × 0.15) + (Community × 0.10)
          </p>
        </div>
      </div>

      {/* Factor cards + Community */}
      <div className="mt-4 flex w-full flex-col gap-0.5 px-4 md:mt-6 md:w-[800px] md:flex-row md:flex-wrap md:px-0">
        {FACTORS.map((factor) => (
          <FactorCard key={factor.title} {...factor} />
        ))}
        <FactorCard {...COMMUNITY} />
      </div>

      {/* Rank Thresholds */}
      <div className="mt-6 flex w-full flex-col gap-[10px] px-4 md:mt-8 md:w-[800px] md:gap-3 md:px-0">
        <p className="text-[10px] leading-[12px] font-semibold tracking-[3px] text-[#60A5FA66] md:text-[11px] md:leading-[14px]">
          RANK THRESHOLDS
        </p>
        <div className="flex gap-0.5">
          {RANKS.map((rank) => (
            <RankCard key={rank.letter} {...rank} />
          ))}
        </div>
      </div>

      {/* Back link */}
      <Link
        to="/"
        className="mt-6 pb-12 text-[12px] leading-[16px] font-medium text-[#60A5FA66] md:mt-8 md:pb-16"
      >
        ← Back to home
      </Link>
    </div>
  )
}
