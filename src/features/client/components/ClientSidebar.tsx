"use client"

import React from 'react'
import { User, LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react'
import ApplicationLogo from '@/components/ApplicationLogo'
import ClientSidebarLink from './ClientSidebarLink'

interface ClientSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export default function ClientSidebar({ activeTab, onTabChange, onLogout }: ClientSidebarProps) {
  return (
    <aside className='flex flex-col px-4 h-dvh'>
      <div className='py-6'>
        <ApplicationLogo />
      </div>
      <div className='text-sm grid gap-2 overflow-y-auto flex-grow content-start pb-6'>
        <ClientSidebarLink
          onClick={() => onTabChange('profile')}
          label='profile'
          icon={<User className='size-5' />}
          active={activeTab === 'profile'}
        />
        <ClientSidebarLink
          onClick={() => onTabChange('dashboard')}
          label='dashboard'
          icon={<LayoutDashboard className='size-5' />}
          active={activeTab === 'dashboard'}
        />
        <ClientSidebarLink
          onClick={() => onTabChange('licenses')}
          label='licenses'
          icon={<FileText className='size-5' />}
          active={activeTab === 'licenses'}
        />
        <ClientSidebarLink
          onClick={() => onTabChange('settings')}
          label='settings'
          icon={<Settings className='size-5' />}
          active={activeTab === 'settings'}
        />
        <div className='mt-8 pt-4 border-t border-muted-foreground dark:border-gray-600'>
          <button
            onClick={onLogout}
            className='inline-flex items-center gap-2 p-2 transition-all hover:bg-white dark:hover:bg-gray-700 rounded-xl shadow-sm w-full'
          >
            <span className='p-1.5 rounded-lg shadow transition-all bg-white dark:bg-gray-800 text-primary'>
              <LogOut className='size-5' />
            </span>
            <span className='capitalize tracking-wide font-semibold transition-all text-muted-foreground dark:text-gray-300'>
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}
