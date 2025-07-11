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

export default function ApplyPage({ params }: Props) {
  const [license, setLicense] = useState<License | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

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
              <CardTitle>Document Check</CardTitle>
              <SubmitButton disabled={true}>Submit</SubmitButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid divide-y text-sm">
              {license.application_requirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center gap-6 p-2 ${
                    index % 3 === 0 ? 'bg-destructive/10' : 'bg-accent/10'
                  }`}
                >
                  <p className="line-clamp-1 font-medium">{req}</p>
                  <div className="flex items-center gap-2">
                    {index % 3 === 0 ? (
                      <UploadFileDialog 
                        documentName={req}
                        onUpload={(file) => console.log('Upload file:', file.name, 'for', req)}
                      />
                    ) : (
                      <>
                        <RemoveFileDialog 
                          fileName={req}
                          onRemove={() => console.log('Remove file:', req)}
                        />
                        <Button 
                          className="h-0 p-0 size-8 rounded-full"
                          onClick={() => {
                            // Create a dummy download for demonstration
                            const link = document.createElement('a')
                            link.href = `#download-${req.replace(/\s+/g, '-').toLowerCase()}`
                            link.download = `${req}.pdf`
                            link.click()
                          }}
                        >
                          <Download className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
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
