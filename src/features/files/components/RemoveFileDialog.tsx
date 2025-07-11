import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useState } from "react"

interface RemoveFileDialogProps {
  fileName?: string
  onRemove?: () => void
}

export default function RemoveFileDialog({ fileName = 'file', onRemove }: RemoveFileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className='bg-destructive text-destructive-foreground size-8 grid place-content-center rounded-full hover:bg-destructive/90 transition-colors'>
          <X className='size-4' />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {fileName}?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this file? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
