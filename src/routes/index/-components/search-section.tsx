import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useState,
} from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import {
  getGitHubUsernameValidationMessage,
  normalizeGitHubUsername,
} from '@/lib/github-username'

function SearchSection() {
  const [username, setUsername] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate({ from: '/' })

  const handleAnalyze = useCallback(() => {
    const validationMessage = getGitHubUsernameValidationMessage({
      username,
    })

    if (validationMessage) {
      setErrorMessage(validationMessage)
      return
    }

    const normalizedUsername = normalizeGitHubUsername({ username })
    setErrorMessage(null)

    void navigate({
      to: '/u/$username',
      params: { username: normalizedUsername },
    })
  }, [navigate, username])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value)

      if (errorMessage) {
        setErrorMessage(null)
      }
    },
    [errorMessage]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleAnalyze()
      }
    },
    [handleAnalyze]
  )

  return (
    <div className="mt-8 flex w-full flex-col items-center gap-3 px-5 md:mt-11 md:gap-4.5 md:px-0">
      <p className="text-center text-[14px] text-[#DBEAFE73] md:text-[16px]">
        Enter a hunter's name to reveal their true power
      </p>

      {/* Desktop: input + button inline. Mobile: stacked */}
      <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:gap-0">
        <div className="md:w-[425px]">
          <Input
            placeholder="GitHub username..."
            value={username}
            error={errorMessage !== null}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="md:text-body h-[52px] px-4 text-[14px] md:h-14 md:px-5"
          />
        </div>
        <Button onClick={handleAnalyze} className="w-full md:w-auto">
          ANALYZE
        </Button>
      </div>

      {errorMessage ? (
        <p className="text-[12px] leading-4 font-medium text-error">
          {errorMessage}
        </p>
      ) : null}

      <Link
        to="/formula"
        className="hover:text-blue-light md:text-small text-[12px] font-medium text-[#60A5FA73] transition-colors duration-150 hover:underline"
      >
        How is my rank calculated?
      </Link>
    </div>
  )
}

export { SearchSection }
