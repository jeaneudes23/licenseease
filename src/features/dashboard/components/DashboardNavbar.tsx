import { LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function DashboardNavbar() {
  return (
    <nav>
      <div className='px-4 flex justify-between py-6'>
        <div></div>
        <div>
          {/* Search Bar */}
          <div className='relative'>
            <button className='size-10 border-2 rounded-full grid place-content-center border-primary text-primary cursor-pointer peer'>
              <User className='size-6'/>
            </button>
            <div className='absolute bg-white py-2 rounded-md shadow-lg right-0 top-12 whitespace-pre text-sm w-44 opacity-0 transition-all peer-focus-within:opacity-100 pointer-events-none peer-focus-within:pointer-events-auto'>
              <Link href={'/admin/profile'} className='flex items-center gap-2 justify-between font-medium hover:bg-muted transition-all px-4 py-2'>John Doe <Settings className='size-4'/></Link>
              <Link href={'/Logout'} className='flex items-center gap-2 justify-between font-medium hover:bg-muted transition-all px-4 py-2'>Logout <LogOut className='size-4'/></Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
