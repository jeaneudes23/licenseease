export interface Representative {
  id: string
  fullName: string
  email: string
  phone: string
  nationalId: string
  passport?: string
  role: string
  address: string
}

export interface Agent {
  id: string
  companyName: string
  companyType: string
  registrationNumber: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  status: 'active' | 'pending' | 'suspended'
  representatives: Representative[]
}

export const agents: Agent[] = [
  {
    id: '1',
    companyName: 'Microsoft Corporation',
    companyType: 'technology',
    registrationNumber: 'RC-2024-001',
    companyEmail: 'info@microsoft.rw',
    companyPhone: '+250876837289',
    companyAddress: 'Kigali - Rwanda',
    status: 'active',
    representatives: [
      {
        id: 'rep1',
        fullName: 'Jean Baptiste Uwimana',
        email: 'jean.baptiste@microsoft.rw',
        phone: '+250788123456',
        nationalId: '1198880123456789',
        passport: 'PA1234567',
        role: 'Regional Manager',
        address: 'Kigali, Gasabo District'
      },
      {
        id: 'rep2',
        fullName: 'Marie Claire Mukamana',
        email: 'marie.claire@microsoft.rw',
        phone: '+250788654321',
        nationalId: '1199870987654321',
        role: 'Sales Representative',
        address: 'Kigali, Kicukiro District'
      }
    ]
  },
  {
    id: '2',
    companyName: 'TechCorp Solutions',
    companyType: 'software',
    registrationNumber: 'RC-2024-002',
    companyEmail: 'info@techcorp.com',
    companyPhone: '+250785432109',
    companyAddress: 'Kigali - Rwanda',
    status: 'pending',
    representatives: []
  }
]