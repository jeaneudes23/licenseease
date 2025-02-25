import ApplicationLogo from '@/components/ApplicationLogo'
import React from 'react'
import SidebarLink from './SidebarLink'
import { Building, Component, Dock, FileText, GroupIcon, Home, LayoutDashboard, ListCheck, ShieldCheck, UsersRound } from 'lucide-react'

export default function DashboardSidebar() {
  return (
    <aside className='flex flex-col px-4 h-dvh'>
      <div className='py-6'>
        <ApplicationLogo />
      </div>
      <div className='text-sm grid gap-2 overflow-y-auto flex-grow content-start pb-6'>
        <SidebarLink
          href='/admin'
          label='dashboard'
          icon={<Home className='size-5' />}
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
        <p className='font-medium mt-4 border-muted-foreground text-muted-foreground border-b'>USERS</p>
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
        <p className='font-medium mt-4 border-muted-foreground text-muted-foreground border-b'>OTHER</p>
        <SidebarLink
          href='/admin/categories'
          label='License categories'
          icon={<Component className='size-5' />}
        />
        <SidebarLink
          href='/admin/companies'
          label='companies'
          icon={<Building className='size-5' />}
        />
      </div>
    </aside>
  )
}
