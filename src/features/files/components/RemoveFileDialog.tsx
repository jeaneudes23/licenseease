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


export default function RemoveFileDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <span className='bg-destructive text-destructive-foreground size-8 grid place-content-center rounded-full'><X className='size-4' /></span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to remove this file?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <DialogClose className={buttonVariants({variant: 'secondary'})}>Cancel</DialogClose>
        <Button variant={'destructive'}>Remove</Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
