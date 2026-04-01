import { Input } from '@/components/input'
import { Section, StateLabel } from './section'

function InputShowcase() {
  return (
    <Section title="Input Field">
      <StateLabel>
        <Input placeholder="GitHub username..." className="w-70" />
      </StateLabel>
      <StateLabel>
        <Input
          placeholder="GitHub username..."
          value="torvalds"
          readOnly
          className="w-70"
        />
      </StateLabel>
      <StateLabel>
        <Input
          placeholder="GitHub username..."
          value="xzz_notfound"
          error
          readOnly
          className="w-70"
        />
      </StateLabel>
    </Section>
  )
}

export { InputShowcase }
