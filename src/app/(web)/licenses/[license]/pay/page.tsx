import SubmitButton from '@/components/SubmitButton'
import { licenseCategories } from '@/features/licenses/schema/licenseSchema'
import React from 'react'

interface Props {
  params: {
    license: string,
  }
  searchParams: {
    type: string
  }
}

const validTypes = ['first-time-application-fee', 'first-time-license-fee']

export default function page({ params, searchParams }: Props) {
  if (!validTypes.includes(searchParams.type)) return (
    <div className='container py-12 text-center'>
      <h1 className='text-2xl text-destructive font-semibold'>Error parsing payment type</h1>
    </div>
  )
  const paymentType = searchParams.type.replaceAll('-',' ')
  const license = licenseCategories.flatMap(category => category.licenses).find(license => license.id.toString() === params.license)
  if (!license) return "Not found"
  return (
    <div className='container py-12 space-y-12'>
      <div className='grid gap-4 max-w-lg mx-auto text-center  capitalize'>
        <h2 className='text-2xl text-balance font-bold'>{license.name}</h2>
        <p className='text-2xl font-semibold text-primary'>{paymentType}</p>
      </div>
      <div className='max-w-md mx-auto '>
        <div className='grid gap-2'>
          <h3 className='font-medium'>Pay with mobile money</h3>
          <form action="" className='flex items-center gap-4 text-sm'>
            <input type="text" placeholder='Phone Number' className='primary w-full max-w-md' />
            <SubmitButton className='flex-grow'>Pay</SubmitButton>
          </form>
        </div>
        <div className='flex items-center gap-2 py-6 font-medium text-sm'><span className='flex-grow border-t-2'></span>Or<span className='flex-grow border-t-2'></span></div>
        <div className='grid'>
          <SubmitButton variant={'accent'}>Pay with Card</SubmitButton>
        </div>
      </div>
    </div>
  )
}
