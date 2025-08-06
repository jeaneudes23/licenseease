'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, Clock, FileText, Loader2 } from 'lucide-react'

export default function LicenseCards() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('http://127.0.0.1:5002/get_services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`)
        const data = await res.json()
        
        // Validate response structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format')
        }
        
        setCategories(data)
      } catch (err: any) {
        console.error('Service fetch error:', err)
        setError('Unable to load services. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground flex justify-center"><Loader2 className="animate-spin mr-2" /> Loading services...</div>
  }

  if (error) {
    return <p className="text-center text-red-500 py-6">{error}</p>
  }

  return (
    <section className="grid gap-8 py-10">
      {categories.map((category, idx) => (
        <div key={idx} className="border shadow rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4 text-primary">📂 {category.name}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {category.licenses.map((license: any) => (
              <div key={license.id} className="border p-4 rounded-md bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">{license.name}</h4>
                  <Link href={`/licenses/${license.id}`} className="text-xs text-primary underline">View details</Link>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li><FileText className="inline w-4 h-4 mr-1" /> App Fee: {license.first_time_application_fee}</li>
                  <li><FileText className="inline w-4 h-4 mr-1" /> License Fee: {license.first_time_license_fee}</li>
                  <li><Clock className="inline w-4 h-4 mr-1" /> Validity: {license.validity}</li>
                  <li><BadgeCheck className="inline w-4 h-4 mr-1" /> Processing: {license.processing_time}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
