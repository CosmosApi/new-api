/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot='tabs'
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className
      )}
      {...props}
    />
  )
}

/**
 * Visual variants for {@link TabsList}.
 *
 * - `segment` — primary navigation. Sits flush against a container edge and
 *   marks the active tab with a solid `primary` block, so the current
 *   location stays obvious even in dense dashboards.
 * - `underline` — secondary navigation. The active tab is marked with a
 *   2px indicator rule; the row itself stays transparent.
 * - `pill` — compact in-page switcher (chart metric pickers, view scopes).
 * - `default` — legacy muted pill, kept for dense dialog grids where the
 *   segmented treatment would be too heavy.
 */
const tabsListVariants = cva(
  // Base list geometry. Properties that vary per style (radius, height,
  // padding, fill) are deliberately NOT set here: Tailwind resolves plain
  // utilities by stylesheet order, so a base `rounded-lg` would beat a
  // variant's `rounded-none` regardless of class order. Each variant
  // therefore owns those properties outright, and the base only carries the
  // shared layout primitives.
  'group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        // Primary navigation: a bordered, softly-filled rail. The active tab
        // becomes a solid primary block inside it.
        segment:
          'gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-1 group-data-horizontal/tabs:h-10',
        // Secondary navigation: transparent row with a rule under the
        // active tab.
        underline:
          'gap-1 rounded-none border-b border-border/70 bg-transparent p-0 group-data-horizontal/tabs:h-10',
        // Compact in-page switcher. Spacing comes from the trigger's own
        // padding, so no gap is introduced here — this keeps the legacy
        // pill metrics identical to their previous appearance.
        pill: 'rounded-lg bg-muted p-[3px] group-data-horizontal/tabs:h-8',
        // Legacy muted pill.
        default: 'rounded-lg bg-muted p-[3px] group-data-horizontal/tabs:h-8',
        // Legacy underline row. Retains the original padding so existing
        // call sites keep their exact metrics.
        line: 'gap-1 rounded-none bg-transparent p-[3px] group-data-horizontal/tabs:h-8',
      },
    },
    defaultVariants: {
      variant: 'pill',
    },
  }
)

function TabsList({
  className,
  variant = 'pill',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Tab button.
 *
 * The active-state treatment is resolved from the list variant through the
 * `group-data-[variant=…]/tabs-list` prefix, so a single trigger component
 * serves every visual style without per-call-site overrides.
 */
function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot='tabs-trigger'
      className={cn(
        // Base: neutral, focusable button. Padding and radius are owned by
        // each variant so no two rules ever compete for the same property.
        'text-foreground/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
        // `pill` / `default`: muted container with a raised active chip.
        'group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:px-1.5 group-data-[variant=pill]/tabs-list:py-0.5 group-data-[variant=pill]/tabs-list:data-active:bg-background group-data-[variant=pill]/tabs-list:data-active:text-foreground group-data-[variant=pill]/tabs-list:data-active:shadow-sm dark:group-data-[variant=pill]/tabs-list:data-active:border-input dark:group-data-[variant=pill]/tabs-list:data-active:bg-input/30 group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-1.5 group-data-[variant=default]/tabs-list:py-0.5 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm dark:group-data-[variant=default]/tabs-list:data-active:border-input dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30',
        // `segment`: solid primary block for the active tab — the primary
        // navigation signature. The block sits inside the list's muted
        // container so the row reads as one continuous surface.
        'group-data-[variant=segment]/tabs-list:rounded-md group-data-[variant=segment]/tabs-list:px-3 group-data-[variant=segment]/tabs-list:py-1.5 group-data-[variant=segment]/tabs-list:data-active:bg-primary group-data-[variant=segment]/tabs-list:data-active:text-primary-foreground group-data-[variant=segment]/tabs-list:data-active:shadow-sm group-data-[variant=segment]/tabs-list:hover:text-foreground group-data-[variant=segment]/tabs-list:data-active:hover:text-primary-foreground',
        // `underline`: transparent row. The active tab is marked with a 2px
        // rule drawn as an inset shadow rather than a pseudo-element, so it
        // cannot collide with the border/padding utilities.
        'group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:px-3 group-data-[variant=underline]/tabs-list:py-2 group-data-[variant=underline]/tabs-list:data-active:text-foreground group-data-[variant=underline]/tabs-list:data-active:shadow-[inset_0_-2px_0_0_var(--primary)]',
        // `line`: legacy underline variant kept for existing call sites. The
        // trigger keeps the original rounded chip shape; only the list
        // itself drops its container radius.
        'group-data-[variant=line]/tabs-list:rounded-md group-data-[variant=line]/tabs-list:px-1.5 group-data-[variant=line]/tabs-list:py-0.5 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent group-data-[variant=line]/tabs-list:data-active:text-foreground group-data-[variant=line]/tabs-list:data-active:shadow-none dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        // Indicator rule — shown only for the legacy `line` variant. The
        // `underline` variant draws its rule with an inset shadow instead.
        'after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot='tabs-content'
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
