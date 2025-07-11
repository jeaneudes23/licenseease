"use client"

import { X } from "lucide-react"
import { ChangeEvent, KeyboardEvent, useState } from "react"

interface Props {
  name: string
}

export default function TagsInput({ name }: Props) {
  const [tags, setTags] = useState<string[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const value = target.value.trim().replaceAll(',','-')
    if (e.key === 'Enter' && value.length > 2 && !tags.includes(value)) {
      e.preventDefault()
      setTags(prevTags => [...prevTags,value])
      target.value = ''
    }
  }

  const removeTag = (currentTag: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== currentTag))
  }

  return (
    <>
      <input type="text" className="primary" readOnly value={tags} hidden/>
      <input type="text" name={`tags_input_${name}`} form="" onKeyDown={handleKeyDown} className="primary" />
      {tags.map((tag, index) =>
        <div className="text-xs font-medium flex justify-between items-center bg-secondary border px-2 py-1 rounded-md" key={index}>
          <p>{tag}</p>
          <button type="button" onClick={() => removeTag(tag)} className="p-1 bg-destructive text-destructive-foreground rounded-full border"><X className="size-4"/></button>
        </div>
      )}
    </>
  )
}
