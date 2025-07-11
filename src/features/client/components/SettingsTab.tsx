"use client"

import React, { useState } from 'react'
import { Bell, Globe, Moon, Sun, Key, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getTranslation, Language } from '@/lib/translations'

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
  const router = useRouter()

  const handleChangePassword = () => {
    router.push('/change-password')
  }

  const t = (key: string) => getTranslation(language as Language, key as any)

  return (
    <div className='px-6 py-4'>
      <h2 className='text-2xl font-bold mb-6'>{t('settings')}</h2>
      
      <div className='space-y-8'>
        {/* Change Password Section */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Key className='size-5' />
            {t('security')}
          </h3>
          
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground mb-4'>
                {t('securityDescription')}
              </p>
              <button
                onClick={handleChangePassword}
                className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2'
              >
                <Key className='size-4' />
                {t('changePassword')}
                <ExternalLink className='size-4' />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Bell className='size-5' />
            {t('notificationPreferences')}
          </h3>
          
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <label className='font-medium'>{t('emailNotifications')}</label>
                <p className='text-sm text-muted-foreground'>{t('emailNotificationsDesc')}</p>
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
                <label className='font-medium'>{t('smsNotifications')}</label>
                <p className='text-sm text-muted-foreground'>{t('smsNotificationsDesc')}</p>
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
                <label className='font-medium'>{t('pushNotifications')}</label>
                <p className='text-sm text-muted-foreground'>{t('pushNotificationsDesc')}</p>
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
            {t('languageSettings')}
          </h3>
          
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>{t('preferredLanguage')}</label>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600'
              >
                <option value='en'>{t('english')}</option>
                <option value='rw'>{t('kinyarwanda')}</option>
                <option value='fr'>{t('french')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            {darkMode ? <Moon className='size-5' /> : <Sun className='size-5' />}
            {t('themeSettings')}
          </h3>
          
          <div className='flex items-center justify-between'>
            <div>
              <label className='font-medium'>{t('darkMode')}</label>
              <p className='text-sm text-muted-foreground'>{t('darkModeDesc')}</p>
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
