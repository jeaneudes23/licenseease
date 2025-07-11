"use client"

import { ReactNode } from "react"

interface Props {
  onClick: () => void
  label: string
  icon: ReactNode
  active: boolean
}

export default function ClientSidebarLink({ onClick, label, icon, active }: Props) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 p-2 transition-all w-full ${
        active ? 'bg-white dark:bg-gray-700 rounded-xl shadow-sm' : ''
      }`}
    >
      <span
        className={`p-1.5 rounded-lg shadow transition-all ${
          active ? 'bg-primary text-primary-foreground' : 'bg-white dark:bg-gray-800 text-primary'
        }`}
      >
        {icon}
      </span>
      <span
        className={`capitalize tracking-wide font-semibold transition-all ${
          active ? 'dark:text-gray-100' : 'text-muted-foreground dark:text-gray-300'
        }`}
      >
        {label}
      </span>
    </button>
  )
}
