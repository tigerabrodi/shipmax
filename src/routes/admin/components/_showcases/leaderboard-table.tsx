import {
  LeaderboardTable,
  type LeaderboardEntry,
} from '@/components/leaderboard-table'
import { type Rank } from '@/components/leaderboard-card'
import { Section } from './section'

const DUMMY_ENTRIES: Array<LeaderboardEntry> = [
  {
    position: 1,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'torvalds',
    rank: 'S' as Rank,
    score: 97,
  },
  {
    position: 2,
    avatarUrl: 'https://avatars.githubusercontent.com/u/170270?v=4',
    username: 'sindresorhus',
    rank: 'S' as Rank,
    score: 92,
  },
  {
    position: 3,
    avatarUrl: 'https://avatars.githubusercontent.com/u/25254?v=4',
    username: 'tj',
    rank: 'S' as Rank,
    score: 89,
  },
  {
    position: 4,
    avatarUrl: 'https://avatars.githubusercontent.com/u/810438?v=4',
    username: 'gaearon',
    rank: 'A' as Rank,
    score: 78,
  },
  {
    position: 5,
    avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4',
    username: 'shadcn',
    rank: 'A' as Rank,
    score: 74,
  },
  {
    position: 6,
    avatarUrl: 'https://avatars.githubusercontent.com/u/45585937?v=4',
    username: 'tigerabrodi',
    rank: 'B' as Rank,
    score: 63,
  },
  {
    position: 7,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'devhunter99',
    rank: 'C' as Rank,
    score: 48,
  },
  {
    position: 8,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'codejunkie',
    rank: 'D' as Rank,
    score: 31,
  },
  {
    position: 9,
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
    username: 'newdev2026',
    rank: 'E' as Rank,
    score: 12,
  },
]

function LeaderboardTableShowcase() {
  return (
    <Section title="Leaderboard Table">
      <LeaderboardTable entries={DUMMY_ENTRIES} />
    </Section>
  )
}

export { LeaderboardTableShowcase }
