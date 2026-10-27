import { render, screen } from '@testing-library/react'
import { Progress } from './progress'

function renderProgress(value: number) {
  render(<Progress value={value} aria-label="Budget used" />)
  return screen.getByRole('progressbar', { name: 'Budget used' })
}

function getIndicator(progressbar: HTMLElement) {
  return progressbar.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
}

describe('Progress', () => {
  it('reports and draws a value inside the range', () => {
    const progressbar = renderProgress(40)

    expect(progressbar).toHaveAttribute('aria-valuenow', '40')
    expect(getIndicator(progressbar)).toHaveStyle({ transform: 'translateX(-60%)' })
  })

  it('shows a full bar when spending goes over budget', () => {
    const progressbar = renderProgress(120)

    expect(progressbar).toHaveAttribute('aria-valuenow', '100')
    expect(getIndicator(progressbar)).toHaveStyle({ transform: 'translateX(-0%)' })
  })

  it('shows an empty bar for a negative value', () => {
    const progressbar = renderProgress(-10)

    expect(progressbar).toHaveAttribute('aria-valuenow', '0')
    expect(getIndicator(progressbar)).toHaveStyle({ transform: 'translateX(-100%)' })
  })
})
