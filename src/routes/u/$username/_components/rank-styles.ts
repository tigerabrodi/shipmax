import { type Rank } from '@/components/leaderboard-card'

// RGB values for computing rank-tinted colors at various opacities
const RANK_RGB: Record<Rank, string> = {
  S: '251, 191, 36',
  A: '167, 139, 250',
  B: '59, 130, 246',
  C: '34, 197, 94',
  D: '107, 114, 128',
  E: '239, 68, 68',
}

const RANK_TEXT: Record<Rank, string> = {
  S: 'text-rank-s',
  A: 'text-rank-a',
  B: 'text-rank-b',
  C: 'text-rank-c',
  D: 'text-rank-d',
  E: 'text-rank-e',
}

export { RANK_RGB, RANK_TEXT }
