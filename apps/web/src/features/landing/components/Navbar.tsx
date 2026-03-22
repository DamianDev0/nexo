'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Users,
  BarChart3,
  Kanban,
  Mail,
  Zap,
  LifeBuoy,
  BookOpen,
  GraduationCap,
  Building2,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

import { Button } from '@/components/atoms/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/organisms/navigation-menu'
import { ROUTES } from '@/constants/routes.constants'
import { NavItem } from './NavItem'

// ─── Navigation data ────────────────────────────────────────────────

const PRODUCT_ITEMS = [
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Organize contacts and companies in one place',
    href: '#contacts',
  },
  {
    icon: Kanban,
    title: 'Sales Pipeline',
    description: 'Visual deal tracking with drag-and-drop stages',
    href: '#pipeline',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Real-time dashboards and revenue forecasting',
    href: '#analytics',
  },
  {
    icon: Mail,
    title: 'Email & Automation',
    description: 'Templates, sequences, and smart follow-ups',
    href: '#automation',
  },
  {
    icon: Zap,
    title: 'Integrations',
    description: 'Connect with WhatsApp, Google, and 50+ tools',
    href: '#integrations',
  },
] as const

const RESOURCE_ITEMS = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Guides, API reference, and tutorials',
    href: '#docs',
  },
  {
    icon: GraduationCap,
    title: 'Academy',
    description: 'Free courses to master your CRM',
    href: '#academy',
  },
  {
    icon: LifeBuoy,
    title: 'Support',
    description: 'Get help from our team in Colombia',
    href: '#support',
  },
  {
    icon: Building2,
    title: 'About Us',
    description: 'Our mission to empower Latin American teams',
    href: '#about',
  },
] as const

// ─── Mobile nav section ─────────────────────────────────────────────

interface MobileSectionProps {
  readonly title: string
  readonly items: ReadonlyArray<{
    readonly icon: typeof Users
    readonly title: string
    readonly description: string
    readonly href: string
  }>
  readonly isOpen: boolean
  readonly onToggle: () => void
}

function MobileSection({ title, items, isOpen, onToggle }: MobileSectionProps) {
  return (
    <div>
      <button
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-foreground"
        onClick={onToggle}
      >
        {title}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 pb-3 pl-1">
          {items.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <item.icon className="size-4 shrink-0" />
              {item.title}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Navbar ─────────────────────────────────────────────────────────

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  const handleToggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev)
    setOpenSection(null)
  }, [])

  const handleToggleSection = useCallback((section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-foreground" />
          <span className="text-sm font-bold uppercase tracking-widest text-foreground">Nexo</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Product */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Product</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[520px] grid-cols-2 gap-1 p-2">
                    {PRODUCT_ITEMS.map((item) => (
                      <NavigationMenuLink key={item.title} asChild>
                        <NavItem
                          href={item.href}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                        />
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Resources */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[440px] grid-cols-2 gap-1 p-2">
                    {RESOURCE_ITEMS.map((item) => (
                      <NavigationMenuLink key={item.title} asChild>
                        <NavItem
                          href={item.href}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                        />
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Simple links */}
              <NavigationMenuItem>
                <Link
                  href="#pricing"
                  className="inline-flex h-9 items-center px-4 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  Pricing
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.auth.login}
            className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-foreground lg:inline-flex"
          >
            Log in
          </Link>
          <Button asChild size="sm" className="hidden rounded-lg lg:inline-flex">
            <Link href={ROUTES.auth.onboarding}>Start free</Link>
          </Button>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={handleToggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-6 pb-6 pt-2 lg:hidden">
          <MobileSection
            title="Product"
            items={PRODUCT_ITEMS}
            isOpen={openSection === 'product'}
            onToggle={() => handleToggleSection('product')}
          />
          <MobileSection
            title="Resources"
            items={RESOURCE_ITEMS}
            isOpen={openSection === 'resources'}
            onToggle={() => handleToggleSection('resources')}
          />

          <a href="#pricing" className="block py-3 text-sm font-medium text-foreground">
            Pricing
          </a>

          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full rounded-lg">
              <Link href={ROUTES.auth.login}>Log in</Link>
            </Button>
            <Button asChild className="w-full rounded-lg">
              <Link href={ROUTES.auth.onboarding}>Start free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
