import React, { useState, useId, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  User,
  FolderGit2,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Target,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { resumeAssistAI } from '../../utils/aiClient';
import { useToast } from '../../context/ToastContext';

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  school: string;
  location: string;
  graduationYear: string;
  gpaOrHonors?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  skills: string;
  link?: string;
  bullet: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface ResumeData {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  skills: string[];
  toolsAndTech: string[];
  softSkills: string[];
  experiences: WorkExperience[];
  education: Education[];
  projects: ProjectItem[];
  certifications: Certification[];
}

// Preset Industry Templates
const SAMPLE_TEMPLATES: Record<string, { label: string; data: ResumeData }> = {
  software: {
    label: 'Senior Software Engineer',
    data: {
      fullName: 'Alex Morgan',
      targetRole: 'Senior Full-Stack Software Engineer',
      email: 'alex.morgan@email.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexmorgan-dev',
      website: 'github.com/alexmorgan',
      summary:
        'Senior Full-Stack Engineer with 6+ years of experience architecting resilient cloud-native web applications and distributed microservices. Proven expertise in React, TypeScript, Node.js, and AWS. Spearheaded migration of legacy monolith to Kubernetes, increasing deployment velocity by 40% and reducing infrastructure overhead by 25%.',
      skills: [
        'TypeScript',
        'React.js',
        'Node.js',
        'Next.js',
        'Python',
        'GraphQL',
        'RESTful APIs',
        'PostgreSQL',
        'MongoDB',
        'Docker',
        'Kubernetes',
        'AWS (EC2, S3, Lambda)',
        'CI/CD Pipelines',
        'Microservices Architecture',
      ],
      toolsAndTech: ['Git', 'Docker', 'Redis', 'Jest', 'Terraform', 'Postman', 'Datadog', 'Tailwind CSS'],
      softSkills: ['Cross-Functional Leadership', 'Agile / Scrum', 'System Design', 'Code Review', 'Mentorship'],
      experiences: [
        {
          id: 'exp-1',
          title: 'Senior Software Engineer',
          company: 'CloudScale Technologies',
          location: 'San Francisco, CA',
          startDate: '2023-01',
          endDate: 'Present',
          current: true,
          bullets: [
            'Architected and deployed distributed event-driven processing pipeline handling 15M+ daily transactions with 99.99% service uptime.',
            'Spearheaded frontend performance overhaul using React and code-splitting, reducing Time to Interactive (TTI) by 45%.',
            'Mentored a team of 6 junior and mid-level engineers, instituting rigorous code review standards and unit testing coverage of 92%.',
          ],
        },
        {
          id: 'exp-2',
          title: 'Full Stack Engineer',
          company: 'Nexus Digital Labs',
          location: 'San Jose, CA',
          startDate: '2020-06',
          endDate: '2022-12',
          current: false,
          bullets: [
            'Engineered customer-facing analytics dashboard using TypeScript, Next.js, and PostgreSQL, increasing daily active engagement by 32%.',
            'Implemented automated CI/CD deployment pipelines on GitHub Actions, cutting staging release cycles from 3 hours to 15 minutes.',
            'Collaborated with product and UX teams to build accessible, WCAG-compliant design system components adopted across 4 core products.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          school: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          graduationYear: '2020',
          gpaOrHonors: 'Magna Cum Laude (GPA: 3.85/4.0)',
        },
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Distributed Task Queue Orchestrator',
          skills: 'TypeScript, Redis, BullMQ, Docker',
          link: 'github.com/alexmorgan/task-orchestrator',
          bullet:
            'Engineered open-source distributed job queue processing 5,000+ jobs/sec with automatic dead-letter queue retry semantics and real-time dashboard.',
        },
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          year: '2024',
        },
      ],
    },
  },
  product: {
    label: 'Product Manager',
    data: {
      fullName: 'Sarah Jenkins',
      targetRole: 'Senior Technical Product Manager',
      email: 'sarah.jenkins@email.com',
      phone: '+1 (555) 876-5432',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/sarahjenkins-pm',
      website: 'sarahjenkins.io',
      summary:
        'Data-driven Senior Technical Product Manager with 5+ years of experience leading B2B SaaS product strategy from zero-to-one and scaling platforms to $12M ARR. Adept at translating complex customer requirements into high-impact product roadmaps, coordinating engineering sprints, and accelerating user retention by 28%.',
      skills: [
        'Product Strategy',
        'Roadmap Planning',
        'User Research & Discovery',
        'Agile / Scrum Leadership',
        'A/B Testing & Experimentation',
        'Data Analytics (SQL, Amplitude)',
        'Go-To-Market (GTM) Execution',
        'Stakeholder Alignment',
        'PRD & User Story Writing',
      ],
      toolsAndTech: ['Jira', 'Figma', 'Amplitude', 'Mixpanel', 'SQL', 'Postman', 'Tableau', 'Linear', 'Notion'],
      softSkills: ['Executive Presentation', 'Cross-Functional Alignment', 'Customer Empathy', 'Negotiation'],
      experiences: [
        {
          id: 'exp-1',
          title: 'Senior Product Manager',
          company: 'Vanguard SaaS Platforms',
          location: 'New York, NY',
          startDate: '2022-03',
          endDate: 'Present',
          current: true,
          bullets: [
            'Led cross-functional team of 12 engineers and 2 product designers to launch enterprise automation suite, generating $2.4M ARR in the first 6 months.',
            'Formulated data-driven onboarding experiments resulting in a 34% decrease in customer churn and a 22% increase in 30-day user activation.',
            'Conducted 60+ in-depth enterprise client interviews to define quarterly roadmap priorities and executive PRDs.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Arts',
          field: 'Economics & Information Systems',
          school: 'Columbia University',
          location: 'New York, NY',
          graduationYear: '2019',
          gpaOrHonors: 'Dean’s List',
        },
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Self-Serve Billing & Tier Upgrade Portal',
          skills: 'Stripe API, SQL, Amplitude, Product Strategy',
          bullet:
            'Spearheaded zero-touch billing portal rollout, migrating 4,000+ customer accounts and improving expansion revenue by 18%.',
        },
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'Certified Scrum Product Owner (CSPO)',
          issuer: 'Scrum Alliance',
          year: '2023',
        },
      ],
    },
  },
  marketing: {
    label: 'Growth & Digital Marketing Lead',
    data: {
      fullName: 'David Chen',
      targetRole: 'Growth & Digital Marketing Lead',
      email: 'david.chen@email.com',
      phone: '+1 (555) 432-1098',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/davidchen-growth',
      website: 'davidchengrowth.com',
      summary:
        'Growth Marketing Lead with 5+ years of experience scaling acquisition funnels, paid media campaigns, and organic SEO strategies for venture-backed startups. Managed $1.5M+ annual ad budgets across Google, Meta, and LinkedIn with an average ROAS of 3.8x while reducing Customer Acquisition Cost (CAC) by 31%.',
      skills: [
        'Growth Marketing',
        'Performance Marketing (SEM/PPC)',
        'SEO & Content Strategy',
        'Conversion Rate Optimization (CRO)',
        'Paid Social Ads (Meta, LinkedIn)',
        'Email Automation & Lifecycle',
        'Marketing Attribution Modeling',
        'A/B Testing & Funnel Analysis',
      ],
      toolsAndTech: ['Google Ads', 'Google Analytics 4', 'HubSpot', 'Meta Ads Manager', 'Semrush', 'Looker', 'Webflow', 'Zapier'],
      softSkills: ['Analytical Problem Solving', 'Budget Allocation', 'Creative Copywriting', 'Team Leadership'],
      experiences: [
        {
          id: 'exp-1',
          title: 'Growth Marketing Lead',
          company: 'HyperScale Media',
          location: 'Austin, TX',
          startDate: '2022-01',
          endDate: 'Present',
          current: true,
          bullets: [
            'Scaled paid acquisition channels from $30K/mo to $140K/mo profitably, delivering a 180% year-over-year increase in qualified enterprise leads.',
            'Revamped organic content and technical SEO architecture, driving 250,000+ monthly organic visitors and ranking #1 for 45 high-intent keywords.',
            'Optimized lead capture landing pages through multi-variant testing, lifting visitor-to-demo conversion rates from 2.4% to 5.1%.',
          ],
        },
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Business Administration',
          field: 'Marketing & Analytics',
          school: 'University of Texas at Austin',
          location: 'Austin, TX',
          graduationYear: '2020',
        },
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Automated Lifecycle Email Retention Engine',
          skills: 'HubSpot, Customer.io, SQL, CRO',
          bullet:
            'Architected 7-stage automated behavioral onboarding email sequence, lifting 90-day subscription renewal rates by 27%.',
        },
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'Google Ads & Analytics Certified Professional',
          issuer: 'Google',
          year: '2024',
        },
      ],
    },
  },
};

const ATS_ACTION_VERBS = [
  'Architected',
  'Spearheaded',
  'Engineered',
  'Accelerated',
  'Orchestrated',
  'Optimized',
  'Delivered',
  'Designed',
  'Implemented',
  'Reduced',
  'Increased',
  'Automated',
  'Pioneered',
  'Streamlined',
  'Revamped',
];

const SKILL_PACKS: Record<string, string[]> = {
  'Software & Full-Stack': [
    'TypeScript',
    'React.js',
    'Node.js',
    'Next.js',
    'Python',
    'PostgreSQL',
    'REST APIs',
    'GraphQL',
    'Docker',
    'AWS',
    'CI/CD',
    'Microservices',
  ],
  'Product & Management': [
    'Product Strategy',
    'Roadmap Planning',
    'Agile / Scrum',
    'User Research',
    'A/B Testing',
    'PRDs',
    'SQL Analytics',
    'Stakeholder Management',
    'GTM Strategy',
  ],
  'Data & AI Engineering': [
    'Python',
    'SQL',
    'Machine Learning',
    'Pandas',
    'PyTorch',
    'Data Pipelines',
    'Snowflake',
    'Tableau',
    'Spark',
    'Cloud Data Warehousing',
  ],
  'Marketing & Growth': [
    'SEO Optimization',
    'Google Ads',
    'Growth Marketing',
    'Conversion Rate Optimization',
    'HubSpot',
    'Google Analytics 4',
    'Copywriting',
    'Email Campaigns',
  ],
  'Finance & Operations': [
    'Financial Modeling',
    'P&L Management',
    'Forecasting',
    'Excel Advanced',
    'Process Automation',
    'Budgeting',
    'KPI Tracking',
    'ERP Systems',
  ],
};

type ResumeTemplateId = 'executive' | 'harvard' | 'minimal' | 'modern';

export const ResumeMakerStudio: React.FC = () => {
  const { showDownloadToast, showSuccessToast } = useToast();
  const [resume, setResume] = useState<ResumeData>(SAMPLE_TEMPLATES.software.data);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>('executive');
  const [activeTab, setActiveTab] = useState<'contact' | 'summary' | 'experience' | 'skills' | 'education' | 'projects' | 'job_match'>('contact');
  
  // Job Description Matching
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [isMatchingJob, setIsMatchingJob] = useState(false);
  const [jobMatchResult, setJobMatchResult] = useState<{
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  } | null>(null);

  // AI Loading States
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [polishingBulletId, setPolishingBulletId] = useState<string | null>(null);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // New Skill Input
  const [newSkillText, setNewSkillText] = useState('');
  const [skillCategory, setSkillCategory] = useState<'skills' | 'toolsAndTech' | 'softSkills'>('skills');

  // Compute Real-Time ATS Score & Audit Metrics
  const atsAudit = useMemo(() => {
    let score = 50; // baseline
    const checks: { label: string; passed: boolean; note: string }[] = [];

    // 1. Contact Information
    const hasEmail = Boolean(resume.email && resume.email.includes('@'));
    const hasPhone = Boolean(resume.phone && resume.phone.length > 7);
    const hasLocation = Boolean(resume.location);
    const contactPassed = hasEmail && hasPhone && hasLocation;
    if (contactPassed) score += 10;
    checks.push({
      label: 'Standard Contact Header',
      passed: contactPassed,
      note: contactPassed ? 'Email, phone, and city/state are properly formatted.' : 'Add complete email, phone, and location.',
    });

    // 2. Summary
    const summaryLength = resume.summary.trim().split(/\s+/).length;
    const summaryPassed = summaryLength >= 25 && summaryLength <= 90;
    if (summaryPassed) score += 10;
    checks.push({
      label: 'Concise Professional Summary',
      passed: summaryPassed,
      note: summaryPassed ? `${summaryLength} words (optimal range 30-80 words).` : 'Summary should be 3-4 impactful sentences (30-80 words).',
    });

    // 3. Work Experience & Quantified Metrics
    const totalBullets = resume.experiences.flatMap((e) => e.bullets);
    const hasQuantifiableMetrics = totalBullets.some((b) => /\b\d+(?:\.\d+)?%|\$\d+|\b\d+\b/i.test(b));
    if (resume.experiences.length >= 1 && totalBullets.length >= 2) score += 10;
    if (hasQuantifiableMetrics) score += 10;
    checks.push({
      label: 'Work Experience with Quantified Impact',
      passed: hasQuantifiableMetrics && totalBullets.length >= 2,
      note: hasQuantifiableMetrics
        ? 'Contains measurable impact numbers, percentages (%), and scope metrics.'
        : 'Add quantifiable metrics (e.g. "increased speed by 35%", "$2M revenue").',
    });

    // 4. Action Verbs
    const hasStrongVerbs = totalBullets.some((b) =>
      ATS_ACTION_VERBS.some((verb) => b.toLowerCase().includes(verb.toLowerCase()))
    );
    if (hasStrongVerbs) score += 10;
    checks.push({
      label: 'Strong Action Verbs (STAR Method)',
      passed: hasStrongVerbs,
      note: hasStrongVerbs ? 'Uses strong leadership action verbs.' : 'Start bullets with past-tense action verbs (e.g., Spearheaded, Engineered).',
    });

    // 5. Skills Keyword Count
    const totalSkills = resume.skills.length + resume.toolsAndTech.length + resume.softSkills.length;
    const skillsPassed = totalSkills >= 8;
    if (skillsPassed) score += 10;
    checks.push({
      label: 'ATS Keyword & Skill Density',
      passed: skillsPassed,
      note: `${totalSkills} categorized skills present (recommended 8-20).`,
    });

    return {
      score: Math.min(score, 98),
      checks,
    };
  }, [resume]);

  // Load Preset Template
  const handleLoadSample = (key: string) => {
    if (SAMPLE_TEMPLATES[key]) {
      setResume(JSON.parse(JSON.stringify(SAMPLE_TEMPLATES[key].data)));
      setJobMatchResult(null);
    }
  };

  // AI: Generate or Polish Summary
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await resumeAssistAI({
        action: 'generate_summary',
        role: resume.targetRole,
        skills: [...resume.skills, ...resume.toolsAndTech],
        currentSummary: resume.summary,
      });
      if (res.success && res.result) {
        setResume((prev) => ({ ...prev, summary: res.result }));
      }
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // AI: Polish a specific bullet point using STAR
  const handlePolishBullet = async (expId: string, bulletIdx: number) => {
    const exp = resume.experiences.find((e) => e.id === expId);
    if (!exp) return;
    const rawBullet = exp.bullets[bulletIdx];
    if (!rawBullet) return;

    setPolishingBulletId(`${expId}-${bulletIdx}`);
    try {
      const res = await resumeAssistAI({
        action: 'improve_bullet',
        role: resume.targetRole || exp.title,
        rawText: rawBullet,
      });
      if (res.success && res.result) {
        setResume((prev) => ({
          ...prev,
          experiences: prev.experiences.map((e) => {
            if (e.id !== expId) return e;
            const updated = [...e.bullets];
            updated[bulletIdx] = res.result;
            return { ...e, bullets: updated };
          }),
        }));
      }
    } finally {
      setPolishingBulletId(null);
    }
  };

  // AI: Suggest Top Skills for Target Role
  const handleSuggestSkills = async () => {
    if (!resume.targetRole) return;
    setIsSuggestingSkills(true);
    try {
      const res = await resumeAssistAI({
        action: 'suggest_skills',
        role: resume.targetRole,
      });
      if (res.success && Array.isArray(res.result)) {
        setResume((prev) => {
          const combined = Array.from(new Set([...prev.skills, ...res.result]));
          return { ...prev, skills: combined };
        });
      }
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  // AI: Job Description Matcher
  const handleMatchJobDescription = async () => {
    if (!jobDescriptionInput.trim()) return;
    setIsMatchingJob(true);
    try {
      const resumePlainText = `
${resume.fullName} - ${resume.targetRole}
${resume.summary}
Skills: ${[...resume.skills, ...resume.toolsAndTech, ...resume.softSkills].join(', ')}
Experience:
${resume.experiences.map((e) => `${e.title} at ${e.company} (${e.startDate} - ${e.endDate}):\n${e.bullets.join('\n')}`).join('\n\n')}
`;
      const res = await resumeAssistAI({
        action: 'job_match',
        rawText: resumePlainText,
        jobDescription: jobDescriptionInput,
      });
      if (res.success) {
        setJobMatchResult(res);
      }
    } finally {
      setIsMatchingJob(false);
    }
  };

  // Add Missing Keyword from Job Match directly into Resume Skills
  const handleAddKeywordToSkills = (keyword: string) => {
    if (!resume.skills.includes(keyword)) {
      setResume((prev) => ({
        ...prev,
        skills: [...prev.skills, keyword],
      }));
    }
  };

  // Add Custom Skill
  const handleAddSkill = () => {
    if (!newSkillText.trim()) return;
    const trimmed = newSkillText.trim();
    setResume((prev) => {
      const list = prev[skillCategory];
      if (!list.includes(trimmed)) {
        return { ...prev, [skillCategory]: [...list, trimmed] };
      }
      return prev;
    });
    setNewSkillText('');
  };

  // Remove Skill
  const handleRemoveSkill = (category: 'skills' | 'toolsAndTech' | 'softSkills', skillName: string) => {
    setResume((prev) => ({
      ...prev,
      [category]: prev[category].filter((s) => s !== skillName),
    }));
  };

  // Add Skill Pack
  const handleAddSkillPack = (skillsToAdd: string[]) => {
    setResume((prev) => ({
      ...prev,
      skills: Array.from(new Set([...prev.skills, ...skillsToAdd])),
    }));
  };

  // Add New Experience
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      title: 'Software Engineer',
      company: 'Company Name',
      location: 'City, State',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      bullets: ['Spearheaded core feature development, increasing system throughput by 25%.'],
    };
    setResume((prev) => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
  };

  // Remove Experience
  const handleRemoveExperience = (id: string) => {
    setResume((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  };

  // Add Bullet to Experience
  const handleAddBullet = (expId: string) => {
    setResume((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => {
        if (e.id !== expId) return e;
        return { ...e, bullets: [...e.bullets, 'Delivered high-impact project milestone on schedule.'] };
      }),
    }));
  };

  // Remove Bullet from Experience
  const handleRemoveBullet = (expId: string, idx: number) => {
    setResume((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => {
        if (e.id !== expId) return e;
        return { ...e, bullets: e.bullets.filter((_, i) => i !== idx) };
      }),
    }));
  };

  // Generate Clean Plain Text (for clipboard or ATS direct paste)
  const generatePlainTextResume = () => {
    return `${resume.fullName.toUpperCase()}
${resume.targetRole}
${resume.email} | ${resume.phone} | ${resume.location}
${resume.linkedin ? `LinkedIn: ${resume.linkedin}` : ''} ${resume.website ? `| Portfolio: ${resume.website}` : ''}

==================================================
PROFESSIONAL SUMMARY
==================================================
${resume.summary}

==================================================
CORE COMPETENCIES & TECHNICAL SKILLS
==================================================
• Technical Skills: ${resume.skills.join(', ')}
${resume.toolsAndTech.length > 0 ? `• Tools & Frameworks: ${resume.toolsAndTech.join(', ')}` : ''}
${resume.softSkills.length > 0 ? `• Leadership & Soft Skills: ${resume.softSkills.join(', ')}` : ''}

==================================================
PROFESSIONAL EXPERIENCE
==================================================
${resume.experiences
  .map(
    (exp) => `${exp.title.toUpperCase()} | ${exp.company} (${exp.location})
${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
${exp.bullets.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

==================================================
EDUCATION
==================================================
${resume.education
  .map(
    (edu) => `${edu.degree} in ${edu.field} | ${edu.school}, ${edu.location} (${edu.graduationYear})
${edu.gpaOrHonors ? `Honors: ${edu.gpaOrHonors}` : ''}`
  )
  .join('\n\n')}

${
  resume.projects.length > 0
    ? `==================================================
PROJECTS
==================================================
${resume.projects
  .map((p) => `${p.name} (${p.skills}) ${p.link ? `| ${p.link}` : ''}\n• ${p.bullet}`)
  .join('\n\n')}`
    : ''
}

${
  resume.certifications.length > 0
    ? `==================================================
CERTIFICATIONS
==================================================
${resume.certifications.map((c) => `• ${c.name} - ${c.issuer} (${c.year})`).join('\n')}`
    : ''
}
`.trim();
  };

  // Copy Plain Text to Clipboard
  const handleCopyPlainText = () => {
    navigator.clipboard.writeText(generatePlainTextResume());
    setCopiedText(true);
    showSuccessToast('ATS plain-text resume copied to clipboard for direct portal pasting.', 'Resume Copied');
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Export 100% Vector ATS-Compliant PDF using jsPDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4', // 595.28 x 841.89 pt
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    let y = 48;

    // Check if new page is needed
    const checkPageBreak = (neededSpace = 30) => {
      if (y + neededSpace > 800) {
        doc.addPage();
        y = 48;
      }
    };

    // Header: Name
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 25, 35);
    doc.text(resume.fullName || 'YOUR NAME', pageWidth / 2, y, { align: 'center' });
    y += 18;

    // Header: Target Role
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50, 60, 80);
    doc.text(resume.targetRole.toUpperCase() || 'PROFESSIONAL TITLE', pageWidth / 2, y, { align: 'center' });
    y += 14;

    // Header: Contact Details
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 90, 100);
    const contactParts = [
      resume.email,
      resume.phone,
      resume.location,
      resume.linkedin,
      resume.website,
    ].filter(Boolean);
    doc.text(contactParts.join('  •  '), pageWidth / 2, y, { align: 'center' });
    y += 18;

    // Section Helper
    const renderSectionHeader = (title: string) => {
      checkPageBreak(35);
      y += 6;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42); // slate 900
      doc.text(title.toUpperCase(), margin, y);
      y += 4;
      // ATS compliant single hairline separator
      doc.setDrawColor(200, 205, 215);
      doc.setLineWidth(0.75);
      doc.line(margin, y, margin + contentWidth, y);
      y += 12;
    };

    // 1. PROFESSIONAL SUMMARY
    if (resume.summary.trim()) {
      renderSectionHeader('Professional Summary');
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 45, 55);
      const splitSummary = doc.splitTextToSize(resume.summary.trim(), contentWidth);
      splitSummary.forEach((line: string) => {
        checkPageBreak(13);
        doc.text(line, margin, y);
        y += 12.5;
      });
      y += 6;
    }

    // 2. CORE SKILLS
    const allSkills = [
      { label: 'Technical Skills', list: resume.skills },
      { label: 'Tools & Platforms', list: resume.toolsAndTech },
      { label: 'Core Competencies', list: resume.softSkills },
    ].filter((s) => s.list.length > 0);

    if (allSkills.length > 0) {
      renderSectionHeader('Technical Skills & Competencies');
      allSkills.forEach((cat) => {
        checkPageBreak(14);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(25, 30, 40);
        const prefix = `•  ${cat.label}: `;
        doc.text(prefix, margin, y);
        const prefixWidth = doc.getTextWidth(prefix);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(50, 55, 65);
        const skillsText = cat.list.join(', ');
        const splitSkills = doc.splitTextToSize(skillsText, contentWidth - prefixWidth);
        
        doc.text(splitSkills[0] || '', margin + prefixWidth, y);
        y += 12;
        for (let i = 1; i < splitSkills.length; i++) {
          checkPageBreak(12);
          doc.text(splitSkills[i], margin + prefixWidth, y);
          y += 12;
        }
      });
      y += 6;
    }

    // 3. WORK EXPERIENCE
    if (resume.experiences.length > 0) {
      renderSectionHeader('Professional Experience');
      resume.experiences.forEach((exp) => {
        checkPageBreak(40);
        
        // Job Title & Dates Line
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(exp.title, margin, y);

        const dateRange = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(70, 80, 95);
        doc.text(dateRange, margin + contentWidth, y, { align: 'right' });
        y += 12;

        // Company & Location Line
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(50, 60, 75);
        doc.text(`${exp.company}  |  ${exp.location}`, margin, y);
        y += 11;

        // Bullets
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(45, 50, 60);

        exp.bullets.forEach((bullet) => {
          checkPageBreak(24);
          doc.text('•', margin + 6, y);
          const splitBullet = doc.splitTextToSize(bullet, contentWidth - 18);
          splitBullet.forEach((bLine: string, idx: number) => {
            if (idx > 0) checkPageBreak(12);
            doc.text(bLine, margin + 18, y);
            y += 11.5;
          });
        });

        y += 6;
      });
    }

    // 4. EDUCATION
    if (resume.education.length > 0) {
      renderSectionHeader('Education');
      resume.education.forEach((edu) => {
        checkPageBreak(30);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${edu.degree} in ${edu.field}`, margin, y);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 80, 95);
        doc.text(edu.graduationYear, margin + contentWidth, y, { align: 'right' });
        y += 11;

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(50, 60, 75);
        doc.text(`${edu.school}, ${edu.location}${edu.gpaOrHonors ? `  •  ${edu.gpaOrHonors}` : ''}`, margin, y);
        y += 14;
      });
    }

    // 5. PROJECTS
    if (resume.projects.length > 0) {
      renderSectionHeader('Key Projects');
      resume.projects.forEach((proj) => {
        checkPageBreak(30);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(proj.name, margin, y);

        if (proj.link) {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(59, 130, 246);
          doc.text(proj.link, margin + contentWidth, y, { align: 'right' });
        }
        y += 11;

        if (proj.skills) {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(90, 100, 115);
          doc.text(`Skills: ${proj.skills}`, margin, y);
          y += 10;
        }

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(45, 50, 60);
        const splitProj = doc.splitTextToSize(`• ${proj.bullet}`, contentWidth);
        splitProj.forEach((line: string) => {
          checkPageBreak(12);
          doc.text(line, margin, y);
          y += 11.5;
        });
        y += 6;
      });
    }

    // 6. CERTIFICATIONS
    if (resume.certifications.length > 0) {
      renderSectionHeader('Certifications & Licenses');
      resume.certifications.forEach((cert) => {
        checkPageBreak(14);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 40, 55);
        doc.text(`•  ${cert.name}`, margin, y);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(80, 90, 100);
        doc.text(`${cert.issuer} (${cert.year})`, margin + contentWidth, y, { align: 'right' });
        y += 13;
      });
    }

    const safeFileName = `${(resume.fullName || 'Resume').replace(/\s+/g, '_')}_ATS_Optimized.pdf`;
    doc.save(safeFileName);

    showDownloadToast(safeFileName, {
      format: 'PDF',
      toolName: 'ATS Resume Maker',
      message: `Exported 100% vector, ATS-friendly resume for ${resume.fullName || 'Candidate'}.`,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Header Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <FileCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    ATS Resume Maker & Precision Optimizer
                  </h1>
                  <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    99.4% ATS Scannable
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Build single-column, parseable resumes designed to pass Workday, Taleo, Greenhouse, and Lever.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions & Live ATS Gauge */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live ATS Score Pill */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2">
              <div className="relative flex items-center justify-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ${
                  atsAudit.score >= 85 ? 'bg-emerald-600 text-white' : atsAudit.score >= 70 ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {atsAudit.score}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">ATS Readiness</div>
                <div className="text-xs font-bold text-slate-800">
                  {atsAudit.score >= 85 ? 'Highly Scannable' : atsAudit.score >= 70 ? 'Good Match' : 'Needs Optimization'}
                </div>
              </div>
            </div>

            {/* Copy Plain Text */}
            <button
              onClick={handleCopyPlainText}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              title="Copy formatted plain text for web job applications"
            >
              {copiedText ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
              <span>{copiedText ? 'Copied Text!' : 'Copy Plain Text'}</span>
            </button>

            {/* Export PDF Button */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Download ATS PDF</span>
            </button>
          </div>
        </div>

        {/* Preset Sample Selector */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">1-Click Role Templates:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(SAMPLE_TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleLoadSample(key)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:text-blue-700 font-semibold text-slate-700 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero unparseable tables or graphics • Standard ISO vector layout</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Builder (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE BUILDER TABS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Navigation Pill Bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'contact', label: 'Contact', icon: User },
              { id: 'summary', label: 'Summary', icon: Sparkles },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'skills', label: 'Skills', icon: Wrench },
              { id: 'education', label: 'Education', icon: GraduationCap },
              { id: 'projects', label: 'Projects', icon: FolderGit2 },
              { id: 'job_match', label: 'JD Matcher', icon: Target, badge: 'AI' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1 rounded font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: CONTACT & PERSONAL INFO */}
          {activeTab === 'contact' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Personal & Contact Information</span>
                </h2>
                <span className="text-[11px] text-slate-400">Header Zone</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resume.fullName}
                    onChange={(e) => setResume({ ...resume, fullName: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Professional Title</label>
                  <input
                    type="text"
                    value={resume.targetRole}
                    onChange={(e) => setResume({ ...resume, targetRole: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={resume.email}
                    onChange={(e) => setResume({ ...resume, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resume.phone}
                    onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location (City, State / Country)</label>
                  <input
                    type="text"
                    value={resume.location}
                    onChange={(e) => setResume({ ...resume, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={resume.linkedin}
                    onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub / Portfolio Website</label>
                  <input
                    type="text"
                    value={resume.website}
                    onChange={(e) => setResume({ ...resume, website: e.target.value })}
                    placeholder="github.com/username or yourportfolio.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFESSIONAL SUMMARY */}
          {activeTab === 'summary' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Professional Summary</span>
                </h2>
                
                {/* AI Summary Assistant */}
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingSummary ? 'Generating...' : '✨ Write with Gemini AI'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Summary (3-4 Sentences Recommended)
                </label>
                <textarea
                  rows={5}
                  value={resume.summary}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  placeholder="Senior engineer with 5+ years of experience delivering scalable systems..."
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Word count: {resume.summary.trim().split(/\s+/).filter(Boolean).length} words</span>
                  <span>ATS Target: 40-75 words</span>
                </div>
              </div>

              {/* Action Verbs Helpers */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>High-Impact Action Verbs to Inject:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ATS_ACTION_VERBS.map((verb) => (
                    <button
                      key={verb}
                      onClick={() => {
                        setResume((prev) => ({
                          ...prev,
                          summary: prev.summary ? `${prev.summary} ${verb}` : verb,
                        }));
                      }}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      +{verb}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <span>Work Experience ({resume.experiences.length})</span>
                </h2>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Position</span>
                </button>
              </div>

              <div className="space-y-4">
                {resume.experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Position #{expIdx + 1}</span>
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete position"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((item) => (item.id === exp.id ? { ...item, title: val } : item)),
                            }));
                          }}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((item) => (item.id === exp.id ? { ...item, company: val } : item)),
                            }));
                          }}
                          placeholder="e.g. Acme Corp"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              experiences: prev.experiences.map((item) => (item.id === exp.id ? { ...item, location: val } : item)),
                            }));
                          }}
                          placeholder="City, State / Remote"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Date Range</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                experiences: prev.experiences.map((item) => (item.id === exp.id ? { ...item, startDate: val } : item)),
                              }));
                            }}
                            placeholder="2022-01"
                            className="w-1/2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                          />
                          <span className="text-slate-400">–</span>
                          <input
                            type="text"
                            disabled={exp.current}
                            value={exp.current ? 'Present' : exp.endDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setResume((prev) => ({
                                ...prev,
                                experiences: prev.experiences.map((item) => (item.id === exp.id ? { ...item, endDate: val } : item)),
                              }));
                            }}
                            placeholder="Present"
                            className="w-1/2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 disabled:bg-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points with STAR polish button */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Achievement Bullets (STAR Format)</span>
                        <button
                          onClick={() => handleAddBullet(exp.id)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {exp.bullets.map((bullet, bIdx) => {
                        const isPolishing = polishingBulletId === `${exp.id}-${bIdx}`;
                        return (
                          <div key={bIdx} className="flex items-start gap-2">
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const val = e.target.value;
                                setResume((prev) => ({
                                  ...prev,
                                  experiences: prev.experiences.map((item) => {
                                    if (item.id !== exp.id) return item;
                                    const updated = [...item.bullets];
                                    updated[bIdx] = val;
                                    return { ...item, bullets: updated };
                                  }),
                                }));
                              }}
                              className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                            />

                            <div className="flex flex-col gap-1 shrink-0">
                              {/* AI STAR Polish Button */}
                              <button
                                onClick={() => handlePolishBullet(exp.id, bIdx)}
                                disabled={isPolishing}
                                title="AI Polish: Convert to STAR method with action verb & metric"
                                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors disabled:opacity-50"
                              >
                                <Sparkles className={`h-3.5 w-3.5 ${isPolishing ? 'animate-spin' : ''}`} />
                              </button>

                              {exp.bullets.length > 1 && (
                                <button
                                  onClick={() => handleRemoveBullet(exp.id, bIdx)}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 transition-colors"
                                  title="Delete bullet"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & COMPETENCIES */}
          {activeTab === 'skills' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  <span>Skills & Keywords ({resume.skills.length + resume.toolsAndTech.length + resume.softSkills.length})</span>
                </h2>

                <button
                  onClick={handleSuggestSkills}
                  disabled={isSuggestingSkills}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isSuggestingSkills ? 'animate-spin' : ''}`} />
                  <span>{isSuggestingSkills ? 'Extracting...' : '✨ Suggest Top Skills'}</span>
                </button>
              </div>

              {/* Add Custom Skill Input */}
              <div className="flex items-center gap-2">
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="skills">Technical Skills</option>
                  <option value="toolsAndTech">Tools & Platforms</option>
                  <option value="softSkills">Soft Skills & Leadership</option>
                </select>

                <input
                  type="text"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Kubernetes, Python, Agile..."
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />

                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Categorized Skills Pills */}
              <div className="space-y-4">
                
                {/* 1. Technical Skills */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>Technical & Hard Skills ({resume.skills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill('skills', skill)}
                          className="text-blue-500 hover:text-blue-800 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. Tools & Frameworks */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Tools & Frameworks ({resume.toolsAndTech.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.toolsAndTech.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                      >
                        {tool}
                        <button
                          onClick={() => handleRemoveSkill('toolsAndTech', tool)}
                          className="text-slate-400 hover:text-slate-700 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Soft Skills */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2">
                    Leadership & Soft Skills ({resume.softSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.softSkills.map((soft) => (
                      <span
                        key={soft}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800"
                      >
                        {soft}
                        <button
                          onClick={() => handleRemoveSkill('softSkills', soft)}
                          className="text-emerald-600 hover:text-emerald-900 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* 1-Click Skill Packs */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700">Quick 1-Click Industry Keyword Packs:</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SKILL_PACKS).map(([name, packSkills]) => (
                    <button
                      key={name}
                      onClick={() => handleAddSkillPack(packSkills)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 text-xs font-semibold text-slate-700 transition-all shadow-xs"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: EDUCATION */}
          {activeTab === 'education' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span>Education & Degrees</span>
                </h2>
              </div>

              {resume.education.map((edu, eduIdx) => (
                <div key={edu.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            education: prev.education.map((item) => (item.id === edu.id ? { ...item, degree: val } : item)),
                          }));
                        }}
                        placeholder="Bachelor of Science"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            education: prev.education.map((item) => (item.id === edu.id ? { ...item, field: val } : item)),
                          }));
                        }}
                        placeholder="Computer Science"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Institution / School</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            education: prev.education.map((item) => (item.id === edu.id ? { ...item, school: val } : item)),
                          }));
                        }}
                        placeholder="University of California, Berkeley"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Graduation Year & Honors</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              education: prev.education.map((item) => (item.id === edu.id ? { ...item, graduationYear: val } : item)),
                            }));
                          }}
                          placeholder="2022"
                          className="w-1/3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={edu.gpaOrHonors || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume((prev) => ({
                              ...prev,
                              education: prev.education.map((item) => (item.id === edu.id ? { ...item, gpaOrHonors: val } : item)),
                            }));
                          }}
                          placeholder="GPA 3.8 / Magna Cum Laude"
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: PROJECTS & CERTIFICATIONS */}
          {activeTab === 'projects' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-blue-600" />
                  <span>Projects & Certifications</span>
                </h2>
              </div>

              {resume.projects.map((proj) => (
                <div key={proj.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            projects: prev.projects.map((p) => (p.id === proj.id ? { ...p, name: val } : p)),
                          }));
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Technologies Used</label>
                      <input
                        type="text"
                        value={proj.skills}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume((prev) => ({
                            ...prev,
                            projects: prev.projects.map((p) => (p.id === proj.id ? { ...p, skills: val } : p)),
                          }));
                        }}
                        placeholder="React, Node.js, AWS"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Description & Impact</label>
                    <textarea
                      rows={2}
                      value={proj.bullet}
                      onChange={(e) => {
                        const val = e.target.value;
                        setResume((prev) => ({
                          ...prev,
                          projects: prev.projects.map((p) => (p.id === proj.id ? { ...p, bullet: val } : p)),
                        }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: JOB DESCRIPTION MATCH (AI ATS AUDIT) */}
          {activeTab === 'job_match' && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>Job Description Matcher & Keyword Gap Audit</span>
                </h2>
                <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  Gemini 3.7 AI
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Paste Target Job Posting / Description
                </label>
                <textarea
                  rows={4}
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste the job description from LinkedIn, Indeed, or company careers page..."
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleMatchJobDescription}
                disabled={isMatchingJob || !jobDescriptionInput.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/25 hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                <Sparkles className={`h-4 w-4 ${isMatchingJob ? 'animate-spin' : ''}`} />
                <span>{isMatchingJob ? 'Analyzing Keyword Match...' : 'Run ATS Job Match Audit'}</span>
              </button>

              {/* Match Results */}
              {jobMatchResult && (
                <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                  <div className="flex items-center justify-between bg-purple-50 p-3.5 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm">
                        {jobMatchResult.matchScore}%
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-900">Job Description Alignment</div>
                        <div className="text-[11px] text-purple-700">
                          {jobMatchResult.matchScore >= 80 ? 'High keyword overlap' : 'Actionable keyword gaps found'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missing Keywords with 1-Click Add */}
                  {jobMatchResult.missingKeywords.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span>Missing High-Priority ATS Keywords (Click to add):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResult.missingKeywords.map((kw) => (
                          <button
                            key={kw}
                            onClick={() => handleAddKeywordToSkills(kw)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                          >
                            <span>+ {kw}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matched Keywords */}
                  {jobMatchResult.matchedKeywords.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Successfully Matched Keywords:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {jobMatchResult.matchedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actionable Advice */}
                  {jobMatchResult.suggestions.length > 0 && (
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-800">Recruiter Recommendations:</div>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {jobMatchResult.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ATS Readiness Audit Checklist Box */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Automated ATS Verification Checklist
              </span>
              <span className="text-[10px] font-bold text-emerald-600">Workday & Taleo Compliant</span>
            </div>

            <div className="space-y-2">
              {atsAudit.checks.map((chk, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  {chk.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className={`font-bold ${chk.passed ? 'text-slate-800' : 'text-amber-800'}`}>
                      {chk.label}
                    </span>
                    <p className="text-[11px] text-slate-500">{chk.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 sticky top-6 space-y-3">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Eye className="h-4 w-4 text-blue-600" />
              <span>Live ATS Document Preview (Standard A4)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1 rounded-lg bg-blue-600 text-white px-3 py-1 text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Download className="h-3 w-3" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Paper Sheet Preview Container (Scale-rendered A4 Document) */}
          <div className="rounded-3xl border border-slate-300/80 bg-slate-100/80 p-3 sm:p-6 shadow-inner overflow-hidden max-h-[85vh] overflow-y-auto">
            
            <div className="bg-white rounded-xl shadow-lg border border-slate-200/90 p-8 sm:p-10 font-sans text-slate-900 space-y-6 max-w-2xl mx-auto selection:bg-blue-100">
              
              {/* Document Header */}
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  {resume.fullName || 'YOUR FULL NAME'}
                </h1>
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {resume.targetRole || 'TARGET PROFESSIONAL TITLE'}
                </div>
                <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 pt-1">
                  {resume.email && <span>{resume.email}</span>}
                  {resume.phone && <span>• {resume.phone}</span>}
                  {resume.location && <span>• {resume.location}</span>}
                  {resume.linkedin && <span>• {resume.linkedin}</span>}
                  {resume.website && <span>• {resume.website}</span>}
                </div>
              </div>

              {/* 1. Summary */}
              {resume.summary.trim() && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-justify">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* 2. Skills */}
              {(resume.skills.length > 0 || resume.toolsAndTech.length > 0) && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Technical Skills & Competencies
                  </h2>
                  <div className="text-xs space-y-1 text-slate-700">
                    {resume.skills.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-900">• Core Skills: </span>
                        <span>{resume.skills.join(', ')}</span>
                      </div>
                    )}
                    {resume.toolsAndTech.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-900">• Tools & Platforms: </span>
                        <span>{resume.toolsAndTech.join(', ')}</span>
                      </div>
                    )}
                    {resume.softSkills.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-900">• Leadership & Methodologies: </span>
                        <span>{resume.softSkills.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Work Experience */}
              {resume.experiences.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Professional Experience
                  </h2>
                  {resume.experiences.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{exp.title}</span>
                        <span className="text-slate-600 font-medium">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">
                        {exp.company} | {exp.location}
                      </div>
                      <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pt-1">
                        {exp.bullets.map((bullet, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Education */}
              {resume.education.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Education
                  </h2>
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{edu.degree} in {edu.field}</span>
                        <span className="text-slate-600 font-medium">{edu.graduationYear}</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {edu.school}, {edu.location}
                        {edu.gpaOrHonors && ` • ${edu.gpaOrHonors}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. Projects */}
              {resume.projects.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Key Projects
                  </h2>
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{proj.name}</span>
                        {proj.link && <span className="text-blue-600 text-[10px] font-mono">{proj.link}</span>}
                      </div>
                      {proj.skills && (
                        <div className="text-[11px] text-slate-500 italic">Skills: {proj.skills}</div>
                      )}
                      <p className="text-xs text-slate-700 leading-relaxed">• {proj.bullet}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 6. Certifications */}
              {resume.certifications.length > 0 && (
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                    Certifications & Licenses
                  </h2>
                  <div className="text-xs space-y-1 text-slate-700">
                    {resume.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between">
                        <span>• {cert.name} – {cert.issuer}</span>
                        <span className="text-slate-500 text-[11px]">{cert.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
