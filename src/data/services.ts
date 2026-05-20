import {
  Code2, Smartphone, Cpu, Palette, Sparkles, TrendingUp, Brain, Workflow,
  type LucideIcon,
} from "lucide-react";

export type ServicePackage = {
  name: string;
  price: string;
  startingFrom?: boolean;
  features: string[];
  highlighted?: boolean;
};

export type ServiceCaseStudy = {
  title: string;
  category: string;
  description: string;
};

export type ServiceFAQ = {
  q: string;
  a: string;
};

export type Service = {
  slug: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  overview: {
    what: string;
    why: string;
  };
  deliverables: string[];
  technologies: string[];
  packages: ServicePackage[];
  caseStudies: ServiceCaseStudy[];
  faqs: ServiceFAQ[];
};

export const processSteps = [
  { step: 1, title: "Requirement Analysis", desc: "Deep-dive discovery to understand goals." },
  { step: 2, title: "Planning & Strategy", desc: "Roadmap, architecture, and milestones." },
  { step: 3, title: "UI / UX Design", desc: "Wireframes and pixel-perfect interfaces." },
  { step: 4, title: "Development", desc: "Modern, scalable engineering." },
  { step: 5, title: "Testing & QA", desc: "Rigorous quality and security checks." },
  { step: 6, title: "Deployment", desc: "Smooth, zero-downtime go-live." },
  { step: 7, title: "Maintenance & Support", desc: "Ongoing care, updates, and growth." },
];

// Shared pricing copy
export const PRICING_DISCLAIMER =
  "Prices may vary depending on project complexity, features, integrations, and timeline. Final pricing depends on project scope and requirements. Custom quotation available.";

export const PRICING_CTA =
  "Need a custom solution? Contact ASLENIX for a tailored quotation.";

const commonFAQs: ServiceFAQ[] = [
  { q: "How long does a typical project take?", a: "Most projects ship in 4–12 weeks depending on scope. We share a detailed timeline after the discovery call." },
  { q: "What technologies do you use?", a: "We use modern, production-proven stacks — React, Next.js, Flutter, Node.js, Supabase, MongoDB, and AI APIs." },
  { q: "Do you provide post-launch support?", a: "Yes — every package includes a support window, and we offer monthly maintenance plans." },
  { q: "Is the pricing fixed?", a: "Prices listed are indicative for the Nepali market. Final pricing depends on project scope, features, and integrations. We always share a custom quotation after a free consultation." },
];

export const services: Service[] = [
  {
    slug: "website-development",
    icon: Code2,
    title: "Website Development",
    desc: "Lightning-fast, SEO-ready websites built on modern stacks.",
    overview: {
      what: "We design and build modern, conversion-focused websites — from landing pages and business sites to complex corporate platforms and e-commerce stores.",
      why: "A premium, fast, and accessible website is the foundation of digital trust. It drives leads, sales, and brand authority for businesses in Nepal and beyond.",
    },
    deliverables: [
      "Custom UI Design",
      "Responsive Development",
      "SEO Optimization",
      "Performance Optimization",
      "Analytics Integration",
      "Deployment & Hosting Setup",
    ],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Supabase"],
    packages: [
      {
        name: "Starter",
        price: "रु 15,000 – 30,000",
        startingFrom: true,
        features: ["Landing page / small business site", "Responsive design", "Basic SEO", "Contact form", "1 round of revisions"],
      },
      {
        name: "Business",
        price: "रु 35,000 – 80,000",
        startingFrom: true,
        features: ["Multi-page website", "Admin panel", "Contact & lead forms", "SEO optimized", "Analytics integration", "30 days support"],
        highlighted: true,
      },
      {
        name: "Premium Corporate",
        price: "रु 80,000 – 2,50,000+",
        features: ["Custom UI/UX", "Dashboard & CMS", "API integrations", "Advanced animations", "Priority support"],
      },
      {
        name: "E-commerce",
        price: "रु 70,000 – 3,00,000+",
        features: ["Full online store", "Payment gateway (eSewa, Khalti, Stripe)", "Inventory & orders", "Customer accounts", "Analytics & reports"],
      },
    ],
    caseStudies: [
      { title: "FinEdge Banking Portal", category: "Web", description: "A secure, blazing-fast banking dashboard with real-time data." },
      { title: "Lumen Studio", category: "Web", description: "Award-style portfolio site with cinematic motion." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "mobile-app-development",
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "iOS & Android apps with native feel and silky UX.",
    overview: {
      what: "We craft cross-platform and native mobile apps that feel premium on every device — from MVPs to advanced SaaS products.",
      why: "Mobile is where your users live. A great app deepens engagement and unlocks new revenue channels for Nepali businesses and global startups.",
    },
    deliverables: [
      "iOS & Android Apps",
      "Cross-platform Codebase",
      "App Store Submission",
      "Push Notifications",
      "Offline Support",
      "Analytics & Crash Reporting",
    ],
    technologies: ["Flutter", "React Native", "Swift", "Kotlin", "Firebase", "Supabase"],
    packages: [
      {
        name: "Basic App",
        price: "रु 50,000 – 1,20,000",
        startingFrom: true,
        features: ["Single platform", "Up to 8 screens", "Basic auth", "Store submission"],
      },
      {
        name: "Business App",
        price: "रु 1,50,000 – 4,00,000",
        startingFrom: true,
        features: ["iOS + Android", "Up to 20 screens", "Push notifications", "Backend & API", "60 days support"],
        highlighted: true,
      },
      {
        name: "Advanced SaaS",
        price: "रु 4,00,000 – 12,00,000+",
        features: ["Full feature set", "Custom backend", "AI integrations", "Admin dashboard", "Priority support"],
      },
      {
        name: "Enterprise",
        price: "Custom Pricing",
        features: ["Dedicated team", "SLA support", "Scalable architecture", "Security & compliance"],
      },
    ],
    caseStudies: [
      { title: "PulseFit", category: "App", description: "Wellness app with adaptive workouts and wearable sync." },
      { title: "Nimbus Wallet", category: "App", description: "Secure crypto wallet with biometric auth." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "custom-software-systems",
    icon: Cpu,
    title: "Custom Software Systems",
    desc: "Bespoke ERPs, CRMs, and SaaS platforms tailored to you.",
    overview: {
      what: "We build tailor-made software systems — School Management, Attendance, ERP, CRM, and SaaS platforms for Nepali institutions and enterprises.",
      why: "Off-the-shelf software rarely fits perfectly. Custom systems streamline operations and become a competitive moat.",
    },
    deliverables: [
      "Custom Architecture",
      "Database Design",
      "Role-Based Access",
      "API Integrations",
      "Admin Dashboards",
      "Documentation & Training",
    ],
    technologies: ["Node.js", "PostgreSQL", "Supabase", "MongoDB", "Docker", "AWS"],
    packages: [
      {
        name: "Attendance System",
        price: "रु 60,000 – 2,50,000",
        startingFrom: true,
        features: ["Staff & student attendance", "Biometric/QR support", "Reports & exports", "Admin dashboard"],
      },
      {
        name: "School Management",
        price: "रु 1,50,000 – 5,00,000",
        startingFrom: true,
        features: ["Students, teachers, classes", "Fees & billing", "Result management", "Parent portal", "SMS/Email alerts"],
        highlighted: true,
      },
      {
        name: "ERP / CRM",
        price: "रु 3,00,000 – 15,00,000+",
        features: ["Multi-module ERP / CRM", "Role-based access", "Reporting & analytics", "API integrations", "SLA support"],
      },
      {
        name: "Custom Enterprise",
        price: "Custom Pricing",
        features: ["Tailored architecture", "Dedicated team", "SSO & audit logs", "Long-term partnership"],
      },
    ],
    caseStudies: [
      { title: "Orbit ERP", category: "Software", description: "Manufacturing ERP with real-time inventory." },
      { title: "ClientLens CRM", category: "Software", description: "AI-assisted CRM for B2B sales teams." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "ui-ux-design",
    icon: Palette,
    title: "UI / UX Design",
    desc: "Pixel-perfect interfaces that turn visitors into fans.",
    overview: {
      what: "Research-led product design — wireframes, prototypes, and design systems that scale across web and mobile.",
      why: "Great design is the difference between a tool people tolerate and one they love. It compounds retention and conversion.",
    },
    deliverables: [
      "User Research",
      "Wireframes & Prototypes",
      "Design System",
      "Hi-fi Mockups",
      "Motion Specs",
      "Developer Handoff",
    ],
    technologies: ["Figma", "Framer", "Spline", "After Effects", "Lottie", "Principle"],
    packages: [
      {
        name: "Landing Page Design",
        price: "रु 8,000 – 20,000",
        startingFrom: true,
        features: ["1 high-converting page", "Mobile + desktop", "2 design rounds"],
      },
      {
        name: "Complete Website UI",
        price: "रु 25,000 – 1,00,000",
        startingFrom: true,
        features: ["Full website screens", "Design system", "Prototype", "3 design rounds"],
        highlighted: true,
      },
      {
        name: "Mobile App UI/UX",
        price: "रु 35,000 – 1,50,000",
        features: ["Full app flows", "Design system", "Motion specs", "Developer handoff"],
      },
      {
        name: "Enterprise / Product",
        price: "Custom Pricing",
        features: ["Full product design", "Dedicated designer", "Ongoing partnership"],
      },
    ],
    caseStudies: [
      { title: "Northwind Banking App", category: "Branding", description: "End-to-end product design for a fintech." },
      { title: "Atlas Travel", category: "Branding", description: "Immersive booking experience with motion." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "branding-identity",
    icon: Sparkles,
    title: "Branding & Identity",
    desc: "Magnetic brand systems — from logo to motion guidelines.",
    overview: {
      what: "We craft complete brand identities — naming, logo, visual language, and brand guidelines for Nepali startups and established businesses.",
      why: "A strong brand commands premium pricing, builds loyalty, and makes marketing exponentially more effective.",
    },
    deliverables: [
      "Brand Strategy",
      "Logo Design",
      "Color & Typography",
      "Brand Guidelines",
      "Social Templates",
      "Motion Identity",
    ],
    technologies: ["Figma", "Illustrator", "After Effects", "Photoshop", "Cinema 4D"],
    packages: [
      {
        name: "Logo Design",
        price: "रु 5,000 – 25,000",
        startingFrom: true,
        features: ["2–3 logo concepts", "Color palette", "Final files (SVG, PNG, PDF)"],
      },
      {
        name: "Brand Identity Package",
        price: "रु 20,000 – 80,000",
        startingFrom: true,
        features: ["Logo + variations", "Typography system", "Stationery design", "Social templates"],
        highlighted: true,
      },
      {
        name: "Complete Brand System",
        price: "रु 1,00,000+",
        features: ["Full brand guidelines", "Motion identity", "Marketing collateral", "Launch assets"],
      },
      {
        name: "Enterprise Branding",
        price: "Custom Pricing",
        features: ["Brand strategy & naming", "Full visual system", "Long-term brand partnership"],
      },
    ],
    caseStudies: [
      { title: "Zentro", category: "Branding", description: "Identity for a sustainable fashion brand." },
      { title: "Helios Coffee", category: "Branding", description: "Packaging and identity for a specialty roaster." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "digital-marketing",
    icon: TrendingUp,
    title: "Digital Marketing",
    desc: "Performance-driven SEO, paid, and social campaigns.",
    overview: {
      what: "Full-funnel digital marketing — SEO, paid ads, content, and social — engineered for ROI in the Nepali and global market.",
      why: "Even the best product needs distribution. We turn marketing spend into predictable, scalable growth.",
    },
    deliverables: [
      "SEO Strategy",
      "Google & Meta Ads",
      "Content Calendar",
      "Social Media Management",
      "Email Campaigns",
      "Monthly Reporting",
    ],
    technologies: ["GA4", "Search Console", "Meta Ads", "Google Ads", "HubSpot", "Mailchimp"],
    packages: [
      {
        name: "Social Media Management",
        price: "रु 15,000 – 50,000/month",
        startingFrom: true,
        features: ["Content calendar", "Post design & copy", "Community management", "Monthly report"],
      },
      {
        name: "SEO Services",
        price: "रु 20,000 – 80,000/month",
        startingFrom: true,
        features: ["On-page & off-page SEO", "Keyword strategy", "Technical SEO", "Bi-weekly reporting"],
        highlighted: true,
      },
      {
        name: "Paid Ads Management",
        price: "रु 25,000+/month",
        features: ["Google & Meta Ads", "Audience targeting", "Creative production", "ROAS optimization"],
      },
      {
        name: "Full Growth Partner",
        price: "Custom Pricing",
        features: ["Dedicated strategist", "Full-funnel growth", "Weekly reporting", "Quarterly strategy"],
      },
    ],
    caseStudies: [
      { title: "Beacon SaaS Growth", category: "Web", description: "5x organic traffic in 6 months." },
      { title: "Vela DTC", category: "Web", description: "ROAS doubled across paid channels." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "ai-solutions",
    icon: Brain,
    title: "AI Solutions",
    desc: "Intelligent agents, chatbots, and ML automation.",
    overview: {
      what: "We build AI-powered products — chatbots, agents, RAG systems, and ML pipelines tailored to your business.",
      why: "AI is the new electricity. The companies that embed it into operations and products win the next decade.",
    },
    deliverables: [
      "AI Strategy & Use Cases",
      "Chatbots & Assistants",
      "RAG / Knowledge Systems",
      "Custom ML Models",
      "API Integrations",
      "Monitoring & Evals",
    ],
    technologies: ["OpenAI", "Anthropic", "LangChain", "Pinecone", "Hugging Face", "Python"],
    packages: [
      {
        name: "Basic AI Chatbot",
        price: "रु 40,000 – 1,50,000",
        startingFrom: true,
        features: ["Single workflow chatbot", "Website / WhatsApp integration", "Basic dashboard"],
      },
      {
        name: "AI Automation",
        price: "रु 1,00,000 – 5,00,000",
        startingFrom: true,
        features: ["Multi-agent system", "RAG pipeline", "Custom UI", "API integrations", "60 days support"],
        highlighted: true,
      },
      {
        name: "Custom AI Systems",
        price: "Custom Pricing",
        features: ["Enterprise AI platform", "Fine-tuned models", "Knowledge base integration", "SLA support"],
      },
      {
        name: "AI Consulting",
        price: "Custom Pricing",
        features: ["AI roadmap", "Use-case discovery", "Architecture review", "Team training"],
      },
    ],
    caseStudies: [
      { title: "Aria Support Bot", category: "AI", description: "GPT-powered support agent handling 70% of tickets." },
      { title: "InsightLens", category: "AI", description: "RAG system over 1M+ internal documents." },
    ],
    faqs: commonFAQs,
  },
  {
    slug: "business-automation",
    icon: Workflow,
    title: "Business Automation",
    desc: "Workflow engines that save your team hours every week.",
    overview: {
      what: "We automate repetitive workflows across sales, ops, and support using modern tooling and custom code.",
      why: "Automation reclaims hundreds of hours, reduces errors, and lets your team focus on high-leverage work.",
    },
    deliverables: [
      "Workflow Audit",
      "Zapier / Make Builds",
      "Custom Scripts & APIs",
      "CRM & Tool Integrations",
      "Internal Dashboards",
      "Team Training",
    ],
    technologies: ["n8n", "Zapier", "Make", "Node.js", "Python", "Supabase"],
    packages: [
      {
        name: "Workflow Automation",
        price: "रु 50,000 – 3,00,000",
        startingFrom: true,
        features: ["Up to 10 workflows", "Tool integrations", "Custom scripts", "Documentation"],
      },
      {
        name: "CRM Automation",
        price: "रु 1,50,000+",
        startingFrom: true,
        features: ["CRM setup & automation", "Lead routing", "Email sequences", "Dashboards"],
        highlighted: true,
      },
      {
        name: "Enterprise Automation",
        price: "Custom Pricing",
        features: ["End-to-end automation", "Dedicated ops engineer", "SLA support"],
      },
      {
        name: "Automation Audit",
        price: "Custom Pricing",
        features: ["Process discovery", "Automation roadmap", "ROI estimates", "Team training"],
      },
    ],
    caseStudies: [
      { title: "Cargo Ops Automation", category: "Software", description: "Saved 120 hrs/month in logistics ops." },
      { title: "Helix Sales Engine", category: "Software", description: "Automated lead routing and enrichment." },
    ],
    faqs: commonFAQs,
  },
];
