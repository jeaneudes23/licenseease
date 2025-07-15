'use client'

import React, { useState, useEffect } from 'react'
import SubmitButton from '@/components/SubmitButton'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RemoveFileDialog from '@/features/files/components/RemoveFileDialog'
import UploadFileDialog from '@/features/files/components/UploadFileDialog'
import { Download } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: {
    license: string
  }
}

type License = {
  id: string
  name: string
  application_requirements: string[]
  first_time_application_fee: number
  first_time_license_fee: number
}

type Category = {
  name: string
  licenses: License[]
}

type UploadedFile = {
  name: string
  file: File
  url?: string
}

export default function ApplyPage({ params }: Props) {
  const [license, setLicense] = useState<License | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const saved = window.localStorage.getItem('services')
    if (!saved) {
      setLicense(null)
      setLoading(false)
      return
    }

    try {
      const categories: Category[] = JSON.parse(saved)
      const allLicenses = categories.flatMap((cat) => cat.licenses)
      const found = allLicenses.find(
        (lic) => lic.id.toString() === params.license
      )
      setLicense(found ?? null)
    } catch (e) {
      console.error('Failed to parse services from localStorage', e)
      setLicense(null)
    } finally {
      setLoading(false)
    }
  }, [params.license])

  const handleFileUpload = (documentName: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentName]: {
        name: file.name,
        file: file
      }
    }))
  }

  const handleFileRemove = (documentName: string) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[documentName]
      return newFiles
    })
  }

  const handleSubmitApplication = async () => {
    if (!license) return
    
    setIsSubmitting(true)
    try {
      // For now, just log the submission - you can integrate with your backend later
      console.log('Submitting application for:', license.name)
      console.log('Uploaded files:', uploadedFiles)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Failed to submit application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const allRequiredFilesUploaded = license?.application_requirements.every(
    req => uploadedFiles[req]
  ) ?? false

  if (loading) {
    return <p className="text-center py-4">Loading…</p>
  }

  if (!license) {
    return <p className="text-center py-4">Not found</p>
  }

  return (
    <main>
      <div className="bg-primary text-primary-foreground">
        <div className="container py-12">
          <div className="grid gap-2">
            <h2 className="text-3xl font-bold capitalize text-center">
              {license.name} <br /> License Application
            </h2>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto py-12 space-y-12">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Document Upload</CardTitle>
              <SubmitButton 
                disabled={!allRequiredFilesUploaded || isSubmitting}
                onClick={handleSubmitApplication}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </SubmitButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <p className="text-gray-600 mb-4">
                Please upload all required documents. Each file must be under 5MB and in PDF, PNG, or JPG format.
              </p>
              {license.application_requirements.map((req, index) => {
                const isUploaded = uploadedFiles[req]
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center gap-6 p-3 rounded-lg border ${
                      isUploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{req}</p>
                      {isUploaded && (
                        <p className="text-sm text-green-600">
                          ✓ {isUploaded.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isUploaded ? (
                        <UploadFileDialog 
                          documentName={req}
                          onUpload={(file) => handleFileUpload(req, file)}
                        />
                      ) : (
                        <>
                          <RemoveFileDialog 
                            fileName={isUploaded.name}
                            onRemove={() => handleFileRemove(req)}
                          />
                          <Button 
                            className="h-8 w-8 p-0 rounded-full"
                            variant="outline"
                            onClick={() => {
                              // Create download link for the uploaded file
                              const url = URL.createObjectURL(isUploaded.file)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = isUploaded.name
                              link.click()
                              URL.revokeObjectURL(url)
                            }}
                          >
                            <Download className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Application Fee</h3>
              <Link
                className={buttonVariants()}
                href={`pay?type=first-time-application-fee`}
              >
                Pay {license.first_time_application_fee}
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <h3 className="font-medium">License Fee</h3>
              <Link
                className={buttonVariants()}
                href={`pay?type=first-time-license-fee`}
              >
                Pay {license.first_time_license_fee}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
