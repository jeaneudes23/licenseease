"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface Props {
  href: string,
  label: string,
  icon: ReactNode
}
export default function SidebarLink({href,label,icon}: Props) {
  const path = usePathname()
  const active = href === '/admin' ? path === '/admin' : path.startsWith(href)

  return (
    <Link href={href} className={`inline-flex items-center gap-2 p-2 transition-all  ${active ? 'bg-gray-100 dark:bg-gray-700 rounded-xl shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl'}`}>
      <span className={`p-1.5 rounded-lg shadow transition-all ${active ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-700 text-primary'}`}>{icon}</span>
      <span className={`capitalize tracking-wide font-semibold transition-all ${active ? 'text-gray-900 dark:text-gray-100' : 'text-muted-foreground'}`}>{label}</span>
    </Link>
  )
}
