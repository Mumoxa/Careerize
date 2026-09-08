/**
 * Careerize — Career Direction Clusters
 * Squad: UX + Content
 *
 * With 2,676 starter routes, learners need a middle layer between broad interest
 * signals and individual job titles. A "career direction" is a real SA-relevant
 * work cluster of ~10-60 roles that share pathway logic, entry requirements and
 * work reality. Candidates drill from a direction into specific titles.
 *
 * Directions are grouped under the 18 macro streams (matching stream labels in
 * masterCareerList.js) so filtering works alongside the existing stream filter.
 *
 * Each direction's `keywords` are lower-cased title substrings used to auto-assign
 * CAREER_ROUTES to their direction. If no keyword matches, the route falls back to
 * the stream-level "Other / General" bucket.
 */

export const CAREER_DIRECTIONS = [
  // ---- TECHNOLOGY ----
  { id: "software-development", stream: "Technology, data and AI", label: "Software and app development",
    keywords: ["developer", "engineer", "programmer", "coder", "frontend", "backend", "fullstack", "full-stack", "mobile", "android", "ios", "flutter", "game dev", "web3", "smart contract", "blockchain protocol", "open source"],
    description: "Building, testing and maintaining software, apps, websites and digital products.",
  },
  { id: "ai-data", stream: "Technology, data and AI", label: "AI, data and machine learning",
    keywords: ["data ", "data,", "data analyst", "data scientist", "machine learning", "mlops", "ai ", "ai-", "large language", "llm", "nlp", "computer vision", "prompt", "generative", "business intelligence", "bi ", "etl", "data warehouse", "data governance", "analytics", "statistician"],
    description: "Working with data, AI models, analytics and intelligent systems.",
  },
  { id: "cyber-security", stream: "Technology, data and AI", label: "Cyber security and IT risk",
    keywords: ["security", "cyber", "penetration", "soc analyst", "ethical hacker", "iam", "threat intelligence", "forensic computer", "audit (edp)", "it risk", "ciso", "popia", "data protection", "smart contract auditor"],
    description: "Protecting systems, data and networks; managing cyber risk and compliance.",
  },
  { id: "it-infrastructure", stream: "Technology, data and AI", label: "IT infrastructure, networks and cloud",
    keywords: ["network", "systems admin", "database admin", "cloud", "devops", "sre", "kubernetes", "platform engineer", "storage", "backup", "solutions arch", "enterprise arch", "integration arch", "observability", "site reliability", "edge computing", "saas implement"],
    description: "Running networks, servers, cloud, systems and infrastructure that organisations depend on.",
  },
  { id: "it-support", stream: "Technology, data and AI", label: "IT support and service desk",
    keywords: ["support", "helpdesk", "service desk", "computer operator", "data capturer", "data entry", "telephonist", "office systems", "microcomputer"],
    description: "Helping people use computers, systems and digital tools at work.",
  },
  { id: "digital-product-design", stream: "Technology, data and AI", label: "Digital product, UX and design",
    keywords: ["ux ", "ui ", "user research", "interaction designer", "product designer", "design system", "accessibility consultant", "product manager", "technical product", "ai product", "conversational ai", "chatbot", "designer (growth)"],
    description: "Designing digital products, user experiences, interfaces and service journeys.",
  },
  { id: "technical-writing", stream: "Technology, data and AI", label: "Technical writing and documentation",
    keywords: ["technical writer", "documentation specialist"],
    description: "Writing clear instructions, manuals, API documentation and help content.",
  },

  // ---- TRADES ----
  { id: "building-trades", stream: "Skilled trades, construction and engineering", label: "Building and structural trades",
    keywords: ["bricklayer", "stonemason", "concreter", "thatcher", "glazier", "plasterer", "tiler", "painter", "ceiling", "partition", "roofer", "waterproofing", "scaffolder", "floor layer", "drywall", "insulation", "damp proofer", "steeplejack", "carpet", "swimming pool", "fibreglass"],
    description: "Hands-on trades that build, finish and maintain structures.",
  },
  { id: "wood-metal-trades", stream: "Skilled trades, construction and engineering", label: "Wood, metal and precision trades",
    keywords: ["cabinetmaker", "joiner", "carpenter", "restoration carpenter", "upholsterer", "jeweller", "watch", "locksmith", "signwriter", "gunsmith", "sheetmetal", "patternmaker", "toolmaker", "welder", "boilermaker", "rigger", "cooper", "pipefitter", "diver (construction", "welding inspector", "boat builder", "sailmaker", "taxidermist", "wig maker", "leatherworker"],
    description: "Craft and precision work with wood, metal and specialist materials.",
  },
  { id: "mechanical-auto-trades", stream: "Skilled trades, construction and engineering", label: "Mechanical, auto and engine trades",
    keywords: ["mechanic", "diesel", "motor ", "motorcycle", "bicycle", "auto electric", "panel beater", "spray painter", "tyre", "trailer body", "windscreen", "outboard", "small engine", "power tool", "generator", "tractor ", "agricultural mechanic", "earthmoving", "marine mechanic", "minibus taxi mechanic"],
    description: "Repairing and maintaining engines, vehicles and machinery.",
  },
  { id: "electrical-plumbing-trades", stream: "Skilled trades, construction and engineering", label: "Electrical, plumbing, gas and HVAC",
    keywords: ["electrician", "wireman", "tester", "plumber", "drainlayer", "gas installer", "refrigeration", "air-condition", "heat pump", "heat pump", "ventilation", "lift ", "elevator", "escalator", "millwright", "instrument", "electrical tester"],
    description: "Installing and fixing power, water, gas, refrigeration and related systems.",
  },
  { id: "installations-specialist", stream: "Skilled trades, construction and engineering", label: "Installations, security and telecoms",
    keywords: ["fibre optic", "solar pv", "solar geyser", "renewable energy installer", "wind turbine service", "ev ", "electric vehicle", "fence erector", "electric fence", "gate", "garage door", "security system", "access control", "satellite", "dstv", "cctv", "borehole pump", "irrigation technician"],
    description: "Installing solar, security, telecoms and specialist on-site systems.",
  },

  // ---- FINANCE ----
  { id: "accounting-audit", stream: "Finance, admin and business operations", label: "Accounting, audit and tax",
    keywords: ["accountant", "auditor", "bookkeeper", "tax ", "vat", "cost clerk", "management accountant", "accounting technician", "cima", "saipa", "forensic account", "forensic audit", "performance audit", "payroll", "fixed asset", "accounts payable", "accounts receivable", "billing", "municipal billing", "salaries and wages", "sars", "debt counsellor", "transfer pricing"],
    description: "Tracking, verifying and reporting on money, tax and financial records.",
  },
  { id: "banking-finance", stream: "Finance, admin and business operations", label: "Banking, investments and insurance",
    keywords: ["bank", "investment", "portfolio manager", "stockbroker", "equity", "derivatives", "foreign exchange", "trader", "hedge fund", "private equity", "venture capital", "treasury", "cash management", "insurance", "underwriter", "broker", "claims", "loss adjuster", "reinsurance", "actuar", "bond originator", "home loans", "vehicle finance", "medical scheme", "pension fund"],
    description: "Banking, lending, investing, insurance and managing financial products.",
  },
  { id: "property-finance", stream: "Finance, admin and business operations", label: "Property, estates and real estate",
    keywords: ["estate agent", "property ", "real estate", "valuer", "conveyancer", "notary", "deeds office", "sectional title", "managing agent", "body corporate"],
    description: "Property sales, valuation, ownership transfers and management.",
  },
  { id: "compliance-risk-finance", stream: "Finance, admin and business operations", label: "Compliance, risk and financial control",
    keywords: ["compliance", "risk analyst", "risk manager", "credit controller", "credit risk", "market risk", "operational risk", "aml", "anti-money", "fais", "b-bbee", "internal control", "fraud", "financial modelling"],
    description: "Keeping organisations compliant, controlled and protected from financial risk.",
  },
  { id: "admin-clerical", stream: "Finance, admin and business operations", label: "Admin, office and clerical work",
    keywords: ["clerk", "administrator", "personal assistant", "secretary", "receptionist", "switchboard", "office manager", "conveyancing secretary", "filing", "records ", "tender", "bid committee", "public service administrator", "tax clerk"],
    description: "Office support, records, coordination and admin work that keeps organisations running.",
  },
  { id: "fintech-modern", stream: "Finance, admin and business operations", label: "Fintech, crypto and digital finance",
    keywords: ["fintech", "cryptocurrency", "digital asset", "sustainability reporting", "microfinance", "stokvel"],
    description: "Emerging digital finance, crypto, sustainability reporting and community finance.",
  },

  // ---- HEALTH ----
  { id: "medicine-specialists", stream: "Health, care and social services", label: "Doctors, specialists and surgeons",
    keywords: ["doctor", "general practitioner", "physician", "specialist", "surgeon", "anaesthesiologist", "cardiologist", "paediatrician", "obstetrician", "gynaecologist", "orthopaedic", "neurosurgeon", "plastic surgeon", "emergency medicine", "psychiatrist", "radiologist", "pathologist", "haematologist", "oncologist", "urologist", "ophthalmologist", "ent ", "dermatologist", "family physician", "intern", "community service medical", "clinical pharmacologist", "clinical associate", "medical intern"],
    description: "Medical doctors, specialists and surgeons working in clinics and hospitals.",
  },
  { id: "nursing-midwifery", stream: "Health, care and social services", label: "Nursing and midwifery",
    keywords: ["nurse", "nursing", "midwife", "enrolled nurse", "staff nurse", "auxiliary", "nurse manager"],
    description: "Registered, enrolled and auxiliary nurses and midwives across hospital and community settings.",
  },
  { id: "allied-health", stream: "Health, care and social services", label: "Allied health and therapy",
    keywords: ["pharmacist", "pharmacy", "dentist", "dental", "oral hygienist", "optometrist", "optician", "radiographer", "physiotherapist", "biokineticist", "occupational therapist", "speech", "audiolog", "dietician", "psychologist", "social worker", "podiatrist", "orthotist", "prosthetist", "orthopaedic technician", "hearing aid", "phlebotomist", "audiometry", "chiropractor", "homeopath", "reflexologist", "aromatherapist", "traditional chinese", "massage therapist"],
    description: "Pharmacists, therapists, psychologists and other registered health professionals.",
  },
  { id: "emergency-ems", stream: "Health, care and social services", label: "Emergency medical services and paramedics",
    keywords: ["paramedic", "emergency medical", "emergency care", "basic ambulance", "baa", "ect", "cca", "critical care paramedic", "anaesthetic technician", "operating department", "perfusionist", "home-based care", "community health worker"],
    description: "Paramedics, EMTs and emergency care staff who respond to medical crises.",
  },
  { id: "veterinary-animal", stream: "Health, care and social services", label: "Veterinary and animal health",
    keywords: ["veterin", "animal health", "veterinary", "vet "],
    description: "Caring for animals in private practice, farming, wildlife and state vet services.",
  },
  { id: "wellness-community", stream: "Health, care and social services", label: "Community, wellness and public health",
    keywords: ["wellness", "telehealth", "clinical coder", "medical billing", "health data analyst", "clinical research", "hiv/aids", "tb nurse", "malaria", "child and youth care", "epidemiologist", "public health", "environmental health", "health promotion", "occupational hygien", "disaster management"],
    description: "Community care, public health, health data and wellness programmes.",
  },

  // ---- EDUCATION ----
  { id: "school-teaching", stream: "Education, training and youth development", label: "School teaching (all phases)",
    keywords: ["teacher", "foundation phase", "intermediate phase", "senior phase", "fet phase", "grade r", "ecd", "mathematics teacher", "physical sciences teacher", "life sciences teacher", "geography teacher", "history teacher", "english", "afrikaans", "isizulu", "mathematical literacy", "accounting teacher", "business studies teacher", "economics teacher", "cat teacher", "information technology teacher", "engineering graphics", "consumer studies", "hospitality teacher", "visual arts teacher", "music teacher", "life orientation teacher", "drama teacher", "dance teacher", "school sports coach", "lsend", "special needs", "autism", "remedial", "abed"],
    description: "Teachers in Grade R through FET across all subjects and school phases.",
  },
  { id: "school-leadership", stream: "Education, training and youth development", label: "School leadership and support",
    keywords: ["principal", "deputy principal", "hod (school)", "school admin", "bursar", "school counsellor", "school librarian", "school social", "school psychologist", "sgb", "psychometrist", "inclusive education", "sign language teacher", "braille"],
    description: "Principals, HODs, admin and learner-support staff in schools.",
  },
  { id: "higher-ed", stream: "Education, training and youth development", label: "University, TVET and lecturing",
    keywords: ["lecturer", "university lecturer", "professor", "postdoc", "tvet college", "dean ", "academic development", "research professor", "higher education"],
    description: "Lecturers, professors, deans and support staff at TVET colleges and universities.",
  },
  { id: "training-assessment", stream: "Education, training and youth development", label: "Training, assessment and skills development",
    keywords: ["tutor", "teacher assistant", "driving instructor", "assessor", "moderator", "trade test", "artisan rpl", "wsp", "skills development", "sdf", "training facilitator", "facilitator", "coach (life", "career advisor", "career coach", "study skills", "online learning", "edtech", "instructional designer", "curriculum advisor", "learner support", "abed practitioner", "tefl", "esl", "invigilator", "marker", "textbook author"],
    description: "Trainers, assessors, coaches and curriculum staff in SETA, corporate and community training.",
  },
  { id: "youth-community", stream: "Education, training and youth development", label: "Youth and community development",
    keywords: ["youth worker", "youth mentor"],
    description: "Out-of-school youth work, mentoring and community development support.",
  },

  // ---- AGRICULTURE ----
  { id: "crop-farming", stream: "Agriculture, food and environment", label: "Crop and grain farming",
    keywords: ["farmer", "small-scale", "commercial grain", "maize", "wheat", "sunflower", "oilseed", "vegetable farmer", "tomato", "potato", "cotton", "tobacco", "sugar cane", "subsistence", "urban farmer", "farm foreman", "farm labourer", "farm hand", "fruit picker", "harvester", "citrus picker", "vegetable harvester", "mielie"],
    description: "Producing grains, vegetables, fruit and other crops.",
  },
  { id: "horticulture", stream: "Agriculture, food and environment", label: "Fruit, wine and horticulture",
    keywords: ["citrus farmer", "deciduous fruit", "subtropical", "macadamia", "pecan", "rooibos", "table grape", "wine grape", "viticulturist", "wine maker", "winemaker", "vine", "cellar", "distiller", "brew", "cider", "horticulturist", "landscap", "floriculturist", "florist", "greenkeeper", "olive farm"],
    description: "Fruit, wine, nuts, flowers and ornamental growing.",
  },
  { id: "livestock-farming", stream: "Agriculture, food and environment", label: "Livestock and animal farming",
    keywords: ["livestock", "dairy", "poultry", "cattle", "sheep", "goat", "pig", "ostrich", "game farmer", "crocodile", "egg production", "chicken layer", "broiler", "dairy herd", "wool classer", "shearer", "beekeeper", "apiculturist"],
    description: "Raising cattle, sheep, poultry, game and other livestock.",
  },
  { id: "fishing-aquaculture", stream: "Agriculture, food and environment", label: "Fishing and aquaculture",
    keywords: ["fishing", "fisher", "fishery", "skipper", "deckhand", "fish hatchery", "tilapia", "mussel", "oyster", "abalone", "aquaculture"],
    description: "Sea and freshwater fishing, plus farmed fish and shellfish.",
  },
  { id: "food-processing", stream: "Agriculture, food and environment", label: "Food processing and artisanal food",
    keywords: ["butcher", "baker", "pastry", "confectioner", "chocolatier", "cheese", "yoghurt", "butter", "mill operator", "food safety", "food processing", "canning", "dairy plant", "beverage bottling", "soft drink", "biltong", "meat inspector", "abattoir", "slaughterer", "game meat"],
    description: "Processing meat, dairy, baked goods and beverages.",
  },
  { id: "agri-science", stream: "Agriculture, food and environment", label: "Agricultural science and technical support",
    keywords: ["agricultural economist", "agronomist", "soil scientist", "plant pathologist", "entomologist (agricultural", "animal scientist", "poultry nutritionist", "livestock nutritionist", "pasture scientist", "agricultural engineer", "irrigation", "agricultural extension", "food microbiologist", "water microbiologist"],
    description: "Agricultural scientists, engineers and extension officers supporting farmers.",
  },
  { id: "conservation-forestry", stream: "Agriculture, food and environment", label: "Conservation, forestry and wildlife",
    keywords: ["forester", "forestry", "game ranger", "field guide", "wildlife", "anti-poaching", "range ecologist", "biodiversity", "wetland", "invasive species", "protected areas", "veld fire", "tracking", "conservation", "ecotourism", "carbon farming", "climate adaptation", "permaculture", "pollinator", "beekeeper"],
    description: "Forests, game reserves, wildlife management and conservation.",
  },

  // ---- LOGISTICS ----
  { id: "road-transport", stream: "Logistics, transport and supply chain", label: "Road transport and driving",
    keywords: ["truck driver", "bus driver", "taxi driver", "delivery driver", "courier", "ride-hailing", "e-hailing", "fuel tanker", "abnormal load", "hazchem", "minibus", "tour bus", "school bus", "code c1", "ec)", "intercity", "metro", "driver (bike", "furniture removal", "rider (app", "bicycle parcel"],
    description: "Driving trucks, buses, taxis, vans and delivery vehicles on South African roads.",
  },
  { id: "rail-port-air", stream: "Logistics, transport and supply chain", label: "Rail, ports and air transport",
    keywords: ["train driver", "train conductor", "shunter", "railway", "prasa", "station master", "marshalling yard", "railway signal", "rolling stock", "ship", "harbour", "port ", "tug master", "stevedore", "dock worker", "ships agent", "captain", "able seafarer", "marine pilot", "coast guard", "airline pilot", "cabin crew", "air traffic", "helicopter pilot", "aircraft maint", "air cargo", "freight forward", "ramp agent", "baggage handler", "airline dispatcher", "flight operations", "loadmaster", "drone pilot"],
    description: "Moving people and goods by rail, sea and air.",
  },
  { id: "warehousing", stream: "Logistics, transport and supply chain", label: "Warehousing, forklifts and stock",
    keywords: ["forklift", "reach truck", "warehouse", "picker", "packer", "packaging", "stock controller", "inventory", "materials handler", "order fulfilment", "returns processor", "scanner operator", "sorter"],
    description: "Working inside warehouses, DCs and storage yards.",
  },
  { id: "supply-chain", stream: "Logistics, transport and supply chain", label: "Supply chain, planning and freight",
    keywords: ["logistics manager", "supply chain", "fleet controller", "fleet maintenance", "distribution", "demand planner", "freight", "customs", "clearing agent", "ships chandler", "container", "gantry crane", "straddle carrier", "ship planner", "bonded warehouse", "import clerk", "export clerk", "tariff specialist", "cold chain", "last-mile", "e-commerce fulfilment", "postal", "mail sorter", "post office", "dispatch clerk"],
    description: "Planning, coordinating and moving goods end-to-end.",
  },
  { id: "vehicle-road-safety", stream: "Logistics, transport and supply chain", label: "Vehicle testing and road safety",
    keywords: ["dangerous goods", "vehicle tracker", "traffic officer", "driving licence", "vehicle testing", "road traffic", "pothole", "marshall", "lashing"],
    description: "Vehicle testing, traffic control and dangerous-goods safety.",
  },

  // ---- LAW & PUBLIC SAFETY ----
  { id: "legal-professions", stream: "Law, public service and public safety", label: "Legal professions",
    keywords: ["attorney", "advocate", "candidate attorney", "pupil", "conveyancer", "notary", "magistrate", "judge", "prosecutor", "state attorney", "state legal", "public defender", "legal aid", "paralegal", "family advocate", "human rights lawyer", "labour lawyer", "cyber law", "environmental law", "mediator", "arbitrator", "copyright", "ip lawyer", "tax lawyer", "insolvency", "business rescue", "liquidator", "immigration", "consumer rights", "refugee", "family mediator", "legislative drafter"],
    description: "Attorneys, advocates, paralegals, judges and specialist lawyers.",
  },
  { id: "police-investigations", stream: "Law, public service and public safety", label: "Policing, investigation and forensics",
    keywords: ["police", "saps", "detective", "captain", "colonel", "general", "k9", "tactical response", "public order", "reservist", "forensic analyst", "bomb squad", "forensic pathologist", "crime scene", "ballistics", "forensic anthropologist", "forensic science", "dna analyst", "toxicologist"],
    description: "SAPS officers, detectives, forensic teams and specialised policing units.",
  },
  { id: "public-safety-emergency", stream: "Law, public service and public safety", label: "Fire, emergency and disaster services",
    keywords: ["firefighter", "fire chief", "fire crew", "fire brigade", "hazmat", "emergency services dispatcher", "10111", "emergency control", "disaster", "rescue", "ems rescue", "high angle", "swift water", "mountain search", "nsri", "sea rescue", "air mercy", "wildland fire"],
    description: "Firefighters, emergency dispatch, disaster management and rescue teams.",
  },
  { id: "traffic-corrections", stream: "Law, public service and public safety", label: "Traffic, metro police and corrections",
    keywords: ["traffic officer", "metro police", "by-law", "correctional", "parole", "probation", "sheriff", "child protection"],
    description: "Traffic officers, metro police, correctional services and community safety.",
  },
  { id: "government-civic", stream: "Law, public service and public safety", label: "Government, civic and regulatory roles",
    keywords: ["municipal manager", "ward councillor", "ward committee", "mayor", "member of parliament", "mpl", "premier", "government minister", "director-general", "policy analyst", "home affairs", "immigration officer", "passport control", "elections officer", "iec", "labour inspector", "ohs inspector", "mine health", "green scorpion", "environmental management inspector", "community development worker", "municipal councillor", "diplomat"],
    description: "Elected and appointed public servants, inspectors and regulators.",
  },
  { id: "compliance-privacy", stream: "Law, public service and public safety", label: "Compliance, POPIA and risk governance",
    keywords: ["compliance officer", "popia", "data protection officer", "labour relations officer"],
    description: "Compliance, privacy and labour relations roles across sectors.",
  },

  // ---- CREATIVE ----
  { id: "design-visual", stream: "Creative, media and design", label: "Design, illustration and visual art",
    keywords: ["graphic designer", "illustrator", "packaging", "publication", "typography", "logo", "infographic", "motion graphics", "designer", "photo retoucher", "digital marketing designer", "comic book", "muralist", "storyboard", "concept artist", "character designer", "3d printing"],
    description: "Designers, illustrators and visual creators in print and digital.",
  },
  { id: "copy-content-marketing", stream: "Creative, media and design", label: "Copy, content and marketing",
    keywords: ["copywriter", "content strateg", "content creator", "influencer", "youtuber", "streamer", "tiktok", "conversion copywriter", "creative technologist"],
    description: "Copy, content strategy, influencer and creator work.",
  },
  { id: "film-tv-production", stream: "Creative, media and design", label: "Film, TV and video production",
    keywords: ["videographer", "cinematographer", "film editor", "vfx", "compositor", "colourist", "gaffer", "best boy", "key grip", "sound recordist", "boom operator", "foley", "adr", "producer", "line producer", "production manager", "continuity", "casting", "stunt", "location manager", "art department", "set dresser", "props", "costume supervisor", "wardrobe", "make-up artist (film", "special effects make-up", "dop", "production coordinator"],
    description: "Production, camera, lighting, sound, post and crew for film and TV.",
  },
  { id: "photo-audio-podcast", stream: "Creative, media and design", label: "Photography, podcast and audio",
    keywords: ["photographer", "photojournalist", "photo editor", "podcast", "voice-over", "audio producer", "sound designer", "dubbing mixer", "voice actor", "jingle", "voice casting", "radio producer", "radio dj", "game audio"],
    description: "Photography, podcast, radio, voice and audio production.",
  },
  { id: "animation-games", stream: "Creative, media and design", label: "Animation, games and 3D",
    keywords: ["animator", "3d", "vfx artist", "game developer (indie", "game engine", "video game narrative"],
    description: "Animation, game development, VFX and 3D work.",
  },
  { id: "advertising-brand", stream: "Creative, media and design", label: "Advertising, brand and art direction",
    keywords: ["art director", "creative director", "advertising", "brand manager", "print production", "bookbinder", "screen printer", "account executive"],
    description: "Agency-side art direction, brand management and production.",
  },
  { id: "ux-design", stream: "Creative, media and design", label: "UX, UI and product design",
    keywords: ["user researcher", "accessibility consultant"],
    description: "UX, UI, accessibility and product interaction design.",
  },

  // ---- SALES ----
  { id: "retail-store", stream: "Sales, marketing and customer work", label: "Retail and in-store sales",
    keywords: ["retail", "shop assistant", "cashier", "store manager", "visual merchand", "buyer / merchandis", "department manager", "area manager", "loss prevention", "mystery shopper", "shelf packer", "trolley", "packer (retail)", "beauty consultant", "fragrance", "cosmetics", "sales associate (luxury", "sales assistant"],
    description: "Retail store staff, cashiers, managers and merchandisers.",
  },
  { id: "b2b-sales", stream: "Sales, marketing and customer work", label: "B2B, field and specialist sales",
    keywords: ["sales representative", "wholesale", "medical sales", "pharmaceutical representative", "car sales", "insurance sales", "furniture sales", "hardware sales", "agricultural equipment", "laboratory equipment", "industrial sales", "office equipment", "it / software account", "saas sales", "channel sales", "key account", "trade sales", "field sales", "network marketer", "promoter", "door-to-door", "trade show", "sdr", "bdr"],
    description: "Field, wholesale, medical, industrial and software sales roles.",
  },
  { id: "real-estate-sales", stream: "Sales, marketing and customer work", label: "Real estate sales",
    keywords: ["real estate agent", "intern", "principal", "estate agent (property"],
    description: "Estate agents, interns and principals in property sales.",
  },
  { id: "contact-centre", stream: "Sales, marketing and customer work", label: "Call centres and customer support",
    keywords: ["call centre", "telesales", "customer service", "customer support", "helpdesk", "technical support agent"],
    description: "Inbound, outbound and support agents in contact centres.",
  },
  { id: "customer-success", stream: "Sales, marketing and customer work", label: "Customer success, marketing and PR",
    keywords: ["customer success manager", "customer experience", "account manager (agency", "partner success", "community manager", "affiliate", "social media sales", "product marketing", "field marketing", "brand strategist", "media planner", "media buyer", "public relations", "corporate communications", "crisis communications", "events marketing", "sponsorship", "exhibition", "fundraiser", "donor relations", "sales operations", "sales enablement", "onboarding specialist", "e-commerce"],
    description: "Customer success, marketing, PR, events and fundraising.",
  },

  // ---- HOSPITALITY ----
  { id: "kitchen-chef", stream: "Hospitality, tourism, sport and events", label: "Kitchen and chef roles",
    keywords: ["chef", "sous chef", "commodity chef", "commis", "kitchen hand", "kitchen porter", "sushi", "pizza", "grill", "vegetarian", "patisserie", "pastry", "banqueting", "butcher chef", "commodity chef", "line cook", "chef de partie", "demi-chef", "chef de cuisine", "executive chef"],
    description: "Chefs, cooks and kitchen staff at all levels.",
  },
  { id: "front-of-house", stream: "Hospitality, tourism, sport and events", label: "Front-of-house, bar and restaurant service",
    keywords: ["waiter", "waitress", "waitron", "host / hostess", "restaurant manager", "barista", "bartender", "mixologist", "bar back", "sommelier", "bar manager", "fast-food", "cashier (restaurant", "restaurant floor", "maitre", "head waiter"],
    description: "Waitrons, bartenders, hosts and restaurant management.",
  },
  { id: "hotels-lodges", stream: "Hospitality, tourism, sport and events", label: "Hotels, lodges and accommodation",
    keywords: ["hotel", "housekeeper", "concierge", "porter", "receptionist", "bellman", "valet", "night manager", "duty manager", "front office", "reservations", "revenue manager", "rooms division", "guest lodge", "lodge", "safari", "game lodge", "airbnb", "short-term rental"],
    description: "Hotels, lodges, guest houses and short-term rental operations.",
  },
  { id: "events-tourism", stream: "Hospitality, tourism, sport and events", label: "Events, tourism and conferencing",
    keywords: ["events", "wedding", "conference", "banqueting", "venue", "catering", "function", "event set-up", "tour guide", "travel agent", "reservation agent", "tourism", "tour operator", "overland", "wine estate tour", "information officer", "destination marketing", "event dj", "sound hire", "tent", "jumping castle", "photobooth", "amapiano event", "exhibition"],
    description: "Events, weddings, conferences, tour guiding and tourism marketing.",
  },
  { id: "gaming-entertainment", stream: "Hospitality, tourism, sport and events", label: "Casinos, pubs and entertainment venues",
    keywords: ["casino", "croupier", "dealer", "bottle store", "liquor store", "tavern", "shebeen", "pub", "barman (pub"],
    description: "Casino gaming, bottle stores, taverns and entertainment venues.",
  },
  { id: "food-delivery", stream: "Hospitality, tourism, sport and events", label: "App-based delivery and fast food",
    keywords: ["food delivery rider", "app-based delivery", "cloud kitchen", "brewmaster", "craft beer", "barista trainer"],
    description: "App-based delivery riders, cloud kitchens and specialist drinks roles.",
  },

  // ---- MANUFACTURING ----
  { id: "production-operations", stream: "Manufacturing, mining and energy", label: "Production and factory operations",
    keywords: ["production supervisor", "production line", "machine operator", "factory manager", "plant manager", "shift supervisor", "production planner", "general worker (factory", "box folding", "assembly", "lean manufacturing", "continuous improvement", "six sigma"],
    description: "Production workers, supervisors, planners and factory management.",
  },
  { id: "engineering-maintenance", stream: "Manufacturing, mining and energy", label: "Engineering and maintenance artisans",
    keywords: ["cnc", "fitter", "welder", "boiler maker", "boilermaker", "electrician (industrial", "millwright", "instrument", "mechanical fitter", "artisan fitter", "maintenance planner", "maintenance fitter", "manufacturing engineer", "industrial engineer", "production engineer", "mechanical engineer (plant", "electrical engineer (plant", "mechatronics", "electronics technician", "calibration", "ndt", "non-destructive", "quality assurance", "quality systems", "quality controller"],
    description: "Fitters, electricians, millwrights, artisans and plant engineers.",
  },
  { id: "mining", stream: "Manufacturing, mining and energy", label: "Mining and mineral processing",
    keywords: ["miner", "mine ", "dump truck", "rock drill", "loco driver", "mining engineer", "mine surveyor", "rock engineer", "ventilation officer", "metallurgist", "mineral processing", "geologist (mining", "geotech", "mine overseer", "mine general", "coal miner", "gold miner", "platinum miner", "diamond", "shotfirer", "blasting"],
    description: "Miners, mining engineers, geologists and mineral processing staff.",
  },
  { id: "energy-utilities", stream: "Manufacturing, mining and energy", label: "Energy, power and utilities",
    keywords: ["power station", "nuclear", "substation", "linesman", "power line", "meter reader", "energy efficiency", "petrochemical", "refinery", "oil", "petroleum engineer", "chemical plant", "process operator", "gas", "water treatment", "waste water", "renewable energy", "solar panel assembler", "battery storage", "ev battery", "energy plant operator"],
    description: "Power generation, refineries, water treatment and renewable energy.",
  },
  { id: "process-industrial", stream: "Manufacturing, mining and energy", label: "Process and heavy industry",
    keywords: ["process engineer", "chemical engineer", "pulp and paper", "sawmill", "timber", "furniture manufactur", "cement", "brickmaking", "brick ", "glass manufactur", "plastic injection", "plastics extrusion", "rubber", "tyre builder", "scrap metal", "recycling plant", "textile machine", "garment cutter", "sewing machinist", "footwear stitcher", "shoe / footwear maker", "knitting", "weaver", "textile dyer", "leather goods"],
    description: "Pulp/paper, timber, cement, plastics, textiles and other process industries.",
  },
  { id: "fuel-pump-mechanics", stream: "Manufacturing, mining and energy", label: "Fuel, auto and vehicle servicing",
    keywords: ["petrol/diesel attendant", "petrol attendant", "service station", "filling station", "diesel mechanic", "auto electrician"],
    description: "Service station attendants and vehicle servicing staff.",
  },

  // ---- INFORMAL ----
  { id: "spaza-retail-informal", stream: "Informal, entrepreneurship and community economy", label: "Spaza shops and street trade",
    keywords: ["spaza", "street vendor", "hawker", "fruit and vegetable", "mielie", "airtime", "prepaid", "rica", "sim card", "cell phone accessories", "second-hand clothing", "flea market", "car boot", "cross-border trader", "cold drink", "ice seller", "newspaper vendor", "car guard", "car wash", "spaza shop", "bottle store", "liquor store"],
    description: "Spaza shops, street vendors, flea markets and informal retail.",
  },
  { id: "food-informal", stream: "Informal, entrepreneurship and community economy", label: "Informal food and township food",
    keywords: ["kota", "bunny chow", "vetkoek", "amagwinya", "magwinya", "boerewors", "shisa nyama", "braai", "snoek", "fried chips", "taxi rank food", "factory canteen", "school tuck", "traditional beer", "umqombothi", "mopani", "braai / shisa nyama"],
    description: "Kota, shisa nyama, magwinya and other township and street food operators.",
  },
  { id: "personal-services-informal", stream: "Informal, entrepreneurship and community economy", label: "Personal and beauty services",
    keywords: ["hairdresser", "barber", "salon", "hair braider", "plaiter", "weave", "nail technician", "eyelash", "brow", "make-up artist (freelance", "mobile spray tan"],
    description: "Informal salons, braiding, nails, lashes and mobile beauty services.",
  },
  { id: "gig-drivers", stream: "Informal, entrepreneurship and community economy", label: "Gig drivers, couriers and delivery",
    keywords: ["ride-hailing driver", "e-hailing", "app-based delivery", "courier driver (app", "online reseller", "dropshipper"],
    description: "Uber/Bolt, Mr D, Checkers Sixty60 and other app-based gig workers.",
  },
  { id: "skilled-informal", stream: "Informal, entrepreneurship and community economy", label: "Skilled trades in the informal economy",
    keywords: ["tailor", "seamstress", "dressmaker", "alterations", "clothing designer", "traditional attire", "imibhaco", "shoe repairer", "cobbler", "key cutter", "painter (house", "handyman", "carpet cleaner", "window cleaner", "gutter", "movers", "furniture removal", "pool cleaner", "grass cutter", "lawn care", "tree feller", "garden refuse", "air-conditioning & refrigeration", "appliance repair", "mobile phone repair", "small-scale clothing", "social media manager (freelance"],
    description: "Independent trades, repair services, garden/home services and freelance skills.",
  },
  { id: "security-informal", stream: "Informal, entrepreneurship and community economy", label: "Private security and guarding",
    keywords: ["security guard", "armed response", "control room operator", "cctv monitor", "private security", "event security", "retail security", "cargo guard", "cctv control", "bouncer", "door security", "cctv monitor officer", "cash-in-transit", "armoured vehicle"],
    description: "Armed response, retail, event and private security guards.",
  },
  { id: "community-traditional", stream: "Informal, entrepreneurship and community economy", label: "Community and traditional services",
    keywords: ["child-minder", "domestic worker", "gardener", "day labourer", "general worker", "car wash attendant", "park attendant", "traffic marshal", "leaflet", "pamphlet", "messenger", "car parking", "traditional healer", "sangoma", "inyanga", "herbalist", "diviner", "traditional surgeon", "ingcibi", "muti", "funeral parlour", "mortuary", "zaz", "taxi owner", "taxi marshal", "minibus taxi mechanic", "domestic worker", "parking attendant", "au pair", "nanny", "baby nurse", "caretaker", "house sitter", "pet sitter", "dog walker", "pet groomer", "dog trainer", "kennel", "horse groom", "farrier", "jockey", "aftercare"],
    description: "Traditional healers, domestic work, child minding, funeral services and community support.",
  },

  // ---- SCIENCE ----
  { id: "lab-science", stream: "Science, research and frontier careers", label: "Laboratory and analytical science",
    keywords: ["chemist", "microbiologist", "biochemist", "laboratory", "lab ", "water quality", "air quality", "quality control laboratory", "microbiology laboratory", "chromatography", "spectroscopist", "metallurgical assayer"],
    description: "Lab analysts, technicians and quality-control scientists.",
  },
  { id: "bioscience-medical", stream: "Science, research and frontier careers", label: "Biological, biomedical and medical science",
    keywords: ["biotechnologist", "geneticist", "molecular biolog", "cell biolog", "immunolog", "virolog", "pharmacolog", "biomedical", "clinical technologist", "nuclear medicine", "radiotherapy", "dosimetrist", "medical physicist", "clinical research"],
    description: "Biotech, genetics, immunology, biomedical and clinical lab scientists.",
  },
  { id: "earth-enviro", stream: "Science, research and frontier careers", label: "Earth, environmental and climate science",
    keywords: ["geolog", "geophysic", "meteorolog", "oceanograph", "astronomer", "zoolog", "botanist", "ecolog", "entomolog", "marine biolog", "hydrolog", "palaeontologist", "volcanolog", "seismolog", "cartographer", "surveyor", "town planner", "urban designer", "regional planner", "gis", "remote sensing", "climate change", "coastal management", "environmental impact", "environmental consultant", "environmental auditor", "solid waste", "renewable energy researcher", "conservation science", "ornithologist", "herpetologist", "science lab safety"],
    description: "Geology, ecology, climate, planning, GIS and environmental science.",
  },
  { id: "physical-maths-science", stream: "Science, research and frontier careers", label: "Physical, mathematical and data science",
    keywords: ["mathematician", "statistician", "physicist", "biostatistician", "data scientist (research", "quantum", "space weather", "astronautical", "nuclear scientist", "hydrogen fuel", "energy storage"],
    description: "Maths, physics, stats, data science and frontier physical science.",
  },
  { id: "research-academia", stream: "Science, research and frontier careers", label: "Research, academia and science communication",
    keywords: ["research assistant", "phd", "research methodologist", "science grant", "laboratory manager", "patent examiner", "science communicator", "journalist (science"],
    description: "Researchers, academics, lab managers and science communicators.",
  },

  // ---- ARTS ----
  { id: "fine-art-craft", stream: "Arts, culture, heritage and society", label: "Fine art, craft and heritage",
    keywords: ["fine artist", "sculptor", "ceramic", "potter", "printmaking", "mosaic", "textile artist", "installation artist", "performance artist", "basket weaver", "beadwork", "cooper", "art gallery", "museum", "curator", "archiv", "art restorer", "conservator", "frame maker", "book conservator", "heritage", "historical researcher", "genealog", "oral historian", "librarian", "rare books", "records manager", "knowledge manager", "metadata"],
    description: "Visual artists, craft workers, curators, archivists and librarians.",
  },
  { id: "writing-publishing", stream: "Arts, culture, heritage and society", label: "Writing, journalism and publishing",
    keywords: ["author", "novelist", "poet", "journalist", "news reporter", "editor", "sub-editor", "proofreader", "translator", "interpreter", "sign language", "food writer", "travel writer", "blogger", "technical author", "ghostwriter", "literary agent", "publishing editor", "literary translator", "technical translator", "court interpreter", "healthcare interpreter", "localisation", "subtitler", "closed captioner", "subtitle editor", "cultural journalist", "political journalist", "investigative", "business journalist", "sports journalist", "entertainment journalist", "fashion journalist"],
    description: "Writers, journalists, editors, translators and publishing professionals.",
  },
  { id: "music-perf", stream: "Arts, culture, heritage and society", label: "Music, performance and events",
    keywords: ["musician", "composer", "conductor", "choir", "music producer", "hip-hop", "kwaito", "gqom", "amapiano", "afro-pop", "jazz", "classical musician", "session guitarist", "session ", "recording engineer", "mastering engineer", "live sound", "opera singer", "ballet dancer", "dancer", "choreographer", "traditional dancer", "cultural dancer", "maskanda", "gospel", "comedian", "puppeteer", "magician", "circus", "clown", "event mc", "master of ceremonies", "stage manager", "theatre producer", "theatre director", "lighting designer (theatre", "sound designer (theatre", "actor", "theatre director", "scriptwriter"],
    description: "Musicians, producers, dancers, actors, comedians and live performance.",
  },
  { id: "broadcasting", stream: "Arts, culture, heritage and society", label: "Broadcasting, radio and TV presenting",
    keywords: ["radio ", "tv presenter", "television news anchor", "talk show host", "weather presenter", "sports commentator", "radio program", "radio news reader", "community radio"],
    description: "Radio, TV presenting and broadcast production.",
  },

  // ---- MANAGEMENT ----
  { id: "c-suite", stream: "Management, strategy and leadership", label: "Executive leadership and C-suite",
    keywords: ["managing director", "ceo", "coo", "cfo", "cmo", "chro", "cto", "cdo", "ciso", "chief", "board chair", "non-executive director", "company secretary", "strategy director"],
    description: "CEOs, CFOs, CTOs and other executive / board-level roles.",
  },
  { id: "general-management", stream: "Management, strategy and leadership", label: "General and operations management",
    keywords: ["general manager", "operations manager", "office administrator", "management trainee", "executive assistant"],
    description: "General, operations and administrative management roles.",
  },
  { id: "hr-people", stream: "Management, strategy and leadership", label: "HR, people and talent",
    keywords: ["human resources", "hr generalist", "hr business partner", "hr consultant", "training and development", "recruitment", "headhunter", "executive search", "talent", "compensation", "employee wellness", "industrial psychologist", "organisational psychologist", "psychometrist (independent", "diversity", "labour relations specialist", "learning and development"],
    description: "HR, recruitment, training, industrial psychology and people management.",
  },
  { id: "marketing-comms-mgmt", stream: "Management, strategy and leadership", label: "Marketing, PR and communications",
    keywords: ["marketing manager", "sales manager", "pr officer", "communications manager", "public relations", "remote work / hybrid", "business development"],
    description: "Marketing, sales leadership, PR and corporate communications.",
  },
  { id: "project-program", stream: "Management, strategy and leadership", label: "Project, programme and portfolio management",
    keywords: ["project manager", "business analyst", "systems analyst", "business process", "pmo", "prince2", "pmp", "program manager", "portfolio manager", "product owner", "scrum master", "agile coach", "change manager"],
    description: "Project managers, BAs, PMOs, Scrum Masters and change managers.",
  },
  { id: "consulting-strategy", stream: "Management, strategy and leadership", label: "Consulting, strategy and advisory",
    keywords: ["management consultant", "strategy consultant", "organisational development", "m&a", "deal origination", "franchise development"],
    description: "Management, strategy, OD and M&A consultants.",
  },
  { id: "procurement-supply-mgmt", stream: "Management, strategy and leadership", label: "Procurement, supply chain and contracts",
    keywords: ["supply chain manager", "procurement manager", "procurement officer", "buyer / procurement", "supply chain analyst", "contract manager", "vendor manager"],
    description: "Procurement, supply chain and contract management.",
  },
  { id: "risk-quality-safety", stream: "Management, strategy and leadership", label: "Risk, quality, health and safety",
    keywords: ["quality manager", "risk manager", "health and safety", "ohs manager", "she manager", "safety officer", "environmental management system", "health and safety representative", "enterprise risk", "business continuity", "internal control manager", "fraud prevention", "data protection officer (dpo", "esg / sustainability manager"],
    description: "Quality, OHS, risk, BCM and compliance management roles.",
  },
  { id: "smmcoop-dev", stream: "Management, strategy and leadership", label: "SMME, co-operatives and enterprise development",
    keywords: ["enterprise development", "incubation", "co-operative", "smmc", "smmc", "local economic development", "led officer"],
    description: "Enterprise development, incubators, co-ops and LED roles.",
  },

  // ---- ELEMENTARY ----
  { id: "cleaning-domestic", stream: "Elementary and entry-level work", label: "Cleaning and domestic work",
    keywords: ["cleaner", "janitor", "sweeper", "street cleaner", "toilet cleaner", "office cleaner", "hotel room", "hospital cleaner", "school cleaner", "university cleaner", "mall cleaner", "window washer", "window cleaner", "housekeeper (hotel)", "hotel laundry", "dry cleaning", "ironing", "chimney", "domestic worker"],
    description: "Cleaners, domestic workers and laundry staff.",
  },
  { id: "labourers-hand", stream: "Elementary and entry-level work", label: "General labourers and hand work",
    keywords: ["general worker", "packer", "kitchen assistant", "scullery", "porter", "packaging line", "farm labourer", "construction labourer", "mine labourer", "sawmill labourer", "fisheries labourer", "shop packer", "trolley", "park attendant", "traffic marshal", "messenger", "leaflet", "pamphlet", "parking", "car wash", "petrol attendant", "factory general worker", "bottle recycling", "warehouse sweeper", "brickyard", "cement bagging", "demolition", "asphalt", "pothole", "fence construction", "railway track", "pipeline", "winch operator", "conveyor belt", "night shift", "flyer", "bill poster", "tea assistant", "bike courier", "funeral pallbearer", "garden service", "apartment block caretaker", "security gate guard", "refuse", "waste collector", "recycling sorter", "landfill", "leaflet / newspaper", "leaflet / pamphlet", "bicycle parcel", "filling station"],
    description: "General workers, labourers and entry-level hands-on work across sectors.",
  },
  { id: "entry-digital", stream: "Elementary and entry-level work", label: "Entry-level digital and data work",
    keywords: ["data entry clerk", "social media moderator", "cloud kitchen crew"],
    description: "Entry-level digital, moderation and cloud-kitchen roles.",
  },

  // ---- ARMED FORCES ----
  { id: "army-combat", stream: "Armed forces and security services", label: "Army, combat and infantry",
    keywords: ["sandf", "infantry", "paratrooper", "parabat", "recce", "special forces", "armour", "tank", "artillery", "army corporal", "army sergeant", "captain", "lieutenant colonel", "battalion", "military police", "army combat medic", "corporal", "sergeant", "combat officer", "military dog handler"],
    description: "Army infantry, armour, artillery, paratroopers and special forces.",
  },
  { id: "navy-airforce", stream: "Armed forces and security services", label: "Navy, Air Force and military support",
    keywords: ["navy", "sailor", "deck hand", "navigator", "combat officer (navy", "marine soldier", "navy engineering", "air force", "saaf", "pilot (military", "helicopter pilot", "fighter pilot", "transport pilot", "air traffic controller (military", "aircraft maintenance (military", "loadmaster (military", "avionics", "signals", "military band", "military chef", "military finance", "military logistics", "military storeman", "military chaplain", "military transport", "military legal", "military procurement", "war college", "reserve force", "military training", "drill sergeant"],
    description: "SA Navy, SAAF, logistics, bands, training and military support.",
  },
  { id: "military-specialist", stream: "Armed forces and security services", label: "Military specialist roles",
    keywords: ["military doctor", "military nurse", "military psychologist", "military intelligence", "counter-intelligence", "sigint", "cyber operator", "cyber warfare", "uav", "drone pilot (military", "satellite communications (military", "field engineer (combat", "eod", "bomb disposal", "demolitions", "ammunition technician"],
    description: "Military intelligence, cyber, medical, EOD and specialist roles.",
  },
  { id: "close-protection", stream: "Armed forces and security services", label: "Close protection, investigations and armed response",
    keywords: ["close protection", "bodyguard", "vip protection", "vip protection officer", "celebrity bodyguard", "close protection team leader", "armed response officer", "private military", "private investigation", "polygraph"],
    description: "Bodyguards, armed response, private investigators and polygraph examiners.",
  },
];

/**
 * Assign every career route to a direction by token overlap. Splits the title
 * into lower-cased word tokens (ignoring punctuation and parentheses) and picks
 * the direction whose keyword token-set produces the largest overlap with the
 * title tokens. Ties broken by whether the direction's keywords contain a multi-
 * word phrase substring of the title. If still tied (or zero overlap), the route
 * falls back to the "Other / general" bucket for its stream.
 */
export function assignRouteToDirection(route) {
  const titleLower = ` ${route.title.toLowerCase()} `;
  const titleTokens = new Set(tokenize(route.title));

  let best = null;
  let bestScore = 0;
  for (const dir of CAREER_DIRECTIONS) {
    if (dir.stream !== route.stream) continue;
    let score = 0;
    for (const kw of dir.keywords) {
      // Multi-word phrase match: keyword must appear as a whole substring.
      const kwTrim = kw.trim();
      if (kwTrim.includes(" ")) {
        if (titleLower.includes(` ${kwTrim} `) || titleLower.startsWith(`${kwTrim} `) || titleLower.endsWith(` ${kwTrim}`)) {
          score += 10;
        }
      } else {
        if (titleTokens.has(kwTrim)) score += 5;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = dir;
    }
  }
  if (best && bestScore >= 5) return best.id;
  return `other-${slugify(route.stream)}`;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Returns directions grouped by stream, with each direction having an array of
 * assigned route ids. Useful for the drill-down UI.
 */
export function buildDirectionIndex(routes) {
  const byId = new Map();
  // seed explicit directions
  for (const d of CAREER_DIRECTIONS) {
    byId.set(d.id, { ...d, routeIds: [] });
  }
  const fallbackBuckets = new Map();
  for (const r of routes) {
    const dirId = assignRouteToDirection(r);
    if (byId.has(dirId)) {
      byId.get(dirId).routeIds.push(r.id);
    } else {
      if (!fallbackBuckets.has(dirId)) {
        const stream = r.stream;
        fallbackBuckets.set(dirId, {
          id: dirId,
          stream,
          label: `Other ${stream.replace(/,.*/, "")} roles`,
          keywords: [],
          description: `A catch-all bucket for ${stream.toLowerCase()} roles not yet mapped to a named direction.`,
          routeIds: [],
          isOther: true,
        });
      }
      fallbackBuckets.get(dirId).routeIds.push(r.id);
    }
  }
  return [...byId.values(), ...fallbackBuckets.values()];
}

/**
 * Sensible related-career matching: prefer routes in the SAME CAREER DIRECTION
 * first, then same stream, then OFO 6-digit code overlap, plus a keyword-similarity
 * tiebreaker using shared title tokens. Falls back to stream adjacency only if
 * smarter matches fail. This replaces the naive "next-2-in-sorted-array" logic
 * that produced nonsensical pairings (Anaesthesiologist ↔ Animal Health Tech).
 */
export function findRelatedCareers(route, allRoutes, directionIndex, maxCount = 4) {
  const direction = directionIndex.find((d) => d.routeIds.includes(route.id));
  const directionIds = new Set(direction ? direction.routeIds.filter((id) => id !== route.id) : []);
  const streamIds = new Set(allRoutes.filter((r) => r.stream === route.stream && r.id !== route.id).map((r) => r.id));

  const routeTokens = new Set(tokenize(route.title));

  // Score every other route.
  const scored = [];
  for (const other of allRoutes) {
    if (other.id === route.id) continue;
    let score = 0;
    if (directionIds.has(other.id)) score += 10;
    if (streamIds.has(other.id)) score += 3;
    // OFO 6-digit code prefix (first 9 chars) — same unit group
    const codeA = (route.ofoCode ?? "").slice(0, 10);
    const codeB = (other.ofoCode ?? "").slice(0, 10);
    if (codeA && codeA === codeB) score += 8;
    // OFO 4-digit minor group
    if (codeA.slice(0, 8) && codeA.slice(0, 8) === codeB.slice(0, 8)) score += 4;
    // Shared title tokens
    const otherTokens = tokenize(other.title);
    const shared = otherTokens.filter((t) => routeTokens.has(t)).length;
    score += shared * 2;
    // Penalise very different signal profiles
    scored.push({ id: other.id, score });
  }
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored.slice(0, maxCount).map((s) => s.id);
}

function tokenize(title) {
  return String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

const STOP_WORDS = new Set(["and", "the", "for", "with", "via", "per", "out", "off", "top", "all"]);
