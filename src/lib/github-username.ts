const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

function normalizeGitHubUsername({ username }: { username: string }): string {
  const trimmedUsername = username.trim()
  const withoutProtocol = trimmedUsername.replace(
    /^https?:\/\/github\.com\//i,
    ''
  )
  const withoutAt = withoutProtocol.replace(/^@/, '')
  const withoutQuery = withoutAt.split(/[?#]/)[0] ?? withoutAt
  const withoutTrailingSlash = withoutQuery.replace(/\/+$/, '')
  const firstSegment = withoutTrailingSlash.split('/')[0]

  return firstSegment?.trim() ?? ''
}

function isValidGitHubUsername({ username }: { username: string }): boolean {
  return GITHUB_USERNAME_PATTERN.test(username)
}

function getGitHubUsernameValidationMessage({
  username,
}: {
  username: string
}): string | null {
  const normalizedUsername = normalizeGitHubUsername({ username })

  if (!normalizedUsername) {
    return 'Enter a GitHub username.'
  }

  if (!isValidGitHubUsername({ username: normalizedUsername })) {
    return 'GitHub usernames can use letters, numbers, and single hyphens only.'
  }

  return null
}

export {
  getGitHubUsernameValidationMessage,
  isValidGitHubUsername,
  normalizeGitHubUsername,
}
