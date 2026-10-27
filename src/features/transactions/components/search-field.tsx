import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type SearchFieldProps = {
  initialText: string
  onSearch: (text: string) => void
}

export function SearchField({ initialText, onSearch }: SearchFieldProps) {
  const [text, setText] = useState(initialText)

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="transaction-search">Search descriptions</Label>
      <Input
        id="transaction-search"
        type="search"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          onSearch(event.target.value)
        }}
      />
    </div>
  )
}
