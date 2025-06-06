'use client'

import React, { useState, useEffect } from 'react'
import SubmitButton from '@/components/SubmitButton'
import TagsInput from '@/components/TagsInput'

type Category = {
  name: string
  licenses: unknown[] // not used here, but required for typing
}

export default function LicenseCreateForm() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const saved = window.localStorage.getItem('services')
    console.log('Loaded "services" from localStorage:', saved)
    if (saved) {
      try {
        const parsed: Category[] = JSON.parse(saved)
        setCategories(parsed)
      } catch (e) {
        console.error('Failed to parse categories from localStorage', e)
        setCategories([])
      }
    }
  }, [])

  return (
    <form className="grid gap-6 text-sm">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="grid gap-1">
          <label htmlFor="category_id" className="primary">
            License Category
          </label>
          <select name="category_id" id="category_id" className="primary">
            {categories.map((category, index) => (
              <option key={index} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label htmlFor="name" className="primary">
            License Name
          </label>
          <input type="text" name="name" className="primary" id="name" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="application_requirements" className="primary">
            Application requirements
          </label>
          <TagsInput name="application_requirements" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="renewal_requirements" className="primary">
            Renewal requirements
          </label>
          <TagsInput name="renewal_requirements" />
        </div>
        <div className="grid gap-1">
          <label
            htmlFor="first_time_application_fee"
            className="primary"
          >
            First time application fee
          </label>
          <input
            type="text"
            name="first_time_application_fee"
            className="primary"
            id="first_time_application_fee"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="first_time_license_fee" className="primary">
            First time license fee
          </label>
          <input
            type="text"
            name="first_time_license_fee"
            className="primary"
            id="first_time_license_fee"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="renewal_application_fee" className="primary">
            Renewal application fee
          </label>
          <input
            type="text"
            name="renewal_application_fee"
            className="primary"
            id="renewal_application_fee"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="renewal_license_fee" className="primary">
            Renewal license fee
          </label>
          <input
            type="text"
            name="renewal_license_fee"
            className="primary"
            id="renewal_license_fee"
          />
        </div>
        <div className="grid gap-1">
          <label htmlFor="validity" className="primary">
            License Validity
          </label>
          <input type="text" name="validity" className="primary" id="validity" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="processing_time" className="primary">
            Processing time
          </label>
          <input
            type="text"
            name="processing_time"
            className="primary"
            id="processing_time"
          />
        </div>
      </div>
      <div>
        <SubmitButton>Create</SubmitButton>
      </div>
    </form>
  )
}
