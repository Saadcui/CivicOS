import Link from 'next/link';
import PublicNav from '@/components/public/PublicNav';
import Footer from '@/components/public/Footer';
import { getAuthUser } from '@/lib/auth';
import {
  ArrowRight,
  Shield,
  Activity,
  Users,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Cpu,
  BarChart3,
  Wrench,
  Droplets,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Compass,
  Layers,
  FileCheck2,
  Eye,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const user = await getAuthUser();

  const transformationPillars = [
    {
      title: 'Zero-Friction Citizen Access',
      subtitle: 'Direct Public-to-Department Channel',
      description:
        'Citizens submit localized, geotagged infrastructure reports with photos in under 60 seconds. No call queues, no lost paperwork.',
      icon: Users,
      badge: 'Public Direct',
      color: 'bg-coral text-white',
    },
    {
      title: 'Proactive AI Anomaly Detection',
      subtitle: '24/7 Optical CCTV Surveillance',
      description:
        'Computer vision models continuously inspect city traffic and surveillance feeds to spot potholes, water leaks, and road hazards autonomously.',
      icon: Cpu,
      badge: 'Automated Edge AI',
      color: 'bg-navy text-white',
    },
    {
      title: 'Verifiable Proof of Resolution',
      subtitle: 'Tamper-Proof Work Verification',
      description:
        'Field maintenance crews must submit photographic completion evidence and GPS check-ins before any work order can be officially closed.',
      icon: ShieldCheck,
      badge: 'Auditable SLA',
      color: 'bg-teal text-white',
    },
    {
      title: 'Equitable Urban Resource Allocation',
      subtitle: 'Data-Driven GIS Prioritization',
      description:
        'Live geospatial mapping pinpoints recurring infrastructure wear across all neighborhoods, ensuring repair resources are distributed fairly.',
      icon: BarChart3,
      badge: 'City-Wide GIS',
      color: 'bg-amber-600 text-white',
    },
  ];

  const departmentStandards = [
    {
      code: 'PWD',
      name: 'Public Works Department',
      scope: 'Road asphalt, potholes, structural curbs, sidewalks & bridges',
      sla: '24-48 Hours Standard • 4 Hours Emergency Hazards',
      verification: 'Mandatory before & after photo comparison on site',
      icon: Wrench,
      accent: 'border-l-coral',
    },
    {
      code: 'WSB',
      name: 'Water & Sewage Board',
      scope: 'Pipeline leaks, storm drainage clogs, water pressure & sewer overflows',
      sla: 'Immediate leak isolation • 12 Hours drainage clearing',
      verification: 'Pressure test validation & photographic clearance',
      icon: Droplets,
      accent: 'border-l-teal',
    },
    {
      code: 'ELE',
      name: 'Electrical & Public Lighting',
      scope: 'Streetlight outages, dark pedestrian corridors & traffic signals',
      sla: '2 Hours traffic signals • 24 Hours street lamp repair',
      verification: 'Night-cycle photocell activation verification',
      icon: Lightbulb,
      accent: 'border-l-amber-500',
    },
    {
      code: 'SAN',
      name: 'Sanitation & Waste Management',
      scope: 'Solid waste accumulation, illegal dumping & street sweeping',
      sla: 'Daily scheduled route dispatch • 24 Hours illegal dumping',
      verification: 'Clean-site photographic submission by field supervisor',
      icon: Layers,
      accent: 'border-l-emerald-600',
    },
  ];

  const civicServices = [
    {
      title: 'CITIZEN SERVICES',
      subtitle: 'Report public infrastructure problems and track real-time resolution progress.',
      description:
        'Submit photographic and geolocation-verified reports for potholes, water line bursts, damaged streetlights, or waste accumulation in under 60 seconds.',
      icon: Users,
      badgeColor: 'bg-coral text-white',
      img: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop',
      features: ['Photo & GPS pin location picker', 'End-to-end status tracking', 'Direct officer resolution notes'],
      linkText: 'Submit an Issue',
      href: user ? '/citizen/complaints/new' : '/register',
    },
    {
      title: 'AI CITY MONITORING',
      subtitle: 'Intelligent CCTV edge monitoring detects infrastructure anomalies autonomously.',
      description:
        'Computer vision models process city traffic and public surveillance cameras to spot asphalt degradation, street flooding, and hazardous debris before citizens even notice.',
      icon: Camera,
      badgeColor: 'bg-navy text-white',
      img: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800&auto=format&fit=crop',
      features: ['Automated severity confidence scoring', 'Real-time CCTV optical alerts', 'Proactive maintenance routing'],
      linkText: 'Explore Vision AI',
      href: '#how-it-works',
    },
    {
      title: 'GOVERNMENT ACTION',
      subtitle: 'Transparent complaint orchestration and rapid multi-department execution.',
      description:
        'Municipal engineers and field workers receive pre-triaged work orders with SLA timers, route optimization, and digital proof-of-resolution requirements.',
      icon: Shield,
      badgeColor: 'bg-teal text-white',
      img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop',
      features: ['Departmental isolation & dispatch', 'Photo evidence verification', 'Transparent public audit trails'],
      linkText: 'Officer Portal',
      href: '/login',
    },
  ];

  const civicAdvisories = [
    {
      category: 'Public Works Advisory',
      title: 'Optimizing Issue Submissions for Rapid Field Dispatch',
      description:
        'When reporting road or sidewalk damage, capture both a wide-angle photograph (including street landmarks) and a close-up defect photo. Enabling GPS location metadata allows municipal crews to navigate directly to the site with the correct equipment on the first trip.',
      actionText: 'Report Road Issue',
      href: user ? '/citizen/complaints/new' : '/register',
      icon: Wrench,
      badgeColor: 'bg-coral text-white',
    },
    {
      category: 'Drainage & Environmental Safety',
      title: 'Seasonal Stormwater Drainage Readiness Protocols',
      description:
        'Municipal maintenance teams are conducting scheduled clearing of arterial runoff drains. Residents are encouraged to report blocked catch basins, leaf sedimentation, or water accumulation immediately to prevent urban waterlogging.',
      actionText: 'Report Drainage Blockage',
      href: user ? '/citizen/complaints/new' : '/register',
      icon: Droplets,
      badgeColor: 'bg-teal text-white',
    },
    {
      category: 'Smart City Technology',
      title: 'Autonomous Optical AI CCTV Surveillance Network',
      description:
        'CivicOS integrates real-time optical streams from municipal surveillance corridors. High-confidence detections for surface cracks, street lighting failures, and hazardous debris are automatically queued as verified municipal tickets for officer review.',
      actionText: 'Learn How AI Works',
      href: '#how-it-works',
      icon: Eye,
      badgeColor: 'bg-navy text-white',
    },
  ];

  const departmentContacts = [
    {
      name: 'Public Works Department (PWD)',
      scope: 'Roads, bridges, asphalt potholes & public pavements',
      email: 'pwd@civicos.gov',
      phone: '1-800-CIVIC-PWD',
    },
    {
      name: 'Water & Sewage Board (WSB)',
      scope: 'Pipeline leaks, storm drainage & wastewater control',
      email: 'water@civicos.gov',
      phone: '1-800-CIVIC-H2O',
    },
    {
      name: 'Electrical & Lighting (ELE)',
      scope: 'Streetlight grids, traffic signals & power hazards',
      email: 'electrical@civicos.gov',
      phone: '1-800-CIVIC-GRID',
    },
    {
      name: 'Sanitation Services (SAN)',
      scope: 'Solid waste management & street cleaning dispatch',
      email: 'sanitation@civicos.gov',
      phone: '1-800-CIVIC-WASTE',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav user={user} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40">
          <div className="absolute top-10 right-10 w-96 h-96 bg-coral/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 left-10 w-96 h-96 bg-teal/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-14">
            {/* Live Municipal Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-border shadow-sm mb-8 animate-fade-in">
              <span className="w-2.5 h-2.5 rounded-full bg-coral animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                Next-Gen Municipal Operating System
              </span>
              <span className="text-xs text-text-secondary">•</span>
              <span className="text-xs font-medium text-teal font-mono">Civic Infrastructure Platform</span>
            </div>

            {/* Oversized Bold Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-navy uppercase tracking-tighter leading-[0.95] mb-8 font-display">
              SMARTER CITIES.
              <br />
              <span className="text-coral underline decoration-coral/20 decoration-wavy">
                BETTER LIVES.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed mb-10 font-normal">
              Building responsive, accountable cities through citizen participation, autonomous AI monitoring, and transparent municipal action.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href={user ? (user.role === 'citizen' ? '/citizen/complaints/new' : `/${user.role}`) : '/register'}
                className="btn-coral text-base py-4 px-8 w-full sm:w-auto shadow-lg shadow-coral/20 hover:shadow-coral/30"
              >
                <span>REPORT AN ISSUE</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="#impact"
                className="btn-outline-navy text-base py-4 px-8 w-full sm:w-auto"
              >
                EXPLORE CIVIC IMPACT
              </a>
            </div>
          </div>

          {/* Connected Infrastructure Visual Presentation */}
          <div className="relative mt-8 max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-white p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-stretch">
                {/* Main Visual Photo Banner */}
                <div className="md:col-span-8 relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[420px] group">
                  <img
                    src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&auto=format&fit=crop"
                    alt="Modern city infrastructure and roads"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2 w-fit">
                      <Camera size={13} />
                      <span>Optical AI Surveillance • Live Incident Triage Active</span>
                    </div>
                    <h3 className="font-display font-bold text-xl md:text-2xl text-white">
                      Connected Infrastructure Monitoring
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm mt-1 max-w-lg">
                      Continuous computer vision models analyze municipal camera corridors, automatically indexing structural road defects and routing work orders.
                    </p>
                  </div>
                </div>

                {/* Live Platform Capability Cards */}
                <div className="md:col-span-4 flex flex-col gap-3 md:gap-4 justify-between">
                  {/* Card 1: Autonomous Vision AI */}
                  <div className="civic-card bg-[#F3F3EC] p-5 border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        AI Neural Vision
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        Multi-Class
                      </span>
                    </div>
                    <div className="text-lg font-bold font-display text-navy">
                      Automated Optical Triage
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      Identifies road degradation, drainage clogs, and safety hazards, assigning priority scores before dispatch.
                    </p>
                  </div>

                  {/* Card 2: SLA Commitment */}
                  <div className="civic-card bg-navy text-white p-5">
                    <div className="flex items-center justify-between mb-3 text-white/70">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Accountable Workflow
                      </span>
                      <Clock size={16} className="text-coral" />
                    </div>
                    <div className="text-lg font-black font-display text-white">
                      SLA-Driven Dispatch
                    </div>
                    <p className="text-[11px] text-white/70 mt-2">
                      Direct departmental routing with mandatory photo verification and timestamped audit logs.
                    </p>
                  </div>

                  {/* Card 3: Role-Based Access Callout */}
                  <div className="civic-card p-5 border-border bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center text-teal shrink-0">
                        <Shield size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy truncate">
                          Role-Based Security
                        </div>
                        <div className="text-[11px] text-text-secondary truncate">
                          Dedicated Citizen, Officer & Admin Portals
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section: Civic Transformation & Standards */}
      <section id="impact" className="py-24 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-coral mb-2 block">
                Measurable Civic Transformation
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-display text-navy uppercase">
                HOW CIVICOS DRIVES REAL IMPACT
              </h2>
            </div>
            <p className="text-sm text-text-secondary max-w-md">
              Replacing bureaucratic delays and unverified ticket closures with transparent, SLA-backed municipal execution.
            </p>
          </div>

          {/* 4 Core Pillars of Transformation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {transformationPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="civic-card hover:border-coral/60 group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F3F3EC] flex items-center justify-center text-navy group-hover:bg-coral group-hover:text-white transition-colors">
                      <pillar.icon size={22} />
                    </div>
                    <span className="text-[11px] font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-navy mb-1 group-hover:text-coral transition-colors">
                    {pillar.title}
                  </h3>
                  <div className="text-xs font-bold text-coral mb-3">
                    {pillar.subtitle}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Municipal Service Level Standards Matrix */}
          <div className="rounded-3xl bg-[#F3F3EC] p-8 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
                  Public Service Guarantees
                </span>
                <h3 className="font-display font-black text-2xl text-navy">
                  Municipal Department SLA & Resolution Standards
                </h3>
              </div>
              <span className="text-xs text-text-secondary">
                Verifiable standards across all public works
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentStandards.map((dept) => (
                <div
                  key={dept.code}
                  className={`civic-card bg-white p-5 border-l-4 ${dept.accent} space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                        <dept.icon size={16} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-navy">{dept.name}</h4>
                        <span className="text-[10px] font-mono text-text-secondary uppercase">
                          Code: {dept.code}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Standardized
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary">
                    <strong className="text-navy">Scope:</strong> {dept.scope}
                  </div>

                  <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <span className="text-coral font-bold flex items-center gap-1">
                      <Clock size={13} />
                      <span>{dept.sla}</span>
                    </span>
                    <span className="text-text-secondary font-medium flex items-center gap-1">
                      <FileCheck2 size={13} className="text-teal" />
                      <span>{dept.verification}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Civic Services Section */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-coral mb-2 block">
            Integrated Civic Ecosystem
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-navy uppercase mb-4">
            CIVIC SERVICES
          </h2>
          <p className="text-base text-text-secondary leading-relaxed">
            Three interconnected pillars providing intelligent municipal governance, proactive anomaly monitoring, and frictionless citizen reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {civicServices.map((service, idx) => (
            <div
              key={service.title}
              className="civic-card bg-white flex flex-col justify-between hover:shadow-xl hover:border-navy/20 transition-all duration-300 group"
            >
              <div>
                {/* Circular image header */}
                <div className="relative mb-6">
                  <div className="h-52 w-full rounded-2xl overflow-hidden relative">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-navy/20"></div>
                  </div>
                  <div
                    className={`absolute -bottom-5 left-6 w-12 h-12 rounded-2xl ${service.badgeColor} flex items-center justify-center shadow-md`}
                  >
                    <service.icon size={22} />
                  </div>
                </div>

                <div className="pt-2 px-1">
                  <div className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-1">
                    Pillar 0{idx + 1}
                  </div>
                  <h3 className="font-display font-black text-xl text-navy mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs font-semibold text-coral mb-3">
                    {service.subtitle}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-border">
                    {service.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-xs text-text-primary">
                        <CheckCircle2 size={14} className="text-teal shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href={service.href}
                  className="inline-flex items-center justify-between w-full p-3 rounded-xl bg-[#F3F3EC] hover:bg-navy hover:text-white text-navy font-bold text-xs transition-colors"
                >
                  <span>{service.linkText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#172B4D] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-coral mb-2 block">
              Transparent Municipal Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-base text-white/70">
              From instant optical anomaly identification to verified field resolution in three accountable phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-coral/50 transition-colors relative">
              <span className="text-6xl font-black font-display text-coral/20 absolute top-6 right-6">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-coral flex items-center justify-center text-white mb-6">
                <Users size={22} />
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">
                Report an Issue
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Citizens submit reports with live camera uploads, precise GPS pin-points, and category tagging. Or our system accepts anonymous local inputs.
              </p>
              <div className="text-xs text-coral font-semibold">
                Takes &lt; 60 seconds • Automatic Dept Routing
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-teal/50 transition-colors relative">
              <span className="text-6xl font-black font-display text-teal/30 absolute top-6 right-6">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-teal flex items-center justify-center text-white mb-6">
                <Cpu size={22} />
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">
                Intelligent AI Detection
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Integrated CCTV neural streams detect road potholes, water leaks, traffic hazards, and street debris automatically with confidence scores.
              </p>
              <div className="text-xs text-teal-light font-semibold">
                24/7 Optical Surveillance • Anomaly Triaging
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/50 transition-colors relative">
              <span className="text-6xl font-black font-display text-white/20 absolute top-6 right-6">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-white text-navy flex items-center justify-center mb-6">
                <Shield size={22} />
              </div>
              <h3 className="font-display font-bold text-2xl text-white mb-3">
                Government Action
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Authorized municipal officers review tickets within their department, dispatch field teams, and submit verifiable resolution evidence before closing tickets.
              </p>
              <div className="text-xs text-white/80 font-semibold">
                Photo Proof • Auditable History
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City Updates & Civic Advisories Section */}
      <section id="updates" className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-coral mb-2 block">
              Municipal Operations & Guidance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-navy uppercase">
              CITY UPDATES & CIVIC ADVISORIES
            </h2>
          </div>
          <Link
            href={user ? '/citizen/complaints/new' : '/register'}
            className="inline-flex items-center gap-2 text-sm font-bold text-coral hover:text-coral-dark"
          >
            <span>Submit a Civic Report</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 3 Practical Civic Advisories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {civicAdvisories.map((item) => (
            <div
              key={item.title}
              className="civic-card bg-white p-7 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group border-border"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F3F3EC] text-navy">
                    {item.category}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${item.badgeColor} flex items-center justify-center shadow-sm`}>
                    <item.icon size={18} />
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-navy mb-3 group-hover:text-coral transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-coral hover:text-coral-dark transition-colors"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Official Municipal Helpline & Department Directory */}
        <div className="rounded-3xl bg-white border border-border p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal block mb-1">
                Direct Communications
              </span>
              <h3 className="font-display font-bold text-xl text-navy">
                Official Municipal Department Directory
              </h3>
            </div>
            <span className="text-xs text-text-secondary">
              Verified government communication channels
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departmentContacts.map((dept) => (
              <div
                key={dept.name}
                className="p-4 rounded-2xl bg-[#F3F3EC] border border-border space-y-2 text-xs"
              >
                <div className="font-bold text-navy text-sm">{dept.name}</div>
                <div className="text-text-secondary text-[11px] line-clamp-2">{dept.scope}</div>
                <div className="pt-2 border-t border-border/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Mail size={12} className="text-coral shrink-0" />
                    <span className="font-mono text-[11px] truncate">{dept.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-primary">
                    <Phone size={12} className="text-teal shrink-0" />
                    <span className="font-mono text-[11px]">{dept.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-coral overflow-hidden p-10 sm:p-16 text-white text-center shadow-2xl">
          {/* Decorative background shapes */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-navy/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/20 text-white px-3.5 py-1.5 rounded-full inline-block">
              Take Civic Ownership Today
            </span>
            <h2 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight leading-tight">
              YOUR CITY. YOUR VOICE.
              <br />
              YOUR IMPACT.
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto">
              Whether reporting a neighborhood road hazard or monitoring urban analytics, CivicOS connects citizens with responsive municipal leadership.
            </p>
            <div className="pt-4">
              <Link
                href={user ? '/citizen/complaints/new' : '/register'}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-coral bg-white hover:bg-[#F3F3EC] active:scale-95 transition-all text-base shadow-lg"
              >
                <span>REPORT AN ISSUE</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}