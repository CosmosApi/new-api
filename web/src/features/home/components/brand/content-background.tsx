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

import './content-background.css'

interface ContentBackgroundProps {
  /** 背景样式：dots(点阵) | grid(网格) | waves(波纹) | plain(纯色) */
  variant?: 'dots' | 'grid' | 'waves' | 'plain'
  className?: string
  children: React.ReactNode
}

/**
 * 首页下方内容区域的背景容器
 * 提供多种背景样式选项 + 斜向流星 + 点击涟漪
 */
export function ContentBackground({
  variant = 'dots',
  className,
  children,
}: ContentBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement('div')
      ripple.className = 'content-ripple'
      const rect = container.getBoundingClientRect()
      ripple.style.left = `${e.clientX - rect.left}px`
      ripple.style.top = `${e.clientY - rect.top}px`
      container.appendChild(ripple)
      setTimeout(() => ripple.remove(), 1500)
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [])

  // 生成 30 条随机流星，分布在整个内容区域高度
  const meteors = Array.from({ length: 30 }, (_, i) => ({
    startX: 60 + Math.random() * 40, // 横向起始位置 60-100%（右侧）
    startY: (i / 30) * 200 + Math.random() * 20, // 纵向均匀分布 0-220%（覆盖整个页面高度）
    delay: Math.random() * 10, // 随机延迟 0-10s
    duration: 2.5 + Math.random() * 1.5, // 持续时间 2.5-4s
    length: 150 + Math.random() * 80, // 流星长度 150-230px
    width: 3 + Math.random() * 2, // 流星宽度 3-5px
  }))

  return (
    <div
      ref={containerRef}
      className={cn(
        'content-background',
        `content-background-${variant}`,
        className
      )}
    >
      {/* 斜向流星层 */}
      <div className='content-meteors' aria-hidden>
        {meteors.map((m, i) => (
          <span
            key={i}
            className='content-meteor'
            style={
              {
                '--delay': `${m.delay}s`,
                '--duration': `${m.duration}s`,
                '--start-x': `${m.startX}%`,
                '--start-y': `${m.startY}%`,
                '--length': `${m.length}px`,
                '--width': `${m.width}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      {children}
    </div>
  )
}

