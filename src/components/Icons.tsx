type IconProps = { size?: number; strokeWidth?: number }

export function CheckIcon({ size = 16, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FlameIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1 3-3 4-3 8a3 3 0 006 0c1.5 1 2.5 2.8 2.5 4.7A5.5 5.5 0 016.5 16C6.5 10 12 8 12 2z"
        fill="currentColor"
      />
    </svg>
  )
}

export function RunIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="15.5" cy="4.5" r="2" fill="currentColor" />
      <path
        d="M4 20l4-3 2.5-2-1-4 3 1 2 3 4 1.5M9 13l2-4 3-2 3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon({ size = 24, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

export function GearIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 13a1.7 1.7 0 000-2l1.1-1.6-1.5-2.6-1.9.5a1.7 1.7 0 00-1.7-1l-.6-1.9H11.2l-.6 1.9a1.7 1.7 0 00-1.7 1l-1.9-.5-1.5 2.6L6.6 11a1.7 1.7 0 000 2l-1.1 1.6 1.5 2.6 1.9-.5a1.7 1.7 0 001.7 1l.6 1.9h2.6l.6-1.9a1.7 1.7 0 001.7-1l1.9.5 1.5-2.6L19.4 13z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CloseIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
