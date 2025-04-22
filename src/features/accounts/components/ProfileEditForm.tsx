import React from 'react'
import SubmitButton from '@/components/SubmitButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COMMUNICATION_LANGUAGES_OPTIONS, COUNTRIES_OPTIONS, LEGAL_TYPE_OPTIONS } from '@/lib/constants'

export default function ProfileEditForm() {
  return (
    <form className="grid gap-6 text-sm p-6 bg-background rounded-lg shadow">
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Identification</h3>
        <div className="grid gap-3 md:gap-4 md:grid-cols-6">
          <div className="grid gap-1 col-span-3">
            <label htmlFor="operator_name" className="primary">Operator Name</label>
            <input name="operator_name" id="operator_name" className="primary" />
          </div>
          <div className="grid gap-1 col-span-3">
            <label htmlFor="nationality" className="primary">Nationality</label>
            <select className='primary' name="nationality" id="nationality">
              {COUNTRIES_OPTIONS.map((country, index) =>
                <option value={country} key={index}>{country}</option>
              )}
            </select>
          </div>
          <div className="grid gap-1 col-span-3">
            <label htmlFor="legal_type" className="primary">Legal Type</label>
            <select className='primary' name="legal_type" id="legal_type">
              {LEGAL_TYPE_OPTIONS.map((legal_type, index) =>
                <option value={legal_type} key={index}>{legal_type}</option>
              )}
            </select>
          </div>
          <div className="grid gap-1 col-span-3">
            <label htmlFor="tin_number" className="primary">Tin Number</label>
            <input name="tin_number" id="tin_number" className="primary" />
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="gender" className="primary">Gender</label>
            <select name="gender" id="gender" className="primary">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="address" className="primary">Address</label>
            <input name="address" id="address" className="primary" />
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="po_box" className="primary">P.O Box</label>
            <input name="po_box" id="po_box" className="primary" />
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="fax" className="primary">Fax</label>
            <input name="fax" id="fax" className="primary" />
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="phone_number" className="primary">Phone Number</label>
            <input name="phone_number" id="phone_number" className="primary" />
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="email" className="primary">Email Address</label>
            <input type='email' name="email" id="email" className="primary" />
          </div>
          <div className="grid gap-1 col-span-2">
            <label htmlFor="creation_date" className="primary">Creation date</label>
            <input type='date' name="creation_date" id="creation_date" className="primary" />
          </div>
        </div>
      </div>
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Legal representative</h3>
        <div className="grid gap-3 md:gap-4 md:grid-cols-3">
          <div className="grid gap-1">
            <label htmlFor="names" className="primary">Names</label>
            <input name="names" id="names" className="primary" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="id_passport" className="primary">Id/Passport</label>
            <input name="id_passport" id="id_passport" className="primary" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="telephone" className="primary">Telephone</label>
            <input name="telephone" id="po_box" className="primary" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="email" className="primary">Email Address</label>
            <input type='email' name="email" id="email" className="primary" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="id_document" className="primary">ID Document (ID/Passport/Tin etc..)</label>
            <input type='file' name="id_document" id="id_document" className="primary" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="communication_language" className="primary">Communication Language</label>
            <select className='primary' name="communication_language" id="communication_language">
              {COMMUNICATION_LANGUAGES_OPTIONS.map((country, index) =>
                <option value={country} key={index}>{country}</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div>
        <SubmitButton>Save Changes</SubmitButton>
      </div>
    </form>
  )
}
