import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Server, Wifi, Folder } from "lucide-react"

export default function LicenseCategories() {
  const categories = [
    {
      id: 1,
      title: "Application Service Provider",
      description: "E-Services, VoIP, Payphone, VPNs, etc.",
      icon: Globe,
      color: "text-blue-600"
    },
    {
      id: 2,
      title: "Network Infrastructure",
      description: "International Gateway Systems",
      icon: Server,
      color: "text-green-600"
    },
    {
      id: 3,
      title: "Network Service Provider",
      description: "Radio Communications, ISP Tier 1 & 2",
      icon: Wifi,
      color: "text-purple-600"
    }
  ]

  return (
    <section className="py-10">
      <div className="flex items-center gap-2 mb-6">
        <Folder className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-semibold">ICT License Categories</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const IconComponent = category.icon
          return (
            <Card key={category.id} className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-6 h-6 ${category.color}`} />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {category.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}