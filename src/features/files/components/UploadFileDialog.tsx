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
import { useState } from "react"

interface UploadFileDialogProps {
  documentName?: string
  onUpload?: (file: File) => void
}

export default function UploadFileDialog({ documentName = 'Document', onUpload }: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError('')
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be under 5MB')
        return
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg']
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF, PNG, and JPG files are allowed')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleSave = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile)
    }
    setSelectedFile(null)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setError('')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className='bg-accent text-accent-foreground size-8 grid place-content-center rounded-full hover:bg-accent/90 transition-colors'>
          <Upload className='size-4' />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {documentName}</DialogTitle>
        </DialogHeader>
        <div className="text-sm pt-3">
          <div className="grid gap-3">
            <div className="grid gap-1">
              <label htmlFor="file" className="primary py-4 border-2 rounded-md border-dashed grid place-content-center gap-2 cursor-pointer hover:bg-accent/5 transition-colors">
                <span className="size-10 bg-primary/10 justify-self-center grid place-content-center rounded-full text-primary"><File className="size-5"/></span>
                <p className="text-primary">Click To Upload</p>
                <p>Max file size: 5MB</p>
                <p className="text-xs text-gray-500">Supported: PDF, PNG, JPG</p>
                {selectedFile && (
                  <p className="text-sm font-medium text-green-600">
                    ✓ Selected: {selectedFile.name}
                  </p>
                )}
                {error && (
                  <p className="text-sm font-medium text-red-600">
                    ❌ {error}
                  </p>
                )}
              </label>
              <input 
                type="file" 
                id="file" 
                name="file" 
                className="hidden" 
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="accent" 
            onClick={handleSave}
            disabled={!selectedFile || !!error}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
