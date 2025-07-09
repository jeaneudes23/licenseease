import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, FileText, User, Briefcase, Users, Settings } from "lucide-react"

export default function SampleRequirements() {
  const requirements = [
    {
      id: 1,
      title: "Company Registration Certificate",
      icon: FileText,
      description: "Official business registration document"
    },
    {
      id: 2,
      title: "ID/Passport of legal representative",
      icon: User,
      description: "Valid identification of authorized person"
    },
    {
      id: 3,
      title: "Business Plan",
      icon: Briefcase,
      description: "Detailed business strategy and projections"
    },
    {
      id: 4,
      title: "Partnership Agreements (if applicable)",
      icon: Users,
      description: "Legal agreements between business partners"
    },
    {
      id: 5,
      title: "Technical Specifications & Experience",
      icon: Settings,
      description: "Technology requirements and team expertise"
    }
  ]

  return (
    <section className="py-10">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle className="w-8 h-8 text-blue-500" />
        <h2 className="text-2xl font-semibold text-blue-600">Requirements (for E-Services)</h2>
      </div>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700">Documentation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.map((requirement) => {
              const IconComponent = requirement.icon
              return (
                <div key={requirement.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-blue-200/50 hover:bg-white/80 transition-colors duration-200">
                  <IconComponent className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800">{requirement.title}</h4>
                    <p className="text-sm text-blue-600/80 mt-1">{requirement.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
