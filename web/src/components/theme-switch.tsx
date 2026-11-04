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
import { Moon, Sun } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'

/**
 * The sun/moon toggle. A single click flips between light and dark; the
 * "system" preference stays reachable from the theme settings drawer and
 * the command menu, so nothing is lost by not offering it here.
 *
 * The switch is animated with a View Transition: the new theme is revealed
 * by a circle expanding out of the button, so the page appears to turn over
 * from where the pointer already is instead of snapping to the other look.
 */
export function ThemeSwitch() {
  const { t } = useTranslation()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [switching, setSwitching] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Keep the document's theme-color meta in step with the active theme.
  useEffect(() => {
    const themeColor = resolvedTheme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [resolvedTheme])

  const handleToggle = useCallback(async () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    const documentElement = document.documentElement
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Without View Transitions (or with reduced motion) just switch.
    if (reduceMotion || typeof document.startViewTransition !== 'function') {
      setTheme(next)
      return
    }

    const rect = buttonRef.current?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const y = rect ? rect.top + rect.height / 2 : 0
    // The reveal has to travel far enough to reach the far corner of the
    // viewport, otherwise the new theme stops short of the edges.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    documentElement.style.setProperty('--pico-theme-x', `${x}px`)
    documentElement.style.setProperty('--pico-theme-y', `${y}px`)
    documentElement.style.setProperty('--pico-theme-reveal', `${radius}px`)
    documentElement.dataset.themeTransition = 'running'
    setSwitching(true)

    const transition = document.startViewTransition(() => {
      // The snapshot is taken as soon as this callback returns, so the class
      // has to already be on <html>: setting React state alone would not have
      // painted the new theme yet and the transition would capture the old
      // one. Applying it here and flushing keeps the two in step; the
      // provider's own effect then re-applies the same value.
      documentElement.classList.remove('light', 'dark')
      documentElement.classList.add(next)
      flushSync(() => setTheme(next))
    })

    try {
      await transition.finished
    } finally {
      delete documentElement.dataset.themeTransition
      documentElement.style.removeProperty('--pico-theme-x')
      documentElement.style.removeProperty('--pico-theme-y')
      documentElement.style.removeProperty('--pico-theme-reveal')
      setSwitching(false)
    }
  }, [resolvedTheme, setTheme])

  const isDark = resolvedTheme === 'dark'
  const label = isDark ? t('Switch to light theme') : t('Switch to dark theme')

  return (
    <Button
      ref={buttonRef}
      type='button'
      variant='ghost'
      size='icon'
      className={cn(
        'relative size-9 shrink-0 overflow-hidden rounded-full',
        switching && 'pointer-events-none'
      )}
      onClick={handleToggle}
      aria-label={label}
      title={label}
      data-theme={isDark ? 'dark' : 'light'}
      data-theme-source={theme}
    >
      {/* Sun sits above the moon; the two cross-fade so the button reads as a
          single control whose glyph is the current state, not two buttons. */}
      <Sun
        aria-hidden
        className={cn(
          'absolute size-[1.15rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.24,0.5,1)]',
          isDark
            ? 'scale-50 -rotate-90 opacity-0'
            : 'scale-100 rotate-0 opacity-100'
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          'absolute size-[1.15rem] transition-all duration-500 ease-[cubic-bezier(0.34,1.24,0.5,1)]',
          isDark
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-50 rotate-90 opacity-0'
        )}
      />
    </Button>
  )
}
