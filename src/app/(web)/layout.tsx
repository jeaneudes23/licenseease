import WebFooter from '@/components/WebFooter'
import WebNavbar from '@/components/WebNavbar'
import React, { PropsWithChildren } from 'react'

export default function WebLayout({ children }: PropsWithChildren) {
  return (
    <>
      <WebNavbar />
      <div className='min-h-screen'>
        {children}
      </div>
      <WebFooter />
    </>
  )
}
