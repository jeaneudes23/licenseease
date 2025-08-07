'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Save, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordMessage, setPasswordMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      // Here you would typically call your backend API
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://127.0.0.1:5002/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setPasswordMessage('Password updated successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => {
          router.push('/client-dashboard')
        }, 2000)
      } else {
        const error = await response.json()
        setPasswordMessage(error.message || 'Failed to update password')
      }
    } catch (error) {
      setPasswordMessage('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8'>
        <div className='flex items-center mb-6'>
          <button
            onClick={handleBack}
            className='mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
          >
            <ArrowLeft className='size-5' />
          </button>
          <h1 className='text-2xl font-bold'>Change Password</h1>
        </div>
        
        <form onSubmit={handlePasswordChange} className='space-y-6'>
          <div>
            <label className='block text-sm font-medium mb-2'>Current Password</label>
            <div className='relative'>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10'
                required
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('current')}
                className='absolute right-3 top-3 text-gray-500 hover:text-gray-700'
              >
                {showPasswords.current ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
              </button>
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium mb-2'>New Password</label>
            <div className='relative'>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10'
                required
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('new')}
                className='absolute right-3 top-3 text-gray-500 hover:text-gray-700'
              >
                {showPasswords.new ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
              </button>
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium mb-2'>Confirm New Password</label>
            <div className='relative'>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className='w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10'
                required
              />
              <button
                type='button'
                onClick={() => togglePasswordVisibility('confirm')}
                className='absolute right-3 top-3 text-gray-500 hover:text-gray-700'
              >
                {showPasswords.confirm ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
              </button>
            </div>
          </div>
          
          {passwordMessage && (
            <div className={`p-3 rounded-md text-sm ${
              passwordMessage.includes('successfully') 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100' 
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100'
            }`}>
              {passwordMessage}
            </div>
          )}
          
          <button
            type='submit'
            disabled={isLoading}
            className='w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Updating...
              </>
            ) : (
              <>
                <Save className='size-4' />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
