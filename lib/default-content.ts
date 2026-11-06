// The shape of everything editable on the website, plus the starting content
// (taken from the CV). Once you save in /admin, content/site.json overrides this.

export type Job = {
  title: string;
  company: string;
  location: string;
  period: string;
  points: string[];
};

export type SiteContent = {
  profile: {
    name: string;
    shortName: string;
    initials: string;
    role: string;
    company: string;
    locations: string[];
    email: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    youtube: string;
    youtubeChannelId: string; // e.g. UCxxxxxxxxxxxxxxxxxxxxxx — your latest videos then appear automatically
    photo: string; // path in /public, e.g. "/profile.jpg" — empty = show initials
    cvFile: string; // path in /public, e.g. "/cv.pdf" — empty = hide button
    availability: string;
    tagline: string;
  };
  about: { heading: string; paragraphs: string[] };
  stats: { value: string; label: string }[];
  experience: Job[];
  degrees: { title: string; school: string; period: string }[];
  certifications: { title: string; org: string; year: string }[];
  educationNote: string;
  skillGroups: { name: string; skills: string[] }[];
  languages: { name: string; level: string }[];
  countriesVisited: string[];
  contact: { heading: string; text: string };
};

export const defaultContent: SiteContent = {
  profile: {
    name: "Thamara Dhanushka Perera",
    shortName: "Dhanushka Perera",
    initials: "DP",
    role: "Director – IT",
    company: "Gazelle Key International (Pvt) Ltd",
    locations: ["Melbourne, Australia", "Colombo, Sri Lanka"],
    email: "thamaradhanushkaperera@gmail.com",
    linkedin: "https://www.linkedin.com/in/thamara-perera-a65a4173/",
    // Add your profile links in /admin → Contact & links
    facebook: "",
    instagram: "",
    youtube: "",
    youtubeChannelId: "",
    photo: "",
    cvFile: "",
    availability: "Available immediately",
    tagline:
      "IT leader with 15+ years across IT administration, banking operations, data management and business leadership in Sri Lanka and Australia.",
  },
  about: {
    heading: "Technology in service of the business",
    paragraphs: [
      "I currently serve as Director – IT at Gazelle Key International, where I turn business strategy into operational plans using the right IT tools, and keep administration, documentation and compliance running on reliable digital systems.",
      "My career started at the Central Bank of Sri Lanka, where over a decade of work in a regulated environment taught me precision with data, reporting for senior management and training others on internal systems. Since then I've run IT infrastructure, email, security and backups for a manufacturing company, supported operations in Australia, and led business operations across travel, import and export.",
      "I hold a Master of Computer Science (coursework) from Edith Cowan University and I keep learning — most recently through advanced certificates in web development.",
    ],
  },
  stats: [
    { value: "15+", label: "Years of experience" },
    { value: "11", label: "Years at the Central Bank" },
    { value: "2", label: "Countries worked in" },
    { value: "MCS", label: "Edith Cowan University" },
  ],
  experience: [
    {
      title: "Director – IT",
      company: "Gazelle Key International (Pvt) Ltd",
      location: "Sri Lanka",
      period: "May 2024 – Present",
      points: [
        "Develop and execute business strategies and operational plans using IT tools.",
        "Oversee administration, documentation and compliance using digital systems and MS Office.",
      ],
    },
    {
      title: "Director – IT",
      company: "Gazelle Key Travels & Importers & Exporters",
      location: "Sri Lanka",
      period: "Apr 2019 – May 2024",
      points: [
        "Led daily business operations in travel, import and export services using IT systems and digital tools.",
        "Managed administrative, operational and compliance activities with MS Office and online platforms.",
        "Coordinated with clients, suppliers and regulatory authorities through email, CRM and communication systems.",
      ],
    },
    {
      title: "IT Administrator & Data Entry Operator (Part-time)",
      company: "BNS Company",
      location: "Australia",
      period: "Mar 2022 – Sep 2023",
      points: [
        "Managed operational data entry and maintained digital records.",
        "Provided IT administration and system support for daily operations.",
        "Ensured data accuracy and timely reporting to supervisors.",
      ],
    },
    {
      title: "Software & System Maintenance Manager · Information Specialist (Part-time)",
      company: "USN Packaging Lanka (Pvt) Ltd",
      location: "Sri Lanka",
      period: "Dec 2012 – Jun 2018",
      points: [
        "Administered corporate email systems, antivirus solutions and user access controls.",
        "Maintained IT infrastructure including hardware, software and network components.",
        "Implemented IT policies, procedures and documentation standards.",
        "Ensured data security, system backups and network availability.",
        "Coordinated procurement of IT equipment and software licences, and reported upgrade recommendations to management.",
      ],
    },
    {
      title: "Bank Office Assistant",
      company: "Central Bank of Sri Lanka",
      location: "Colombo, Sri Lanka",
      period: "Mar 2008 – Mar 2019",
      points: [
        "Prepared routine and ad-hoc management reports for senior officers.",
        "Performed accurate data entry and maintained banking records in internal systems.",
        "Assisted with operations of the Currency Management Module.",
        "Trained and guided junior staff on internal banking systems and procedures.",
        "Prepared, verified and maintained official documents for supervisory review.",
      ],
    },
  ],
  degrees: [
    {
      title: "Master of Computer Science (Coursework – Completed)",
      school: "Edith Cowan University, Australia",
      period: "2019 – 2023",
    },
    { title: "Bachelor of Computing – BSc (Hons)", school: "IDM / University of Buckingham", period: "2017 – 2018" },
    {
      title: "Higher National Diploma in Computing & System Development",
      school: "Pearson BTEC Level 5 – IDM",
      period: "2012 – 2014",
    },
  ],
  certifications: [
    { title: "Advanced Certificate in Web Development", org: "", year: "2025" },
    { title: "Certificate in Web Development", org: "", year: "2025" },
    { title: "Diploma in Professional Spoken English", org: "London International Campus", year: "2024" },
    { title: "Diploma in Web Designing", org: "American Institute of Computer Technology", year: "2017" },
    { title: "English Language Course", org: "British Council", year: "2012" },
    { title: "Premier Diploma in Software Development", org: "IDM", year: "2012" },
    { title: "Diploma in ICT", org: "IDM", year: "2010" },
    { title: "Diploma in Business Management", org: "IDM", year: "2009" },
    { title: "Diploma in Hardware & Networking", org: "IDM", year: "2008" },
    { title: "Diploma in Network Administration", org: "Raytronics Computers", year: "2007" },
    { title: "Diploma in Information Technology", org: "Raytronics Computers", year: "2005" },
  ],
  educationNote:
    "Also: G.C.E. Advanced Level (Physical Science – Maths stream) and G.C.E. Ordinary Level, Sri Lanka.",
  skillGroups: [
    {
      name: "IT & Systems",
      skills: [
        "IT administration",
        "System maintenance",
        "Network & security management",
        "Email & access control",
        "Backups & data security",
        "Hardware & software procurement",
        "Web development",
      ],
    },
    {
      name: "Business & Operations",
      skills: [
        "Business strategy execution",
        "Operational planning",
        "Compliance documentation",
        "CRM systems",
        "Travel, import & export operations",
      ],
    },
    {
      name: "Data & Reporting",
      skills: [
        "Management reporting",
        "Data entry & management",
        "Banking operations",
        "Currency management",
        "Records & documentation",
        "MS Office",
      ],
    },
    {
      name: "People",
      skills: ["Staff training & supervision", "Stakeholder coordination", "Leadership", "Fast, effective decision-making"],
    },
  ],
  languages: [
    { name: "English", level: "Fluent" },
    { name: "Sinhala", level: "Native" },
  ],
  countriesVisited: [
    "Australia",
    "New Zealand",
    "United Kingdom",
    "Netherlands",
    "Belgium",
    "France",
    "UAE",
    "Thailand",
    "Malaysia",
    "Cambodia",
    "China",
    "India",
  ],
  contact: {
    heading: "Let's talk about your next IT or operations role.",
    text: "Send me a message below, or reach me directly by email or LinkedIn.",
  },
};
