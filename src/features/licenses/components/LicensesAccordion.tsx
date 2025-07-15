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
        const res = await fetch('http://127.0.0.1:5000/get_services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!res.ok) {
          throw new Error(`Failed to fetch, status ${res.status}`)
        }
        
        const data: Category[] = await res.json()

        // Validate response structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format')
        }

        setCategories(data)
        window.localStorage.setItem('services', JSON.stringify(data))
      } catch (err) {
        console.error('Service fetch error:', err)
        // If there's cached data, use it instead of showing error
        if (cached) {
          try {
            const parsed: Category[] = JSON.parse(cached)
            setCategories(parsed)
          } catch {
            setError('Failed to load license categories. Please check your connection.')
          }
        } else {
          setError('Failed to load license categories. Please check your connection.')
        }
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

  if (categories.length === 0) {
    return <p className="text-center py-4 text-gray-500">No license categories available.</p>
  }

  return (
    <div className="grid gap-3">
      {categories.map((category, catIdx) => (
        <div key={catIdx} className="capitalize border rounded-t-md">
          <div className="bg-primary/10 text-primary p-3 rounded-t-[inherit] font-semibold">
            <h3>{category.name}</h3>
          </div>
          <div className="divide-y">
            {category.licenses && category.licenses.length > 0 ? (
              category.licenses.map((license) => (
                <div
                  key={license.id}
                  className="p-3 text-sm hover:bg-primary/5 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{license.name}</h4>
                    <Link
                      href={`/licenses/${license.id}`}
                      className="text-xs text-primary underline hover:text-primary/80"
                    >
                      Apply
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <div>App Fee: ${license.first_time_application_fee}</div>
                    <div>License Fee: ${license.first_time_license_fee}</div>
                    <div>Validity: {license.validity} years</div>
                    <div>Processing: {license.processing_time} days</div>
                  </div>
                  
                  <div className="text-xs">
                    <div className="mb-1">
                      <span className="font-medium">Application Requirements:</span>
                      <ul className="list-disc list-inside ml-2 text-gray-600">
                        {license.application_requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                        {license.application_requirements.length > 3 && (
                          <li>+{license.application_requirements.length - 3} more...</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500">No licenses available in this category</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
