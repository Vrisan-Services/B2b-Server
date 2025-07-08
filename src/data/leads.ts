import { ICreateLeadDTO } from "../types/lead.types";

export const leads: Omit<ICreateLeadDTO, 'userId'>[] = [
    {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@dreamhomes.in",
      phone: "+91-9876543210",
      company: "Dream Homes Pvt Ltd",
      type: "Architecture",
      value: "₹18,50,000",
      source: "Website",
      status: "Converted",
      remarks: [
        { text: "Initial contact made", date: new Date("2024-01-15") },
        { text: "Interested in residential project design", date: new Date("2024-01-16") },
        { text: "Project requirements discussed", date: new Date("2024-01-17") }
      ],
      city: "Bangalore",
      state: "Karnataka",
      createdAt: new Date("2024-01-15")
    },
    {
      name: "Rajesh Kumar ghosh",
      email: "rajesh.kumarghosh@dreamhomes.in",
      phone: "+91-9876543210",
      company: "Dream Homes Pvt Ltd",
      type: "Architecture",
      value: "₹18,50,000",
      source: "Website",
      status: "Converted",
      remarks: [
        { text: "Interested in residential project design", date: new Date("2024-01-20") },
        { text: "Follow-up meeting scheduled", date: new Date("2024-01-21") }
      ],
      city: "Bangalore",
      state: "Karnataka",
      createdAt: new Date("2024-01-20")
    },
    {
      name: "Priya Sharma",
      email: "priya.sharma@modernliving.co.in",
      phone: "+91-8765432109",
      company: "Modern Living Solutions",
      type: "Interior",
      value: "₹12,75,000",
      source: "Referral",
      status: "Fresh",
      remarks: [
        { text: "Follow up scheduled for next week", date: new Date("2024-02-05") }
      ],
      city: "Hyderabad",
      state: "Telangana",
      createdAt: new Date("2024-02-05")
    },
    {
      name: "Amit Patel",
      email: "amit.patel@startup.co.in",
      phone: "+91-7654321098",
      company: "Urban Design Studio",
      type: "Architecture",
      value: "₹6,25,000",
      source: "WhatsApp",
      status: "Fresh",
      remarks: [
        { text: "Initial contact made, awaiting response", date: new Date("2024-02-12") }
      ],
      city: "Ahmedabad",
      state: "Gujarat",
      createdAt: new Date("2024-02-12")
    },
    {
      name: "Deepika Singh",
      email: "deepika.singh@luxurycorp.in",
      phone: "+91-6543210987",
      company: "Luxury Living Corp",
      type: "Interior",
      value: "₹32,00,000",
      source: "Cold Call",
      status: "Converted",
      remarks: [
        { text: "High-value prospect, luxury segment", date: new Date("2024-02-18") },
        { text: "Luxury requirements discussed", date: new Date("2024-02-19") }
      ],
      city: "Mumbai",
      state: "Maharashtra",
      createdAt: new Date("2024-02-18")
    },
    {
      name: "Vikash Agarwal",
      email: "vikash@retailspaces.in",
      phone: "+91-5432109876",
      company: "Retail Spaces Plus",
      type: "Architecture",
      value: "₹8,90,000",
      source: "Email Campaign",
      status: "Fresh",
      remarks: [
        { text: "Retail project discussion in progress", date: new Date("2024-03-01") }
      ],
      city: "Kolkata",
      state: "West Bengal",
      createdAt: new Date("2024-03-01")
    },
    {
      name: "Kavita Reddy",
      email: "kavita.reddy@premiumhomes.in",
      phone: "+91-4321098765",
      company: "Premium Home Network",
      type: "Interior",
      value: "₹25,60,000",
      source: "Trade Show",
      status: "Converted",
      remarks: [
        { text: "Premium residential interior project", date: new Date("2024-03-08") },
        { text: "Design consultation completed", date: new Date("2024-03-09") }
      ],
      city: "Chennai",
      state: "Tamil Nadu",
      createdAt: new Date("2024-03-08")
    },
    {
      name: "Rohit Gupta",
      email: "rohit@commercialspaces.org",
      phone: "+91-3210987654",
      company: "Commercial Spaces Ltd",
      type: "Architecture",
      value: "₹4,75,000",
      source: "Google Ads",
      status: "Fresh",
      remarks: [
        { text: "Commercial office space requirement", date: new Date("2024-03-15") }
      ],
      city: "Pune",
      state: "Maharashtra",
      createdAt: new Date("2024-03-15")
    },
    {
      name: "Sneha Joshi",
      email: "sneha.joshi@interiorpro.biz",
      phone: "+91-2109876543",
      company: "Interior Pro Consulting",
      type: "Interior",
      value: "₹16,80,000",
      source: "Referral",
      status: "Fresh",
      remarks: [
        { text: "Consultation meeting scheduled", date: new Date("2024-03-22") }
      ],
      city: "Bangalore",
      state: "Karnataka",
      createdAt: new Date("2024-03-22")
    },
    {
      name: "Arjun Mehta",
      email: "arjun.mehta@healthspaces.med",
      phone: "+91-1098765432",
      company: "Healthcare Spaces Plus",
      type: "Architecture",
      value: "₹42,00,000",
      source: "Partnership",
      status: "Converted",
      remarks: [
        { text: "Healthcare facility design project", date: new Date("2024-04-01") },
        { text: "Medical compliance requirements reviewed", date: new Date("2024-04-02") }
      ],
      city: "Delhi",
      state: "Delhi",
      createdAt: new Date("2024-04-01")
    },
    {
      name: "Anita Verma",
      email: "anita.verma@edudesign.edu",
      phone: "+91-0987654321",
      company: "Educational Design First",
      type: "Interior",
      value: "₹14,25,000",
      source: "Website",
      status: "Fresh",
      remarks: [
        { text: "Educational institution interior design", date: new Date("2024-04-10") }
      ],
      city: "Lucknow",
      state: "Uttar Pradesh",
      createdAt: new Date("2024-04-10")
    },
    {
      name: "Sudipto Das",
      email: "sudipto@designelementary.com",
      phone: "+91-0987654321",
      company: "Educational Design First",
      type: "Interior",
      value: "₹14,25,000",
      source: "Website",
      status: "Fresh",
      remarks: [
        { text: "Educational institution interior design", date: new Date("2024-04-15") }
      ],
      city: "Bangalore",
      state: "Karnataka",
      createdAt: new Date("2024-04-15")
    }
  ]; 