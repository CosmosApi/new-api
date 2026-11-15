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
import { useTranslation } from 'react-i18next'

export function BillingContent() {
  const { t } = useTranslation()

  return (
    <div className="doc-section">
      <h1>{t('Billing')}</h1>
      <p>
        {t(
          'PicoAPI charges only for what you use, billed per token. No subscriptions, no monthly fees, no minimum spend.'
        )}
      </p>

      <h2>{t('How Billing Works')}</h2>
      <p>{t('Every API call consumes tokens from your wallet:')}</p>
      <ul>
        <li>{t('Input tokens - the prompt and conversation history you send')}</li>
        <li>{t('Output tokens - the response the model generates')}</li>
      </ul>
      <p>
        {t(
          'Each model has its own per-token rate. Cost is calculated at the end of each call and deducted immediately.'
        )}
      </p>

      <h2>{t('Pricing Examples')}</h2>
      <p>{t('Approximate costs per 1M tokens (rates may vary):')}</p>
      <ul>
        <li>
          <strong>GPT-4o</strong> - {t('$2.50 input / $10.00 output')}
        </li>
        <li>
          <strong>GPT-4o-mini</strong> - {t('$0.15 input / $0.60 output')}
        </li>
        <li>
          <strong>Claude Opus 5.5</strong> - {t('$15.00 input / $75.00 output')}
        </li>
        <li>
          <strong>Claude Sonnet 5.5</strong> - {t('$3.00 input / $15.00 output')}
        </li>
        <li>
          <strong>Claude Haiku 5.5</strong> - {t('$0.80 input / $4.00 output')}
        </li>
      </ul>
      <p>
        {t(
          'Check the Models page or your dashboard for current pricing. Rates are updated when providers change theirs.'
        )}
      </p>

      <h2>{t('Wallet and Balance')}</h2>
      <p>{t('Your account has one wallet that holds your prepaid balance:')}</p>
      <ul>
        <li>{t('Add funds via credit card, Alipay, or cryptocurrency')}</li>
        <li>{t('Minimum top-up: $10')}</li>
        <li>{t('Balance never expires')}</li>
        <li>{t('Refunds available for unused balance (minus processing fees)')}</li>
      </ul>

      <h2>{t('Usage Logs')}</h2>
      <p>{t('Every call is logged with:')}</p>
      <ul>
        <li>{t('Timestamp and request ID')}</li>
        <li>{t('Model and API key used')}</li>
        <li>{t('Input and output token counts')}</li>
        <li>{t('Cost in USD')}</li>
      </ul>
      <p>
        {t(
          'Logs are retained for 90 days. Export them as CSV or JSON from the dashboard. Conversation content is not stored - only metadata and token counts.'
        )}
      </p>

      <h2>{t('Key Quotas')}</h2>
      <p>{t('Control spending by setting quotas on individual keys:')}</p>
      <ul>
        <li>
          <strong>{t('Daily quota')}</strong> - {t('Resets at 00:00 UTC')}
        </li>
        <li>
          <strong>{t('Total quota')}</strong> - {t('Lifetime limit for the key')}
        </li>
      </ul>
      <p>
        {t(
          "When a key hits its quota, calls return 429 Too Many Requests. The quota does not deduct from your wallet - it's a separate limit."
        )}
      </p>

      <h2>{t('Billing Alerts')}</h2>
      <p>{t('Set up alerts to get notified when:')}</p>
      <ul>
        <li>{t('Balance drops below a threshold')}</li>
        <li>{t('Daily spending exceeds a limit')}</li>
        <li>{t('A key hits its quota')}</li>
      </ul>
      <p>{t('Alerts are sent via email and can be configured in account settings.')}</p>

      <h2>{t('Invoices')}</h2>
      <p>
        {t(
          'Monthly invoices are generated automatically and emailed to your account address. Download past invoices from the billing page.'
        )}
      </p>

      <h2>{t('Cost Optimization Tips')}</h2>
      <ul>
        <li>{t('Use smaller models (GPT-4o-mini, Haiku) for simple tasks')}</li>
        <li>{t('Limit max_tokens to avoid runaway generations')}</li>
        <li>{t('Cache system prompts when making repeated calls')}</li>
        <li>{t('Set key quotas to prevent accidental overspending')}</li>
      </ul>
    </div>
  )
}
