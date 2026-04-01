import { useState } from 'react'
import { Button } from '@/components/button'
import { RiftLoading } from '@/components/rift-loading'
import { Section } from './section'

function RiftLoadingShowcase() {
  const [visible, setVisible] = useState(false)

  return (
    <Section title="Rift Loading (Fullscreen)">
      <Button variant="ghost" onClick={() => setVisible(true)}>
        SHOW RIFT LOADING
      </Button>

      {visible && (
        <div onClick={() => setVisible(false)} className="cursor-pointer">
          <RiftLoading />
        </div>
      )}
    </Section>
  )
}

export { RiftLoadingShowcase }
