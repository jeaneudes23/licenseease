import { User, Settings, LogOut, Moon, Sun } from 'lucide-react'
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
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className='size-10 border-2 rounded-full grid place-content-center border-primary text-primary cursor-pointer hover:bg-primary/10 transition-all'
          >
            {darkMode ? <Sun className='size-5'/> : <Moon className='size-5'/>}
          </button>
          
          {/* User Profile Dropdown */}
          <div className='relative group'>
            <button className='size-10 border-2 rounded-full grid place-content-center border-primary text-primary cursor-pointer peer overflow-hidden'>
              {userProfile.profilePicture ? (
                <img src={userProfile.profilePicture} alt="Profile" className='w-full h-full object-cover' />
              ) : (
                <User className='size-6'/>
              )}
            </button>
            <div className='absolute bg-white py-2 rounded-md shadow-lg right-0 top-12 whitespace-pre text-sm w-44 opacity-0 transition-all group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto'>
              <div className='flex items-center gap-2 justify-between font-medium px-4 py-2'>
                <span className='text-muted-foreground'>{userProfile.name}</span>
                <Settings className='size-4'/>
              </div>
              <button 
                onClick={onLogout}
                className='flex items-center gap-2 justify-between font-medium hover:bg-muted transition-all px-4 py-2 w-full text-left'
              >
                Logout <LogOut className='size-4'/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
