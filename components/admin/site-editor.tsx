'use client'

import type { ReactNode } from 'react'
import {
  FileText, User, Compass, Sparkles, Grid2x2, Info, Award, Building2, GraduationCap, Briefcase,
  Share2, GitBranch, FolderKanban, Quote, BarChart3, Mail, PanelBottom, EyeOff, type LucideIcon,
} from 'lucide-react'
import {
  TextField, TextAreaField, NumberField, SelectField, StringListField, NumberListField,
  ToggleField, ImageUploadField, TONE_OPTIONS, ICON_OPTIONS, type Updater,
} from '@/components/admin/fields'
import { ArrayEditor } from '@/components/admin/array-editor'
import type { SectionKey, SiteData } from '@/lib/site-data'

type FieldSet = { content: SiteData; onChange: Updater }

/** Best-effort cleanup — an item's uploaded image is deleted from Cloudinary right before the item itself is removed, so storage doesn't accumulate orphaned files. */
function deleteCloudinaryAsset(publicId?: string) {
  if (!publicId) return
  fetch('/api/upload-image', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  }).catch(() => {})
}

interface EditorSection {
  id: string
  label: string
  icon: LucideIcon
  description?: string
  render: (f: FieldSet) => ReactNode
}

const SECTION_TOGGLES: { key: SectionKey; label: string; hint?: string }[] = [
  { key: 'hero', label: 'Hero', hint: 'The top intro banner — turning this off hides the very top of the page.' },
  { key: 'platforms', label: 'Platforms strip', hint: 'The scrolling "Platforms & tools" marquee.' },
  { key: 'about', label: 'About' },
  { key: 'certifications', label: 'Certifications', hint: 'Shown inside About.' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education', hint: 'Shown inside Experience.' },
  { key: 'services', label: 'Services' },
  { key: 'social', label: 'Social Media Management & Growth' },
  { key: 'process', label: 'Process' },
  { key: 'work', label: 'Selected Work' },
  { key: 'performanceSnapshot', label: 'Performance snapshot', hint: 'The channel ROAS chart.' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'contact', label: 'Contact', hint: 'Turning this off also hides the contact form used for submissions.' },
  { key: 'footer', label: 'Footer' },
]

const sections: EditorSection[] = [
  {
    id: 'visibility',
    label: 'Section Visibility',
    icon: EyeOff,
    description: 'Completely hide any section from the public site without deleting its content — flip it back on any time.',
    render: (f) => <div className="divide-y divide-foreground/10 rounded-2xl border border-foreground/10">
      {SECTION_TOGGLES.map((toggle) => (
        <div key={toggle.key} className="px-5 py-4">
          <ToggleField {...f} path={['visibility', toggle.key]} label={toggle.label} hint={toggle.hint} />
        </div>
      ))}
    </div>,
  },
  {
    id: 'metadata',
    label: 'Metadata',
    icon: FileText,
    description: 'Browser tab title and search description.',
    render: (f) => <div className="grid gap-4 sm:grid-cols-2">
      <TextField {...f} path={['meta', 'title']} label="Title" />
      <TextAreaField {...f} path={['meta', 'description']} label="Description" />
    </div>,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    render: (f) => <div className="grid gap-4 sm:grid-cols-2">
      <TextField {...f} path={['profile', 'name']} label="Name" />
      <TextField {...f} path={['profile', 'brandMark']} label="Nav brand mark" />
      <TextField {...f} path={['profile', 'role']} label="Role / title" />
      <TextField {...f} path={['profile', 'email']} label="Email" />
      <TextField {...f} path={['profile', 'photo']} label="Photo path (public/…)" />
      <TextField {...f} path={['profile', 'photoAlt']} label="Photo alt text" />
    </div>,
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: Compass,
    render: (f) => <>
      <ArrayEditor
        {...f}
        path={['nav', 'links']}
        itemLabel={(item: any) => item.label}
        createItem={() => ({ label: 'New link', href: '#' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'label']} label="Label" />
          <TextField {...f} path={[...itemPath, 'href']} label="Href" />
        </>}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['nav', 'cta', 'label']} label="CTA label" />
        <TextField {...f} path={['nav', 'cta', 'href']} label="CTA href" />
      </div>
    </>,
  },
  {
    id: 'hero',
    label: 'Hero',
    icon: Sparkles,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['hero', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['hero', 'highlight']} label="Highlighted word (must appear in headline)" />
      </div>
      <TextAreaField {...f} path={['hero', 'headline']} label="Headline" rows={2} />
      <TextAreaField {...f} path={['hero', 'subtext']} label="Subtext" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['hero', 'primaryCta', 'label']} label="Primary CTA label" />
        <TextField {...f} path={['hero', 'primaryCta', 'href']} label="Primary CTA href" />
        <TextField {...f} path={['hero', 'secondaryCta', 'label']} label="Secondary CTA label" />
        <TextField {...f} path={['hero', 'secondaryCta', 'href']} label="Secondary CTA href" />
      </div>

      <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Hero stats</h3>
      <ArrayEditor
        {...f}
        path={['hero', 'stats']}
        itemLabel={(item: any) => item.label}
        createItem={() => ({ value: 0, prefix: '', suffix: '', decimals: 0, label: 'New stat', tone: 'primary' })}
        renderItem={(itemPath) => <>
          <NumberField {...f} path={[...itemPath, 'value']} label="Value" />
          <NumberField {...f} path={[...itemPath, 'decimals']} label="Decimals" />
          <TextField {...f} path={[...itemPath, 'prefix']} label="Prefix" />
          <TextField {...f} path={[...itemPath, 'suffix']} label="Suffix" />
          <TextField {...f} path={[...itemPath, 'label']} label="Label" />
          <SelectField {...f} path={[...itemPath, 'tone']} label="Color" options={TONE_OPTIONS} />
        </>}
      />

      <h3 className="pt-2 text-sm font-semibold text-muted-foreground">3D dashboard panel</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['hero', 'scene', 'liveLabel']} label={'"Live" badge label'} />
        <TextField {...f} path={['hero', 'scene', 'panelTitle']} label="Panel title" />
        <TextField {...f} path={['hero', 'scene', 'panelSubtitle']} label="Panel subtitle" />
      </div>
      <NumberListField {...f} path={['hero', 'scene', 'bars']} label="Bar chart values" />

      <ArrayEditor
        {...f}
        path={['hero', 'scene', 'kpis']}
        itemLabel={(item: any) => item.label}
        createItem={() => ({ value: '0', label: 'New KPI', tone: 'primary' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'value']} label="Value" />
          <TextField {...f} path={[...itemPath, 'label']} label="Label" />
          <SelectField {...f} path={[...itemPath, 'tone']} label="Color" options={TONE_OPTIONS} />
        </>}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['hero', 'scene', 'revenueBadge', 'value']} label="Revenue badge value" />
        <TextField {...f} path={['hero', 'scene', 'revenueBadge', 'label']} label="Revenue badge label" />
        <TextField {...f} path={['hero', 'scene', 'platformBadge', 'value']} label="Platform badge value" />
        <TextField {...f} path={['hero', 'scene', 'platformBadge', 'label']} label="Platform badge label" />
        <TextField {...f} path={['hero', 'scene', 'spendBadge', 'value']} label="Spend badge value" />
        <TextField {...f} path={['hero', 'scene', 'spendBadge', 'label']} label="Spend badge label" />
      </div>
    </>,
  },
  {
    id: 'platforms',
    label: 'Platforms',
    icon: Grid2x2,
    render: (f) => <>
      <TextField {...f} path={['platformsLabel']} label="Section label" />
      <StringListField {...f} path={['platforms']} label="Platforms" />
    </>,
  },
  {
    id: 'about',
    label: 'About',
    icon: Info,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['about', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['about', 'heading']} label="Heading" />
      </div>
      <TextAreaField {...f} path={['about', 'paragraph']} label="Paragraph" />
    </>,
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    description: 'Shown inside the About section, in place of stats. Upload the certificate image directly — it\'s hosted on Cloudinary, and removing a certification (or replacing its image) deletes the old upload from Cloudinary automatically.',
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['certificationsHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['certificationsHeading', 'heading']} label="Heading" />
      </div>
      <ArrayEditor
        {...f}
        path={['certifications']}
        itemLabel={(item: any) => item.name}
        createItem={() => ({ name: 'New certification', issuer: '', year: '', imageUrl: '', imagePublicId: '' })}
        onBeforeRemove={(item: any) => deleteCloudinaryAsset(item.imagePublicId)}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'name']} label="Name" />
          <TextField {...f} path={[...itemPath, 'issuer']} label="Issuer" />
          <TextField {...f} path={[...itemPath, 'year']} label="Year" />
          <ImageUploadField {...f} path={[...itemPath, 'imageUrl']} publicIdPath={[...itemPath, 'imagePublicId']} label="Certificate image" />
        </>}
      />
    </>,
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Building2,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['experienceHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['experienceHeading', 'heading']} label="Heading" />
      </div>
      <ArrayEditor
        {...f}
        path={['experience']}
        itemLabel={(item: any) => `${item.role} — ${item.company}`}
        createItem={() => ({ role: 'New role', company: '', period: '', description: '' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'role']} label="Role" />
          <TextField {...f} path={[...itemPath, 'company']} label="Company" />
          <TextField {...f} path={[...itemPath, 'period']} label="Period" />
          <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'description']} label="Description" /></div>
        </>}
      />
    </>,
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['educationHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['educationHeading', 'heading']} label="Heading" />
      </div>
      <ArrayEditor
        {...f}
        path={['education']}
        itemLabel={(item: any) => item.degree}
        createItem={() => ({ degree: 'New degree', school: '', period: '' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'degree']} label="Degree" />
          <TextField {...f} path={[...itemPath, 'school']} label="School" />
          <TextField {...f} path={[...itemPath, 'period']} label="Period" />
        </>}
      />
    </>,
  },
  {
    id: 'services',
    label: 'Services',
    icon: Briefcase,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['servicesHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['servicesHeading', 'heading']} label="Heading" />
      </div>
      <ArrayEditor
        {...f}
        path={['services']}
        itemLabel={(item: any) => item.title}
        createItem={() => ({ icon: 'search', title: 'New service', sub: '', desc: '', tags: [] })}
        renderItem={(itemPath) => <>
          <SelectField {...f} path={[...itemPath, 'icon']} label="Icon" options={ICON_OPTIONS} />
          <TextField {...f} path={[...itemPath, 'title']} label="Title" />
          <TextField {...f} path={[...itemPath, 'sub']} label="Subtitle" />
          <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'desc']} label="Description" /></div>
          <div className="sm:col-span-2"><StringListField {...f} path={[...itemPath, 'tags']} label="Tags" /></div>
        </>}
      />
    </>,
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: Share2,
    description: 'The "Social Media Management & Growth" section.',
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['socialHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['socialHeading', 'heading']} label="Heading" />
      </div>
      <TextAreaField {...f} path={['socialHeading', 'description']} label="Description" />

      <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Stats</h3>
      <ArrayEditor
        {...f}
        path={['socialStats']}
        itemLabel={(item: any) => item.label}
        createItem={() => ({ value: 0, prefix: '', suffix: '', decimals: 0, label: 'New stat', tone: 'primary' })}
        renderItem={(itemPath) => <>
          <NumberField {...f} path={[...itemPath, 'value']} label="Value" />
          <NumberField {...f} path={[...itemPath, 'decimals']} label="Decimals" />
          <TextField {...f} path={[...itemPath, 'prefix']} label="Prefix" />
          <TextField {...f} path={[...itemPath, 'suffix']} label="Suffix" />
          <TextField {...f} path={[...itemPath, 'label']} label="Label" />
          <SelectField {...f} path={[...itemPath, 'tone']} label="Color" options={TONE_OPTIONS} />
        </>}
      />

      <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Capabilities</h3>
      <p className="-mt-3 text-xs text-muted-foreground">Each capability opens a detail popup on the site when clicked — add a description to fill it in.</p>
      <ArrayEditor
        {...f}
        path={['socialCapabilities']}
        itemLabel={(item: any) => typeof item === 'string' ? item : item.label}
        createItem={() => ({ icon: 'sparkles', label: 'New capability', description: '' })}
        renderItem={(itemPath) => <>
          <SelectField {...f} path={[...itemPath, 'icon']} label="Icon" options={ICON_OPTIONS} />
          <TextField {...f} path={[...itemPath, 'label']} label="Label" />
          <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'description']} label="Detail (shown in the popup)" /></div>
        </>}
      />
    </>,
  },
  {
    id: 'process',
    label: 'Process',
    icon: GitBranch,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['processHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['processHeading', 'heading']} label="Heading" />
      </div>
      <ArrayEditor
        {...f}
        path={['process']}
        itemLabel={(item: any) => `${item.step} — ${item.title}`}
        createItem={() => ({ step: '00', title: 'New step', desc: '' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'step']} label="Step number" />
          <TextField {...f} path={[...itemPath, 'title']} label="Title" />
          <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'desc']} label="Description" /></div>
        </>}
      />
    </>,
  },
  {
    id: 'work',
    label: 'Work',
    icon: FolderKanban,
    description: 'Case studies shown in the Work section. Upload a thumbnail to replace the gradient art with a real image on the card and in the case study modal — removing a project (or replacing its thumbnail) deletes the old upload from Cloudinary automatically.',
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['workHeading', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['workHeading', 'heading']} label="Heading" />
        <TextField {...f} path={['workHeading', 'linkLabel']} label={'"Have a project?" label'} />
        <TextField {...f} path={['workHeading', 'linkHref']} label="Link href" />
        <TextField {...f} path={['workHeading', 'cardBadgeLabel']} label="Card badge label" />
        <TextField {...f} path={['workHeading', 'modalEyebrowPrefix']} label="Modal eyebrow prefix" />
        <TextField {...f} path={['workHeading', 'modalCtaLabel']} label="Modal CTA label" />
      </div>
      <ArrayEditor
        {...f}
        path={['projects']}
        itemLabel={(item: any) => item.title}
        createItem={() => ({ title: 'New project', category: '', description: '', extendedNote: '', color: 'from-[#1e3f8f] to-[#5c8dff]', metrics: [], thumbnailUrl: '', thumbnailPublicId: '' })}
        onBeforeRemove={(item: any) => deleteCloudinaryAsset(item.thumbnailPublicId)}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'title']} label="Title" />
          <TextField {...f} path={[...itemPath, 'category']} label="Category" />
          <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'description']} label="Card description" /></div>
          <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'extendedNote']} label="Modal extended note" /></div>
          <TextField {...f} path={[...itemPath, 'color']} label="Gradient (Tailwind from-…/to-…)" />
          <ImageUploadField {...f} path={[...itemPath, 'thumbnailUrl']} publicIdPath={[...itemPath, 'thumbnailPublicId']} label="Thumbnail image (optional)" />
          <div className="sm:col-span-2"><StringListField {...f} path={[...itemPath, 'metrics']} label="Metrics" /></div>
        </>}
      />
    </>,
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    icon: Quote,
    render: (f) => <ArrayEditor
      {...f}
      path={['testimonials']}
      itemLabel={(item: any) => item.name}
      createItem={() => ({ quote: '', name: 'New testimonial', role: '' })}
      renderItem={(itemPath) => <>
        <div className="sm:col-span-2"><TextAreaField {...f} path={[...itemPath, 'quote']} label="Quote" /></div>
        <TextField {...f} path={[...itemPath, 'name']} label="Name" />
        <TextField {...f} path={[...itemPath, 'role']} label="Role" />
      </>}
    />,
  },
  {
    id: 'snapshot',
    label: 'Performance snapshot',
    icon: BarChart3,
    description: 'The 3D channel comparison chart.',
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['performanceSnapshot', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['performanceSnapshot', 'heading']} label="Heading" />
      </div>
      <TextAreaField {...f} path={['performanceSnapshot', 'description']} label="Description" />
      <ArrayEditor
        {...f}
        path={['performanceSnapshot', 'channels']}
        itemLabel={(item: any) => item.name}
        createItem={() => ({ name: 'New channel', value: 0, tone: 'primary' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'name']} label="Channel name" />
          <NumberField {...f} path={[...itemPath, 'value']} label="ROAS value" />
          <SelectField {...f} path={[...itemPath, 'tone']} label="Color" options={TONE_OPTIONS} />
        </>}
      />
    </>,
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Mail,
    render: (f) => <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['contact', 'eyebrow']} label="Eyebrow" />
        <TextField {...f} path={['contact', 'heading']} label="Heading" />
        <TextField {...f} path={['contact', 'email']} label="Email" />
        <TextField {...f} path={['contact', 'bookingLabel']} label="Booking link label" />
      </div>
      <TextAreaField {...f} path={['contact', 'paragraph']} label="Paragraph" />
      <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Form</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField {...f} path={['contact', 'form', 'namePlaceholder']} label="Name placeholder" />
        <TextField {...f} path={['contact', 'form', 'emailPlaceholder']} label="Email placeholder" />
        <TextField {...f} path={['contact', 'form', 'budgetPlaceholder']} label="Budget placeholder" />
        <TextField {...f} path={['contact', 'form', 'messagePlaceholder']} label="Message placeholder" />
        <TextField {...f} path={['contact', 'form', 'submitLabel']} label="Submit label" />
        <TextField {...f} path={['contact', 'form', 'submitLabelSent']} label="Submit label (after send)" />
      </div>
    </>,
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: PanelBottom,
    render: (f) => <>
      <TextField {...f} path={['footer', 'copyright']} label="Copyright line" />
      <ArrayEditor
        {...f}
        path={['footer', 'links']}
        itemLabel={(item: any) => item.label}
        createItem={() => ({ label: 'New link', href: '#' })}
        renderItem={(itemPath) => <>
          <TextField {...f} path={[...itemPath, 'label']} label="Label" />
          <TextField {...f} path={[...itemPath, 'href']} label="Href" />
        </>}
      />
    </>,
  },
]

export const adminNavSections = sections.map(({ id, label, icon }) => ({ id, label, icon }))

export function SiteEditor({
  content, onChange, activeSection,
}: { content: SiteData; onChange: Updater; activeSection: string }) {
  const f: FieldSet = { content, onChange }
  const section = sections.find((s) => s.id === activeSection) ?? sections[0]

  return (
    <section className="admin-section">
      <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
      {section.description && <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>}
      <div className="mt-5 space-y-5">{section.render(f)}</div>
    </section>
  )
}
