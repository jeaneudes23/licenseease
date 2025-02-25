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
import { File, Upload } from "lucide-react"

export default function UploadFileDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <span className='bg-accent text-accent-foreground size-8 grid place-content-center rounded-full'><Upload className='size-4' /></span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {'Document name'}</DialogTitle>
          <form action="" className="text-sm pt-3">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <label htmlFor="file" className="primary py-4 border-2 rounded-md border-dashed grid place-content-center gap-2 cursor-pointer">
                  <span className="size-10 bg-primary/10 justify-self-center grid place-content-center rounded-full text-primary"><File className="size-5"/></span>
                  <p className="text-primary">Click To Upload</p>
                  <p>Max file size: 25MB</p>
                </label>
                <input type="file" id="file" name="file" className="primary" />
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
