// ─────────────────────────────────────────────────────────────────
// src/features/licenses/components/LicensesAccordion.tsx
// ─────────────────────────────────────────────────────────────────

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

type License = {
  id: number
  name: string
  application_requirements: string[]
  renewal_requirements: string[]
  first_time_application_fee: string
  renewal_application_fee: string
  first_time_license_fee: string
  renewal_license_fee: string
  validity: string
  processing_time: string
}

type Category = {
  name: string
  licenses: License[]
}

export default function LicensesAccordion() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Try to load cached data from localStorage
    const cached = window.localStorage.getItem('services')
    if (cached) {
      try {
        const parsed: Category[] = JSON.parse(cached)
        setCategories(parsed)
        setLoading(false)
      } catch {
        // If parsing fails, clear the invalid cache
        window.localStorage.removeItem('services')
      }
    }

    // Always fetch fresh data to update both state and localStorage
    async function fetchServices() {
      // If there was no valid cache, show loading until fetch completes
      if (!cached) {
        setLoading(true)
      }
      setError('')

      try {
        const res = await fetch('http://127.0.0.1:5000/get_services')
        if (!res.ok) {
          throw new Error(`Failed to fetch, status ${res.status}`)
        }
        const data: Category[] = await res.json()

        setCategories(data)
        window.localStorage.setItem('services', JSON.stringify(data))
      } catch (err) {
        console.error(err)
        setError('Failed to load license categories.')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return <p className="text-center py-4">Loading license categories…</p>
  }

  if (error) {
    return <p className="text-red-500 text-center py-4">{error}</p>
  }

  return (
    <div className="grid gap-3">
      {categories.map((category, catIdx) => (
        <div key={catIdx} className="capitalize border rounded-t-md">
          <div className="bg-primary/10 text-primary p-3 rounded-t-[inherit] font-semibold">
            <h3>{category.name}</h3>
          </div>
          <div className="divide-y">
            {category.licenses.map((license) => (
              <Link
                href={`/licenses/${license.id}`}
                key={license.id}
                className="p-2 text-sm flex justify-between hover:bg-primary/5 transition-all"
              >
                {license.name}
                <ChevronRight className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
