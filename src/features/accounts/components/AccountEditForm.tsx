import SubmitButton from '@/components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Camera, User } from 'lucide-react'
import React, { useState } from 'react'

export default function AccountEditForm() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image size must be under 2MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    // Here you would save the profile data
    console.log('Saving profile changes...')
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Profile Photo Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profilePhoto || undefined} alt="Profile photo" />
              <AvatarFallback className="text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <label htmlFor="photo-upload">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </span>
                </Button>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <p className="text-xs text-gray-500">Max 2MB, JPG/PNG only</p>
            </div>
          </div>

          <form className="grid gap-6 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <label htmlFor="name" className="primary">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  className="primary" 
                  placeholder="Enter your full name"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="email" className="primary">Email address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  className="primary" 
                  placeholder="Enter your email"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="phone" className="primary">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  className="primary" 
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="grid gap-1">
                <label htmlFor="role" className="primary">Role/Title</label>
                <input 
                  type="text" 
                  id="role"
                  name="role"
                  className="primary" 
                  placeholder="e.g. CEO, Manager, Director"
                />
              </div>
              <div className="grid gap-1 md:col-span-2">
                <label htmlFor="company" className="primary">Company Name</label>
                <input 
                  type="text" 
                  id="company"
                  name="company"
                  className="primary" 
                  placeholder="Enter your company name"
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-4">Change Password</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <label htmlFor="password" className="primary">New Password</label>
                  <input 
                    type="password" 
                    id="password"
                    name="password"
                    className="primary" 
                    placeholder="Enter new password"
                  />
                </div>
                <div className="grid gap-1">
                  <label htmlFor="password2" className="primary">Confirm Password</label>
                  <input 
                    type="password" 
                    id="password2"
                    name="password2"
                    className="primary" 
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <SubmitButton onClick={handleSave}>Save Changes</SubmitButton>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
