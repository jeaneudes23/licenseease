import SubmitButton from '@/components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

export default function AccountEditForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1">
              <label htmlFor="name" className="primary">Name</label>
              <input type="text" className="primary" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="email" className="primary">Email address</label>
              <input type="email" className="primary" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="password" className="primary">Password</label>
              <input type="password" className="primary" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="password2" className="primary">Confirm password</label>
              <input type="password" className="primary" />
            </div>
          </div>
          <div>
            <SubmitButton>Save Changes</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
