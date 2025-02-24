import { licenseCategories } from "../schema/licenseSchema"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function LicensesAccordion() {
  return (
    <div className="grid gap-3">
      {licenseCategories.map((category,id) => 
        <div key={id} className="capitalize border rounded-t-md">
          <div className="bg-primary/10 text-primary p-3  rounded-t-[inherit] font-semibold">
            <h3>{category.name}</h3>
          </div>
          <div className="divide-y">
            {category.licenses.map((license,id) => 
              <Link href={`/licenses/${license.id}`} key={id} className="p-2 text-sm flex justify-between hover:bg-primary/5 transition-all">
                {license.name}
                <ChevronRight className="size-4"/>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
