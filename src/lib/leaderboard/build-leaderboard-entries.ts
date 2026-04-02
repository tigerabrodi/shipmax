import { type Rank } from '../../components/leaderboard-card'

type LeaderboardSourceUser = {
  avatarUrl: string
  username: string
  rank: Rank
  score: number
}

type LeaderboardEntry = LeaderboardSourceUser & {
  position: number
}

function compareLeaderboardUsers({
  leftUser,
  rightUser,
}: {
  leftUser: LeaderboardSourceUser
  rightUser: LeaderboardSourceUser
}) {
  if (leftUser.score !== rightUser.score) {
    return rightUser.score - leftUser.score
  }

  return leftUser.username.localeCompare(rightUser.username)
}

function buildLeaderboardEntries({
  users,
}: {
  users: Array<LeaderboardSourceUser>
}): Array<LeaderboardEntry> {
  return [...users]
    .sort((leftUser, rightUser) =>
      compareLeaderboardUsers({
        leftUser,
        rightUser,
      })
    )
    .map((user, index) => ({
      position: index + 1,
      ...user,
    }))
}

export {
  buildLeaderboardEntries,
  compareLeaderboardUsers,
}
export type { LeaderboardEntry, LeaderboardSourceUser }
