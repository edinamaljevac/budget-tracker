import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

type EmptyMessageProps = {
  title: string
  description: string
}

export function EmptyMessage({ title, description }: EmptyMessageProps) {
  return (
    <Empty className="border border-input/60 py-10">
      <EmptyHeader>
        <EmptyTitle className="text-lg font-semibold">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
