import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { Input } from '@/components/input'

function SearchSection() {
  const [username, setUsername] = useState('')

  // TODO: Wire up to convex mutation/action to analyze a GitHub user
  function handleAnalyze() {
    if (!username.trim()) return
    // TODO: Navigate to /u/$username or trigger analysis
  }

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
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            className="md:text-body h-[52px] px-4 text-[14px] md:h-14 md:px-5"
          />
        </div>
        <Button onClick={handleAnalyze} className="w-full md:w-auto">
          ANALYZE
        </Button>
      </div>

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
