import React from 'react'
import SubmitButton from '@/components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfileEditForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1">
              <label htmlFor="name" className="primary">Gender</label>
              <input type="text" className="primary" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="email" className="primary">Address</label>
              <input type="email" className="primary" />
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
