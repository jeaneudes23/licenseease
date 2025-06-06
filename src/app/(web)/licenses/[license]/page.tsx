'use client'

import React, { useState, useEffect } from 'react'
import TitleCount from '@/features/licenses/components/TitleCount'
import Link from 'next/link'

type License = {
  id: string
  name: string
  application_requirements: string[]
  renewal_requirements: string[]
  first_time_application_fee: number
  renewal_application_fee: number
  first_time_license_fee: number
  renewal_license_fee: number
  validity: number
  processing_time: number
}

type Category = {
  name: string
  licenses: License[]
}

interface Props {
  params: {
    license: string
  }
}

export default function page({ params }: Props) {
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
        <div className="container py-12 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold capitalize">
              {license.name}
            </h2>
          </div>
          <div>
            <Link
              href={`/licenses/${license.id}/apply`}
              className="px-8 text-sm py-2 rounded font-medium tracking-wide bg-accent text-accent-foreground"
            >
              Apply
            </Link>
          </div>
        </div>
      </div>
      <div className="container py-12">
        <div className="grid grid-cols-4 gap-6 items-start">
          <div className="text-sm grid gap-4">
            <div className="grid gap-4">
              <TitleCount count={1} />
              <h3 className="text-primary font-medium text-center">
                Required documents for your application
              </h3>
            </div>
            <div className="grid gap-2">
              <h4 className="font-medium">First time application</h4>
              <ul className="list-disc list-inside grid gap-1">
                {license.application_requirements.map((req, index) => (
                  <li className="text-muted-foreground text-xs" key={index}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2">
              <h4 className="font-medium">Renewal</h4>
              <ul className="list-disc list-inside grid gap-1">
                {license.renewal_requirements.map((req, index) => (
                  <li className="text-muted-foreground text-xs" key={index}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-sm grid gap-4">
            <div className="grid gap-4">
              <TitleCount count={2} />
              <h3 className="text-primary font-medium text-center">
                Payable fee for the license
              </h3>
            </div>
            <div className="grid gap-2">
              <h4 className="font-medium">First time application</h4>
              <ul className="list-disc list-inside grid gap-1">
                <li className="text-muted-foreground text-xs">
                  Application fee: {license.first_time_application_fee} USD
                </li>
                <li className="text-muted-foreground text-xs">
                  License fee: {license.first_time_license_fee} USD
                </li>
              </ul>
            </div>
            <div className="grid gap-2">
              <h4 className="font-medium">Renewal</h4>
              <ul className="list-disc list-inside grid gap-1">
                <li className="text-muted-foreground text-xs">
                  Application fee: {license.renewal_application_fee} USD
                </li>
                <li className="text-muted-foreground text-xs">
                  License fee: {license.renewal_license_fee} USD
                </li>
              </ul>
            </div>
          </div>
          <div className="text-sm grid gap-4">
            <div className="grid gap-4">
              <TitleCount count={3} />
              <h3 className="text-primary font-medium text-center">
                License validity
              </h3>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-md grid gap-2 text-center text-primary w-full max-w-44 border mx-auto">
              <span className="text-6xl font-bold">{license.validity}</span>
              <span>Years</span>
            </div>
          </div>
          <div className="text-sm grid gap-4">
            <div className="grid gap-4">
              <TitleCount count={4} />
              <h3 className="text-primary font-medium text-center">
                Processing Time
              </h3>
            </div>
            <div className="p-6 bg-white shadow-lg rounded-md grid gap-2 text-center text-primary w-full max-w-44 border mx-auto">
              <span className="text-6xl font-bold">
                {license.processing_time}
              </span>
              <span>Days</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
