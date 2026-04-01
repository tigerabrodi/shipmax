import { LeaderboardCard, type Rank } from '@/components/leaderboard-card'
import { Section } from './section'

const DUMMY_AVATAR = 'https://avatars.githubusercontent.com/u/1024025?v=4'

const ALL_RANKS: Array<{ username: string; rank: Rank }> = [
  { username: 'torvalds', rank: 'S' },
  { username: 'sindresorhus', rank: 'A' },
  { username: 'gaearon', rank: 'B' },
  { username: 'kentcdodds', rank: 'C' },
  { username: 'somedev', rank: 'D' },
  { username: 'newbie123', rank: 'E' },
]

function LeaderboardCardShowcase() {
  return (
    <Section title="Leaderboard Card">
      <div className="flex flex-wrap items-center gap-3">
        {ALL_RANKS.map(({ username, rank }) => (
          <LeaderboardCard
            key={username}
            avatarUrl={DUMMY_AVATAR}
            username={username}
            rank={rank}
          />
        ))}
      </div>
    </Section>
  )
}

export { LeaderboardCardShowcase }
