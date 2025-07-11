import React from 'react'
import { Button, ButtonProps } from './ui/button'

export default function SubmitButton({children,disabled,...props}: ButtonProps) {
  return (
    <Button type="submit" disabled={disabled} {...props}>{children}</Button>
  )
}
