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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Book, Code2, Coins, Database, HelpCircle } from 'lucide-react'

import { PublicLayout } from '@/components/layout'

import './docs.css'
import { QuickStartContent } from './sections/quick-start'
import { ApiReferenceContent } from './sections/api-reference'
import { ModelsContent } from './sections/models'
import { BillingContent } from './sections/billing'
import { FaqContent } from './sections/faq'

type DocSection = 'quick-start' | 'api-reference' | 'models' | 'billing' | 'faq'

const DOC_SECTIONS = [
  { id: 'quick-start', icon: Book, labelKey: 'Quick Start' },
  { id: 'api-reference', icon: Code2, labelKey: 'API Reference' },
  { id: 'models', icon: Database, labelKey: 'Models' },
  { id: 'billing', icon: Coins, labelKey: 'Billing' },
  { id: 'faq', icon: HelpCircle, labelKey: 'FAQ' },
] as const

export function Docs() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState<DocSection>('quick-start')

  const renderContent = () => {
    switch (activeSection) {
      case 'quick-start':
        return <QuickStartContent />
      case 'api-reference':
        return <ApiReferenceContent />
      case 'models':
        return <ModelsContent />
      case 'billing':
        return <BillingContent />
      case 'faq':
        return <FaqContent />
    }
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className="docs-container">
        {/* 左侧导航 */}
        <aside className="docs-sidebar">
          <div className="docs-sidebar-header">
            <h2 className="font-serif text-xl">{t('Documentation')}</h2>
          </div>
          <nav className="docs-nav">
            {DOC_SECTIONS.map(({ id, icon: Icon, labelKey }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`docs-nav-item ${activeSection === id ? 'active' : ''}`}
                aria-current={activeSection === id ? 'page' : undefined}
              >
                <Icon className="docs-nav-icon" />
                <span>{t(labelKey)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 右侧内容区 */}
        <main className="docs-content">
          <div className="docs-content-inner">{renderContent()}</div>
        </main>
      </div>
    </PublicLayout>
  )
}
