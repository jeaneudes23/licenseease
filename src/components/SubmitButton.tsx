import React from 'react'
import { Button, ButtonProps } from './ui/button'

export default function SubmitButton({children,disabled,...props}: ButtonProps) {
  return (
    <Button disabled={disabled} {...props}>{children}</Button>
  )
}
