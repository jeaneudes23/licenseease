import SubmitButton from '@/components/SubmitButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RemoveFileDialog from '@/features/files/components/RemoveFileDialog'
import UploadFileDialog from '@/features/files/components/UploadFileDialog'
import { licenseCategories } from '@/features/licenses/schema/licenseSchema'
import { Download, FileText, Upload, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface Props {
  params: {
    license: string,
  }
}

export default function page({ params }: Props) {
  const license = licenseCategories.flatMap(category => category.licenses).find(license => license.id.toString() === params.license)
  if (!license) return "Not found"
  // Get Auth user application for this license if not create a new one
  // Application HasMany Files 
  // Applications are (drafted,pending,accepted,rejected) client can only once all files are created (where file.url is not null)


  return (
    <main>
      <div className='bg-primary text-primary-foreground'>
        <div className="container py-12">
          <div className='grid gap-2'>
            <h2 className='text-3xl font-bold capitalize text-center'>{license.name} <br /> License Application</h2>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto py-12">
        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle>Document Check</CardTitle>
              <SubmitButton disabled={true}>Submit</SubmitButton>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid divide-y text-sm'>
              {license.application_requirements.map((req, index) =>
                <div key={index} className={`flex justify-between items-center gap-6 p-2 ${index % 3 == 0 ? 'bg-destructive/10 ' : 'bg-accent/10'}`}>
                  <p className='line-clamp-1 font-medium'>{req}</p>
                  <div className='flex items-center gap-2'>
                    {index % 3 == 0 ?
                      <>
                        <UploadFileDialog />
                      </>
                      :
                      <>
                          <RemoveFileDialog />
                          <Button className='h-0 p-0 size-8 rounded-full'><Download className='size-4' /></Button>
                      </>
                    }
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
