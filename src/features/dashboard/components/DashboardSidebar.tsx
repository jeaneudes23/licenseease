import ApplicationLogo from '@/components/ApplicationLogo'
import React from 'react'
import SidebarLink from './SidebarLink'
import { Dock, GroupIcon, Home, LayoutDashboard, ListCheck, ShieldCheck, UsersRound } from 'lucide-react'

export default function DashboardSidebar() {
  return (
    <aside className='flex flex-col px-4'>
      <div className='py-6'>
        <ApplicationLogo />
      </div>
      <div className='text-sm grid gap-3'>
        <SidebarLink
          href='/admin'
          label='dashboard'
          icon={<Home className='size-5' />}
        />
        <SidebarLink
          href='/admin/categories'
          label='categories'
          icon={<LayoutDashboard className='size-5' />}
        />
        <SidebarLink
          href='/admin/licenses'
          label='licenses'
          icon={<Dock className='size-5' />}
        />
        <SidebarLink
          href='/admin/applications'
          label='applications'
          icon={<ListCheck className='size-5' />}
        />
        <p className='font-medium mt-5 border-muted-foreground text-muted-foreground border-b-2'>USERS</p>
        <SidebarLink
          href='/admin/agents'
          label='agents'
          icon={<ShieldCheck className='size-5' />}
        />
        <SidebarLink
          href='/admin/clients'
          label='clients'
          icon={<UsersRound className='size-5' />}
        />
      </div>
    </aside>
  )
}
