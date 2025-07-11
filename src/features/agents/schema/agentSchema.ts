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
  name: string
  email: string
  phone: string
  address: string
  companyName?: string
  companyType?: string
  registrationNumber?: string
  status: 'active' | 'pending' | 'suspended'
  representatives?: Representative[]
}

export const agents: Agent[] = [
  {
    id: '1',
    name: 'James Dean',
    email: 'james@agent.com',
    phone: '+250876837289',
    address: 'Kigali - Rwanda',
    companyName: 'Microsoft Corporation',
    companyType: 'technology',
    registrationNumber: 'RC-2024-001',
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
    name: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    phone: '+250785432109',
    address: 'Kigali - Rwanda',
    companyName: 'TechCorp Solutions',
    companyType: 'software',
    registrationNumber: 'RC-2024-002',
    status: 'pending',
    representatives: []
  }
]