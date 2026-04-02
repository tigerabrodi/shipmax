import { rankValidator } from '../../../convex/schema'
import { type Infer, v } from 'convex/values'

type LeaderboardRank = Infer<typeof rankValidator>

type LeaderboardSourceUser = {
  avatarUrl: string
  username: string
  rank: LeaderboardRank
  score: number
}

const leaderboardEntryValidator = v.object({
  position: v.number(),
  avatarUrl: v.string(),
  username: v.string(),
  rank: rankValidator,
  score: v.number(),
})

type LeaderboardEntry = Infer<typeof leaderboardEntryValidator>

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
  leaderboardEntryValidator,
}
export type { LeaderboardEntry, LeaderboardRank, LeaderboardSourceUser }
