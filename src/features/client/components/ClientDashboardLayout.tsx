"use client"

import React, { PropsWithChildren } from 'react'
import ClientSidebar from './ClientSidebar'
import ClientNavbar from './ClientNavbar'

interface ClientDashboardLayoutProps extends PropsWithChildren {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
  userProfile: {
    name: string
    profilePicture?: string
  }
}

export default function ClientDashboardLayout({
  children,
  activeTab,
  onTabChange,
  onLogout,
  darkMode,
  onToggleDarkMode,
  userProfile
}: ClientDashboardLayoutProps) {
  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className='grid grid-cols-[256px,1fr] items-start min-h-screen bg-background text-foreground'>
        <ClientSidebar 
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
        />
        <div className='h-dvh flex flex-col'>
          <ClientNavbar
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            onLogout={onLogout}
            userProfile={userProfile}
          />
          <div className='flex-grow overflow-y-auto pb-12'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
