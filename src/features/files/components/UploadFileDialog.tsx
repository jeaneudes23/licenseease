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
import { Upload } from "lucide-react"

export default function UploadFileDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <span className='bg-accent text-accent-foreground size-8 grid place-content-center rounded-full'><Upload className='size-4' /></span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {/* <DialogTitle>Upload Document?</DialogTitle> */}
          <form action="" className="text-sm">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <label htmlFor="name" className="primary">Document Name</label>
                <input type="text" placeholder="Document Name" readOnly className="primary" />
              </div>
              <div className="grid gap-1">
                <label htmlFor="name" className="primary">Upload Document</label>
                <input type="file" className="primary" />
              </div>
            </div>
          </form>
        </DialogHeader>
        <DialogFooter>
        <DialogClose className={buttonVariants({variant: 'secondary'})}>Cancel</DialogClose>
        <Button variant={'accent'}>Save Changes</Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
