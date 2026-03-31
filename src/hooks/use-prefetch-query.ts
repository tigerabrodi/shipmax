import type { FunctionReference } from 'convex/server'
import { useConvex } from 'convex/react'
import { useEffect } from 'react'

export function usePrefetchQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: Query['_args'] | 'skip'
) {
  const convex = useConvex()
  const argsKey = JSON.stringify(args)

  useEffect(() => {
    if (argsKey === '"skip"') return

    const parsedArgs = JSON.parse(argsKey) as Query['_args']
    const watch = convex.watchQuery(query, parsedArgs)
    const unsubscribe = watch.onUpdate(() => {})
    let hasCleanedUp = false

    function cleanupWatch() {
      if (hasCleanedUp) {
        return
      }

      hasCleanedUp = true
      unsubscribe()
    }

    const timeout = setTimeout(cleanupWatch, 20000)
    return () => {
      clearTimeout(timeout)
      cleanupWatch()
    }
  }, [convex, query, argsKey])
}
