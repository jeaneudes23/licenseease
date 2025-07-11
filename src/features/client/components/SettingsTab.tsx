"use client"

import React, { useState } from 'react'
import { Eye, EyeOff, Save, Bell, Globe, Moon, Sun } from 'lucide-react'

interface SettingsTabProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  language: string
  onLanguageChange: (lang: string) => void
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  onNotificationChange: (type: string, enabled: boolean) => void
}

export default function SettingsTab({
  darkMode,
  onToggleDarkMode,
  language,
  onLanguageChange,
  notifications,
  onNotificationChange
}: SettingsTabProps) {
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

    try {
      // Here you would typically call your backend API
      // For now, we'll just show a success message
      setPasswordMessage('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setPasswordMessage('Failed to update password')
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className='px-6 py-4'>
      <h2 className='text-2xl font-bold mb-6'>Settings</h2>
      
      <div className='space-y-8'>
        {/* Change Password Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Eye className='size-5' />
            Change Password
          </h3>
          
          <form onSubmit={handlePasswordChange} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Current Password</label>
              <div className='relative'>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('current')}
                  className='absolute right-2 top-2 text-gray-500 hover:text-gray-700'
                >
                  {showPasswords.current ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
                </button>
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium mb-1'>New Password</label>
              <div className='relative'>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('new')}
                  className='absolute right-2 top-2 text-gray-500 hover:text-gray-700'
                >
                  {showPasswords.new ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
                </button>
              </div>
            </div>
            
            <div>
              <label className='block text-sm font-medium mb-1'>Confirm New Password</label>
              <div className='relative'>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => togglePasswordVisibility('confirm')}
                  className='absolute right-2 top-2 text-gray-500 hover:text-gray-700'
                >
                  {showPasswords.confirm ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
                </button>
              </div>
            </div>
            
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {passwordMessage}
              </p>
            )}
            
            <button
              type='submit'
              className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
            >
              <Save className='size-4' />
              Update Password
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Bell className='size-5' />
            Notification Preferences
          </h3>
          
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <label className='font-medium'>Email Notifications</label>
                <p className='text-sm text-muted-foreground'>Receive updates via email</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={notifications.email}
                  onChange={(e) => onNotificationChange('email', e.target.checked)}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600'></div>
              </label>
            </div>
            
            <div className='flex items-center justify-between'>
              <div>
                <label className='font-medium'>SMS Notifications</label>
                <p className='text-sm text-muted-foreground'>Receive updates via SMS</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={notifications.sms}
                  onChange={(e) => onNotificationChange('sms', e.target.checked)}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600'></div>
              </label>
            </div>
            
            <div className='flex items-center justify-between'>
              <div>
                <label className='font-medium'>Push Notifications</label>
                <p className='text-sm text-muted-foreground'>Receive browser notifications</p>
              </div>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={notifications.push}
                  onChange={(e) => onNotificationChange('push', e.target.checked)}
                  className='sr-only peer'
                />
                <div className='w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600'></div>
              </label>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Globe className='size-5' />
            Language Settings
          </h3>
          
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Preferred Language</label>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              >
                <option value='en'>English</option>
                <option value='rw'>Kinyarwanda</option>
                <option value='fr'>French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            {darkMode ? <Moon className='size-5' /> : <Sun className='size-5' />}
            Theme Settings
          </h3>
          
          <div className='flex items-center justify-between'>
            <div>
              <label className='font-medium'>Dark Mode</label>
              <p className='text-sm text-muted-foreground'>Switch between light and dark themes</p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className='relative inline-flex items-center cursor-pointer'
            >
              <div className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-200'}`}>
                <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${darkMode ? 'translate-x-full' : 'translate-x-0'}`}></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
