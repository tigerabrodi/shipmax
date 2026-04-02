import { describe, expect, it } from 'vitest'
import {
  buildLeaderboardEntries,
  type LeaderboardSourceUser,
} from './build-leaderboard-entries'

describe('buildLeaderboardEntries', () => {
  it('sorts users by score descending and assigns positions', () => {
    const users: Array<LeaderboardSourceUser> = [
      {
        avatarUrl: 'https://example.com/c.png',
        username: 'charlie',
        rank: 'B',
        score: 63,
      },
      {
        avatarUrl: 'https://example.com/a.png',
        username: 'alice',
        rank: 'S',
        score: 97,
      },
      {
        avatarUrl: 'https://example.com/b.png',
        username: 'bravo',
        rank: 'A',
        score: 74,
      },
    ]

    expect(buildLeaderboardEntries({ users })).toEqual([
      {
        position: 1,
        avatarUrl: 'https://example.com/a.png',
        username: 'alice',
        rank: 'S',
        score: 97,
      },
      {
        position: 2,
        avatarUrl: 'https://example.com/b.png',
        username: 'bravo',
        rank: 'A',
        score: 74,
      },
      {
        position: 3,
        avatarUrl: 'https://example.com/c.png',
        username: 'charlie',
        rank: 'B',
        score: 63,
      },
    ])
  })

  it('breaks score ties with username ascending', () => {
    const users: Array<LeaderboardSourceUser> = [
      {
        avatarUrl: 'https://example.com/z.png',
        username: 'zeta',
        rank: 'A',
        score: 90,
      },
      {
        avatarUrl: 'https://example.com/a.png',
        username: 'alpha',
        rank: 'A',
        score: 90,
      },
      {
        avatarUrl: 'https://example.com/m.png',
        username: 'mid',
        rank: 'A',
        score: 90,
      },
    ]

    expect(buildLeaderboardEntries({ users })).toEqual([
      {
        position: 1,
        avatarUrl: 'https://example.com/a.png',
        username: 'alpha',
        rank: 'A',
        score: 90,
      },
      {
        position: 2,
        avatarUrl: 'https://example.com/m.png',
        username: 'mid',
        rank: 'A',
        score: 90,
      },
      {
        position: 3,
        avatarUrl: 'https://example.com/z.png',
        username: 'zeta',
        rank: 'A',
        score: 90,
      },
    ])
  })

  it('returns an empty array for empty input', () => {
    expect(buildLeaderboardEntries({ users: [] })).toEqual([])
  })
})
