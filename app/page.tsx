'use client'

import { useEffect, useState, type SubmitEvent } from 'react'
import { Award, ArrowUpRight, Building2, Calendar, Check, ChevronLeft, ChevronRight, GraduationCap, Mail, Menu, Play, Quote, X } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { Counter } from '@/components/counter'
import { TiltCard } from '@/components/tilt-card'
import { Marquee } from '@/components/marquee'
import { HeroScene } from '@/components/hero-scene'
import { CustomCursor } from '@/components/custom-cursor'
import { AboutPhoto } from '@/components/about-photo'
import { ChannelChart } from '@/components/channel-chart'
import { ThemeToggle } from '@/components/theme-toggle'
import { RemoteImage } from '@/components/remote-image'
import { Modal } from '@/components/modal'
import { Lightbox } from '@/components/lightbox'
import { PaginationDots } from '@/components/pagination-dots'
import { toneText } from '@/lib/utils'
import { iconMap } from '@/lib/icon-map'
import { useSiteData } from '@/lib/use-site-data'

const CERTS_PER_PAGE = 4
const PROJECTS_PER_PAGE = 3

export default function Page() {
  const { data } = useSiteData()
  const {
    profile, nav, visibility, hero, platformsLabel, platforms, about,
    certificationsHeading, certifications, experienceHeading, experience, educationHeading, education,
    servicesHeading, services,
    socialHeading, socialStats, socialCapabilities,
    processHeading, process, workHeading, projects, testimonials, performanceSnapshot, contact, footer,
  } = data

  // Nav anchors whose section can be hidden via admin settings — hide the
  // matching link too, so it never points at a section that isn't there.
  const navSectionByHref: Record<string, keyof typeof visibility> = {
    '#about': 'about', '#certifications': 'certifications', '#experience': 'experience',
    '#education': 'education', '#services': 'services', '#work': 'work', '#process': 'process',
  }
  const visibleNavLinks = nav.links.filter((link) => {
    const key = navSectionByHref[link.href]
    return !key || visibility[key] !== false
  })

  const [activeProject, setActiveProject] = useState<number | null>(null)
  const [activeCert, setActiveCert] = useState<number | null>(null)
  const [activeCapability, setActiveCapability] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)
  const [testimonial, setTestimonial] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [certPage, setCertPage] = useState(0)
  const [projectPage, setProjectPage] = useState(0)

  const [form, setForm] = useState({ name: '', email: '', budget: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const certPageCount = Math.max(1, Math.ceil(certifications.length / CERTS_PER_PAGE))
  const visibleCerts = certifications.slice(certPage * CERTS_PER_PAGE, certPage * CERTS_PER_PAGE + CERTS_PER_PAGE)

  const projectPageCount = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE))
  const visibleProjects = projects.slice(projectPage * PROJECTS_PER_PAGE, projectPage * PROJECTS_PER_PAGE + PROJECTS_PER_PAGE)

  // Escape-to-close for whichever modal is open, plus a body scroll lock so
  // the page behind it can't scroll while it's up. The lightbox sits on top
  // of the other modals, so Escape closes just that layer first.
  useEffect(() => {
    if (activeProject === null && activeCert === null && activeCapability === null && lightbox === null) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (lightbox !== null) { setLightbox(null); return }
      setActiveProject(null); setActiveCert(null); setActiveCapability(null)
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [activeProject, activeCert, activeCapability, lightbox])

  const handleContactSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSendError(data.error || 'Something went wrong — please try again.')
        return
      }
      setSent(true)
      setForm({ name: '', email: '', budget: '', message: '' })
    } catch {
      setSendError('Something went wrong — check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  // Guards against an edited headline that no longer contains the
  // highlight word (e.g. via the admin editor) — falls back to plain text
  // instead of visibly appending the stale highlight.
  const highlightIndex = hero.highlight ? hero.headline.indexOf(hero.highlight) : -1
  const headlineBefore = highlightIndex === -1 ? hero.headline : hero.headline.slice(0, highlightIndex)
  const headlineAfter = highlightIndex === -1 ? '' : hero.headline.slice(highlightIndex + hero.highlight.length)

  return <main className="min-h-screen overflow-hidden bg-background text-foreground">
    <CustomCursor />
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-foreground/10 bg-background/80 px-6 py-5 backdrop-blur-xl md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#top" className="font-mono text-sm font-bold tracking-[0.24em] text-foreground">{profile.brandMark}<span className="text-primary">.</span></a>
        <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] text-muted-foreground md:flex">
          {visibleNavLinks.map((link) => <a key={link.href} href={link.href} className="hover:text-foreground">{link.label}</a>)}
          {visibility.contact !== false && <a href={nav.cta.href} className="rounded-full border border-primary/50 px-4 py-2 text-primary hover:bg-primary hover:text-primary-foreground">{nav.cta.label}</a>}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:border-primary hover:text-primary" />
          <button aria-label="Toggle menu" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {menuOpen && <div className="flex flex-col gap-5 pb-2 pt-6 text-sm uppercase tracking-widest md:hidden">
        {visibleNavLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
        {visibility.contact !== false && <a href={nav.cta.href} onClick={() => setMenuOpen(false)}>{nav.cta.label}</a>}
      </div>}
    </nav>

    {/* HERO */}
    {visibility.hero !== false && <section id="top" className="grain-bg relative flex min-h-screen items-center px-6 pb-20 pt-32 md:px-12">
      <div className="grid-lines absolute inset-0 -z-10" />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> {hero.eyebrow}
          </div>
          <h1 className="max-w-3xl text-balance text-6xl font-semibold leading-[.95] tracking-[-0.06em] md:text-8xl">
            {headlineBefore}{highlightIndex !== -1 && <span className="text-primary">{hero.highlight}</span>}{headlineAfter}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{hero.subtext}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href={hero.primaryCta.href} className="group flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-1">{hero.primaryCta.label} <ArrowUpRight size={17} /></a>
            <a href={hero.secondaryCta.href} className="flex items-center gap-2 rounded-full border border-foreground/15 px-6 py-3 text-sm hover:border-primary hover:text-primary">{hero.secondaryCta.label}</a>
          </div>
          <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-foreground/10 pt-8">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <Counter value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} className={`font-mono-tight text-2xl font-bold ${toneText(stat.tone)}`} />
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <HeroScene
          liveLabel={hero.scene.liveLabel}
          panelTitle={hero.scene.panelTitle}
          panelSubtitle={hero.scene.panelSubtitle}
          bars={hero.scene.bars}
          kpis={hero.scene.kpis}
          revenueBadge={hero.scene.revenueBadge}
          platformBadge={hero.scene.platformBadge}
          spendBadge={hero.scene.spendBadge}
        />
      </div>
    </section>}

    {/* TRUSTED PLATFORMS */}
    {visibility.platforms !== false && <section className="border-y border-foreground/10 bg-card/40 py-8">
      <Reveal>
        <p className="mb-6 text-center font-mono-tight text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{platformsLabel}</p>
        <Marquee items={platforms} />
      </Reveal>
    </section>}

    {/* ABOUT */}
    {visibility.about !== false && <section id="about" className="border-b border-foreground/10 bg-card/40 px-6 py-24 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <Reveal>
          <AboutPhoto photoSrc={profile.photo} photoAlt={profile.photoAlt} name={profile.name} />
          <p className="eyebrow mt-8">{about.eyebrow}</p>
          <h2 className="mt-5 max-w-md text-4xl font-semibold tracking-tight md:text-5xl">{about.heading}</h2>
        </Reveal>
        <Reveal delay={120} className="max-w-2xl">
          <p className="text-xl leading-relaxed text-muted-foreground">{about.paragraph}</p>
          {visibility.certifications !== false && <div id="certifications" className="mt-10 border-t border-foreground/10 pt-8">
            <p className="font-mono-tight text-xs uppercase tracking-widest text-muted-foreground">{certificationsHeading.eyebrow}</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{certificationsHeading.heading}</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {visibleCerts.map((cert, i) => {
                const index = certPage * CERTS_PER_PAGE + i
                const tone = ['primary', 'secondary', 'accent'][index % 3] as 'primary' | 'secondary' | 'accent'
                const toneBg = { primary: 'bg-primary/10 text-primary', secondary: 'bg-secondary/10 text-secondary', accent: 'bg-accent/10 text-accent' }[tone]
                const toneBorder = { primary: 'hover:border-primary/50', secondary: 'hover:border-secondary/50', accent: 'hover:border-accent/50' }[tone]
                return (
                  <TiltCard key={cert.name} max={6} className={`rounded-2xl border border-foreground/10 bg-foreground/[.02] transition-colors ${toneBorder}`}>
                    <button
                      type="button"
                      onClick={() => setActiveCert(index)}
                      className="w-full p-5 text-left"
                      data-cursor-label="View"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneBg}`}><Award size={18} /></span>
                        <span className="font-mono-tight text-[10px] uppercase tracking-widest text-muted-foreground">{cert.year}</span>
                      </div>
                      <p className="mt-4 text-base font-semibold leading-tight text-foreground">{cert.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{cert.issuer}</p>
                    </button>
                  </TiltCard>
                )
              })}
            </div>
            <PaginationDots page={certPage} pageCount={certPageCount} onChange={setCertPage} label="certifications" />
          </div>}
        </Reveal>
      </div>
    </section>}

    {/* EXPERIENCE & EDUCATION */}
    {visibility.experience !== false && <section id="experience" className="border-y border-foreground/10 bg-card/40 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <Reveal><p className="eyebrow">{experienceHeading.eyebrow}</p><h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{experienceHeading.heading}</h2></Reveal>
        <div className={`mt-14 grid gap-16 ${visibility.education !== false ? 'lg:grid-cols-[1.3fr_1fr]' : ''}`}>
          <div className="relative max-w-2xl">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-foreground/10" />
            <div className="space-y-10">
              {experience.map((role, i) => (
                <Reveal key={`${role.role}-${role.company}`} delay={i * 100} className="relative flex gap-6">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background text-primary"><Building2 size={16} /></span>
                  <div className="pt-1">
                    <p className="font-mono-tight text-xs uppercase tracking-widest text-muted-foreground">{role.period}</p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{role.role} · <span className="text-primary">{role.company}</span></h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {visibility.education !== false && <div id="education">
            <p className="font-mono-tight text-xs uppercase tracking-widest text-muted-foreground">{educationHeading.eyebrow}</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{educationHeading.heading}</h3>
            <div className="mt-6 space-y-4">
              {education.map((item, i) => (
                <Reveal key={item.degree} delay={i * 90}>
                  <div className="flex items-start gap-4 rounded-2xl border border-foreground/10 bg-foreground/[.02] p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"><GraduationCap size={18} /></span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{item.degree}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.school}</p>
                      <p className="mt-1 font-mono-tight text-xs uppercase tracking-widest text-muted-foreground">{item.period}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </section>}

    {/* SERVICES */}
    {visibility.services !== false && <section id="services" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <Reveal><p className="eyebrow">{servicesHeading.eyebrow}</p><h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{servicesHeading.heading}</h2></Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {services.map((service, i) => {
            const ServiceIcon = iconMap[service.icon]
            return (
            <Reveal key={service.title} delay={i * 90}>
              <TiltCard className="service-card h-full">
                <ServiceIcon className="text-primary" size={22} />
                <span className="step mt-6 block">{String(i + 1).padStart(2, '0')}</span>
                <h3>{service.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{service.sub}</p>
                <p className="desc">{service.desc}</p>
                <div className="tags mt-8 flex flex-wrap gap-2">{service.tags.map(t => <i key={t}>{t}</i>)}</div>
              </TiltCard>
            </Reveal>
            )
          })}
        </div>
      </div>
    </section>}

    {/* SOCIAL MEDIA MANAGEMENT & GROWTH */}
    {visibility.social !== false && <section id="social" className="border-y border-foreground/10 bg-card/40 px-6 py-24 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <Reveal>
          <p className="eyebrow">{socialHeading.eyebrow}</p>
          <h2 className="mt-5 max-w-md text-4xl font-semibold tracking-tight md:text-5xl">{socialHeading.heading}</h2>
          {socialHeading.description && <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">{socialHeading.description}</p>}
          {socialStats.length > 0 && (
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-foreground/10 pt-8">
              {socialStats.map((stat) => (
                <div key={stat.label}>
                  <Counter value={stat.value} decimals={stat.decimals} prefix={stat.prefix} suffix={stat.suffix} className={`font-mono-tight text-2xl font-bold ${toneText(stat.tone)}`} />
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </Reveal>
        <Reveal delay={120}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {socialCapabilities.map((item, i) => {
              const CapabilityIcon = iconMap[item.icon]
              const tone = ['primary', 'secondary', 'accent'][i % 3] as 'primary' | 'secondary' | 'accent'
              const toneBg = { primary: 'bg-primary/10 text-primary', secondary: 'bg-secondary/10 text-secondary', accent: 'bg-accent/10 text-accent' }[tone]
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveCapability(i)}
                  data-cursor-label="View"
                  className="group flex w-full items-center gap-4 border-b border-foreground/10 py-4 text-left last:border-b-0 sm:last:border-b sm:nth-last-[-n+2]:border-b-0"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneBg}`}><CapabilityIcon size={17} /></span>
                  <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
                  <ChevronRight size={15} className="shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>}

    {/* PROCESS */}
    {visibility.process !== false && <section id="process" className="border-y border-foreground/10 bg-card/40 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <Reveal><p className="eyebrow">{processHeading.eyebrow}</p><h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{processHeading.heading}</h2></Reveal>
        <div className="relative mt-16 grid gap-10 md:grid-cols-5">
          <div className="process-line absolute left-0 right-0 top-6 hidden h-px opacity-30 md:block" />
          {process.map((p, i) => (
            <Reveal key={p.step} delay={i * 100} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-background font-mono-tight text-sm text-primary">{p.step}</div>
              <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>}

    {/* WORK */}
    {visibility.work !== false && <section id="work" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-6">
          <Reveal><p className="eyebrow">{workHeading.eyebrow}</p><h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{workHeading.heading}</h2></Reveal>
          {visibility.contact !== false && <a href={workHeading.linkHref} className="hidden items-center gap-2 text-sm text-primary md:flex">{workHeading.linkLabel} <ArrowUpRight size={16} /></a>}
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {visibleProjects.map((project, i) => {
            const index = projectPage * PROJECTS_PER_PAGE + i
            return (
            <Reveal key={project.title} delay={i * 100}>
              <button onClick={() => setActiveProject(index)} className="group w-full text-left" data-cursor-label="View">
                <TiltCard max={5} className="project-art overflow-hidden">
                  <RemoteImage
                    src={project.thumbnailUrl}
                    alt={`${project.title} thumbnail`}
                    className="absolute inset-0 h-full w-full object-cover"
                    fallback={<div className={`absolute inset-0 bg-gradient-to-br ${project.color}`}><div className="project-lines" /></div>}
                  />
                  <span className="relative z-10 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white backdrop-blur">{workHeading.cardBadgeLabel}</span>
                  <Play className="relative z-10 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="currentColor" size={28} />
                </TiltCard>
                <div className="mt-5 flex items-start justify-between">
                  <div><p className="text-xs uppercase tracking-widest text-primary">{project.category}</p><h3 className="mt-2 text-2xl font-medium">{project.title}</h3></div>
                  <ArrowUpRight className="text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
              </button>
            </Reveal>
          )})}
        </div>
        <PaginationDots page={projectPage} pageCount={projectPageCount} onChange={setProjectPage} label="projects" />
      </div>
    </section>}

    {/* PERFORMANCE SNAPSHOT */}
    {visibility.performanceSnapshot !== false && <section className="border-y border-foreground/10 bg-card/40 px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><p className="eyebrow justify-center">{performanceSnapshot.eyebrow}</p><h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">{performanceSnapshot.heading}</h2><p className="mx-auto mt-5 max-w-xl text-muted-foreground">{performanceSnapshot.description}</p></Reveal>
        <Reveal delay={150} scale><ChannelChart channels={performanceSnapshot.channels} /></Reveal>
      </div>
    </section>}

    {/* TESTIMONIALS */}
    {visibility.testimonials !== false && <section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <Quote className="mx-auto text-primary" size={32} />
        <p className="mt-8 text-3xl font-medium leading-tight tracking-tight md:text-5xl">&ldquo;{testimonials[testimonial].quote}&rdquo;</p>
        <p className="mt-8 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{testimonials[testimonial].name}</span> · {testimonials[testimonial].role}</p>
        <div className="mt-10 flex justify-center gap-3">
          <button aria-label="Previous testimonial" onClick={() => setTestimonial((testimonial + testimonials.length - 1) % testimonials.length)} className="rounded-full border border-foreground/15 p-3 hover:border-primary"><ChevronLeft size={16} /></button>
          <button aria-label="Next testimonial" onClick={() => setTestimonial((testimonial + 1) % testimonials.length)} className="rounded-full border border-foreground/15 p-3 hover:border-primary"><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>}

    {/* CONTACT */}
    {visibility.contact !== false && <section id="contact" className="border-t border-foreground/10 bg-card/40 px-6 py-24 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">{contact.eyebrow}</p>
          <h2 className="mt-5 text-5xl font-semibold tracking-tight md:text-7xl">{contact.heading}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">{contact.paragraph}</p>
          <div className="mt-10 flex flex-col gap-4 text-sm">
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-primary"><Mail size={18} /> {contact.email}</a>
            <a href="#top" className="flex items-center gap-3 hover:text-primary"><Calendar size={18} /> {contact.bookingLabel}</a>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <form onSubmit={handleContactSubmit} className="space-y-5">
            <label className="block"><span className="sr-only">{contact.form.namePlaceholder}</span><input required placeholder={contact.form.namePlaceholder} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="contact-input" /></label>
            <label className="block"><span className="sr-only">{contact.form.emailPlaceholder}</span><input required type="email" placeholder={contact.form.emailPlaceholder} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="contact-input" /></label>
            <label className="block"><span className="sr-only">{contact.form.budgetPlaceholder}</span><input placeholder={contact.form.budgetPlaceholder} value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} className="contact-input" /></label>
            <label className="block"><span className="sr-only">{contact.form.messagePlaceholder}</span><textarea required placeholder={contact.form.messagePlaceholder} rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="contact-input resize-none" /></label>
            {sendError && <p className="text-sm text-accent">{sendError}</p>}
            <button disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              {sent ? <><Check size={17} /> {contact.form.submitLabelSent}</> : <>{sending ? 'Sending…' : contact.form.submitLabel} {!sending && <ArrowUpRight size={17} />}</>}
            </button>
          </form>
        </Reveal>
      </div>
    </section>}

    {visibility.footer !== false && <footer className="flex flex-col gap-6 px-6 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-12">
      <p>{footer.copyright}</p>
      <div className="flex items-center gap-5">
        {footer.links.map((link) => {
          const isExternal = /^https?:\/\//.test(link.href)
          return (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-foreground"
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </footer>}

    {activeProject !== null && <Modal onClose={() => setActiveProject(null)} labelledBy="project-modal-title" maxWidthClassName="max-w-[95vw] xl:max-w-5xl" noPadding>
      <div className="lg:grid lg:grid-cols-2">
        <div className={`flex aspect-video items-center justify-center overflow-hidden rounded-b-2xl bg-gradient-to-br lg:aspect-auto lg:h-full lg:min-h-[320px] lg:rounded-2xl lg:rounded-tl-none ${projects[activeProject].color}`}>
          <RemoteImage
            src={projects[activeProject].thumbnailUrl}
            alt={`${projects[activeProject].title} thumbnail`}
            className="h-full w-full cursor-zoom-in object-contain"
            fallback={<></>}
            onClick={() => setLightbox({ src: projects[activeProject].thumbnailUrl ?? '', alt: `${projects[activeProject].title} thumbnail` })}
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
          <p className="eyebrow">{workHeading.modalEyebrowPrefix}</p>
          <h2 id="project-modal-title" className="mt-4 text-3xl font-semibold sm:text-4xl">{projects[activeProject].title}</h2>
          <span className="mt-4 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-primary">{projects[activeProject].category}</span>
          <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{projects[activeProject].metrics.map(metric => <div key={metric} className="rounded-2xl border border-foreground/10 bg-background/50 p-4 text-center text-sm font-medium text-primary transition-colors hover:border-primary/40">{metric}</div>)}</div>
        </div>
      </div>
      <div className="border-t border-foreground/10 p-6 sm:p-8 md:p-10">
        <h3 className="font-mono-tight text-xs uppercase tracking-widest text-muted-foreground">Overview</h3>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground">{projects[activeProject].description} {projects[activeProject].extendedNote}</p>
        <button onClick={() => { setActiveProject(null); document.getElementById('contact')?.scrollIntoView() }} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:opacity-90 active:scale-95">{workHeading.modalCtaLabel} <ArrowUpRight size={16} /></button>
      </div>
    </Modal>}

    {activeCert !== null && <Modal onClose={() => setActiveCert(null)} labelledBy="cert-modal-title" maxWidthClassName="max-w-[95vw] xl:max-w-4xl" noPadding>
      <div className="lg:grid lg:grid-cols-2">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-b-2xl bg-foreground/2 lg:aspect-auto lg:h-full lg:min-h-[320px] lg:rounded-2xl lg:rounded-tl-none">
          <RemoteImage
            src={certifications[activeCert].imageUrl}
            alt={`${certifications[activeCert].name} certificate`}
            className="h-full w-full cursor-zoom-in object-contain"
            fallback={<span className="px-6 text-center text-sm text-muted-foreground">No certificate image added yet.</span>}
            onClick={() => setLightbox({ src: certifications[activeCert].imageUrl ?? '', alt: `${certifications[activeCert].name} certificate` })}
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
          <p className="eyebrow">{certificationsHeading.eyebrow}</p>
          <h2 id="cert-modal-title" className="mt-4 text-3xl font-semibold sm:text-4xl">{certifications[activeCert].name}</h2>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Building2 size={15} className="text-primary" /> {certifications[activeCert].issuer}</span>
            <span className="flex items-center gap-2"><Calendar size={15} className="text-primary" /> {certifications[activeCert].year}</span>
          </div>
        </div>
      </div>
    </Modal>}

    {activeCapability !== null && (() => {
      const capability = socialCapabilities[activeCapability]
      const CapabilityIcon = iconMap[capability.icon]
      const tone = ['primary', 'secondary', 'accent'][activeCapability % 3] as 'primary' | 'secondary' | 'accent'
      const toneBg = { primary: 'bg-primary/10 text-primary', secondary: 'bg-secondary/10 text-secondary', accent: 'bg-accent/10 text-accent' }[tone]
      return (
        <Modal onClose={() => setActiveCapability(null)} labelledBy="capability-modal-title" maxWidthClassName="max-w-lg">
          <span className={`flex h-14 w-14 items-center justify-center rounded-full ${toneBg}`}><CapabilityIcon size={24} /></span>
          <p className="eyebrow mt-6">{socialHeading.eyebrow}</p>
          <h2 id="capability-modal-title" className="mt-3 text-3xl font-semibold">{capability.label}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {capability.description || 'More detail on this coming soon.'}
          </p>
          <button onClick={() => { setActiveCapability(null); document.getElementById('contact')?.scrollIntoView() }} className="mt-10 flex items-center gap-2 text-sm font-semibold text-primary">{workHeading.modalCtaLabel} <ArrowUpRight size={16} /></button>
        </Modal>
      )
    })()}

    {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
  </main>
}
