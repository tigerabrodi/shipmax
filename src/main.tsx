import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import './app.css'
import { routeTree } from './routeTree.gen'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const root = document.getElementById('root')!
ReactDOM.createRoot(root).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <RouterProvider router={router} />
      <Analytics />
    </ConvexProvider>
  </StrictMode>
)
