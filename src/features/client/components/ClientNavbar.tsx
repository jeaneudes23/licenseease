import React from 'react'

interface ClientNavbarProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onLogout: () => void
  userProfile: {
    name: string
    profilePicture?: string
  }
}

export default function ClientNavbar({ darkMode, onToggleDarkMode, onLogout, userProfile }: ClientNavbarProps) {
  return (
    <nav>
      <div className='px-4 flex justify-between py-6'>
        <div></div>
        <div className='flex items-center gap-4'>
          {/* Icons removed as requested */}
        </div>
      </div>
    </nav>
  )
}
