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
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import './meteor-field.css'

interface MeteorFieldProps {
  className?: string
  /** 流星数量 */
  count?: number
  /** 启用点击涟漪交互 */
  interactive?: boolean
  /** 简约模式：只在角落显示几条流星，无星空背景 */
  minimal?: boolean
  /** 背景层样式：stars(微光星点) | grid(动态网格) | aurora(极光) | waves(波纹) */
  variant?: 'stars' | 'grid' | 'aurora' | 'waves'
}

/**
 * 流星雨夜空背景：纯 CSS 流星 + 微光星空 + 点击涟漪。
 * 自适应浅色/深色主题，支持 prefers-reduced-motion。
 */
export function MeteorField({
  className,
  count = 12,
  interactive = true,
  minimal = false,
  variant = 'stars',
}: MeteorFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!interactive) return
    const container = containerRef.current
    if (!container) return

    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement('div')
      ripple.className = 'meteor-ripple'
      ripple.style.left = `${e.clientX - container.getBoundingClientRect().left}px`
      ripple.style.top = `${e.clientY - container.getBoundingClientRect().top}px`
      container.appendChild(ripple)
      setTimeout(() => ripple.remove(), 1200)
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [interactive])

  // 简约模式：更自然的流星雨分布（从顶部随机位置下落）
  const meteors = minimal
    ? Array.from({ length: 15 }, (_, i) => ({
        left: `${5 + (i * 6.5) % 90}%`,
        top: `${-5 - Math.random() * 15}%`,
        delay: i * 0.8 + Math.random() * 2,
        duration: 3 + Math.random() * 2.5,
      }))
    : Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${-20 + Math.random() * 40}%`,
        delay: Math.random() * 10,
        duration: 3.5 + Math.random() * 2,
      }))

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        'meteor-field',
        minimal && 'meteor-field-minimal',
        `meteor-field-${variant}`,
        className
      )}
    >
      {/* 背景层（简约模式下隐藏） */}
      {!minimal && (
        <>
          {variant === 'stars' && <div className='meteor-stars' />}
          {variant === 'grid' && <div className='meteor-grid' />}
          {variant === 'aurora' && <div className='meteor-aurora' />}
          {variant === 'waves' && <div className='meteor-waves' />}
        </>
      )}

      {/* 流星雨层 */}
      <div className='meteor-shower'>
        {meteors.map((m, i) => (
          <span
            key={i}
            className='meteor'
            style={
              {
                '--delay': `${m.delay}s`,
                '--duration': `${m.duration}s`,
                '--left': m.left,
                '--top': m.top,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
