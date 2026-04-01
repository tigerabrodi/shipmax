import { Button } from '@/components/button'
import { XIcon } from '@/components/icons/x-icon'
import { Section, StateLabel } from './section'

function ButtonsShowcase() {
  return (
    <>
      <Section title="Primary Button">
        <StateLabel>
          <Button>ANALYZE</Button>
        </StateLabel>
        <StateLabel>
          <Button disabled>ANALYZE</Button>
        </StateLabel>
      </Section>

      <Section title="Secondary Button">
        <StateLabel>
          <Button variant="secondary" icon={<XIcon />}>
            SHARE ON X
          </Button>
        </StateLabel>
        <StateLabel>
          <Button variant="secondary" icon={<XIcon />} disabled>
            SHARE ON X
          </Button>
        </StateLabel>
      </Section>

      <Section title="Ghost Button">
        <StateLabel>
          <Button variant="ghost">DOWNLOAD IMAGE</Button>
        </StateLabel>
        <StateLabel>
          <Button variant="ghost" disabled>
            DOWNLOAD IMAGE
          </Button>
        </StateLabel>
      </Section>
    </>
  )
}

export { ButtonsShowcase }
