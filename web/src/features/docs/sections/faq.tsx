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

export function FaqContent() {
  const { t } = useTranslation()

  return (
    <div className="doc-section">
      <h1>{t('FAQ')}</h1>

      <h2>{t('What makes PicoAPI different?')}</h2>
      <p>
        {t(
          'PicoAPI gives you one API for every major AI model, using the same OpenAI-compatible format. No need to maintain separate integrations or juggle multiple API keys.'
        )}
      </p>

      <h2>{t('Do you store my prompts or responses?')}</h2>
      <p>
        {t(
          'No. Prompts and responses are forwarded directly to the provider and never logged. We only store metadata: model name, token counts, timestamp, and cost.'
        )}
      </p>

      <h2>{t('Are these official API keys?')}</h2>
      <p>
        {t(
          'Yes. PicoAPI uses official provider APIs from OpenAI, Anthropic, Google, and others. No resold keys, no model swapping.'
        )}
      </p>

      <h2>{t('Can I use my existing OpenAI client library?')}</h2>
      <p>
        {t(
          'Absolutely. Just change the base URL to https://api.picoapi.com/v1 and use your PicoAPI key. The API is fully compatible with OpenAI SDKs.'
        )}
      </p>

      <h2>{t('What happens if I run out of balance?')}</h2>
      <p>
        {t(
          'API calls return a 402 Payment Required error. Add funds to your wallet to resume. Set up billing alerts to get notified before balance runs out.'
        )}
      </p>

      <h2>{t('Can I get a refund?')}</h2>
      <p>
        {t(
          'Yes, unused balance can be refunded minus payment processing fees (typically 3-5%). Contact support with your refund request.'
        )}
      </p>

      <h2>{t('How do key quotas work?')}</h2>
      <p>
        {t(
          'Quotas are spending limits per key, separate from your wallet balance. A key with a $10 daily quota can only spend $10 per day, even if your wallet has more. Great for controlling costs per project.'
        )}
      </p>

      <h2>{t('Do keys expire?')}</h2>
      <p>
        {t(
          'Only if you set an expiry date when creating the key. Otherwise, keys remain active until revoked.'
        )}
      </p>

      <h2>{t('Can I restrict a key to certain models?')}</h2>
      <p>
        {t(
          'Yes. When creating a key, select which models it can access. Calls to other models will be rejected with a 403 error.'
        )}
      </p>

      <h2>{t('What about IP restrictions?')}</h2>
      <p>
        {t(
          'You can lock a key to specific IP addresses or CIDR ranges. Requests from other IPs are blocked. Useful for production keys.'
        )}
      </p>

      <h2>{t('How do I see my usage?')}</h2>
      <p>
        {t(
          'The dashboard shows real-time usage: total tokens, cost, and breakdown by model. Detailed logs are available for the past 90 days.'
        )}
      </p>

      <h2>{t('Is there a rate limit?')}</h2>
      <p>
        {t(
          'Rate limits are applied per key and depend on your account tier. Most accounts start at 60 requests per minute. Limits are shown in response headers.'
        )}
      </p>

      <h2>{t('Can I use PicoAPI for production?')}</h2>
      <p>
        {t(
          'Yes. PicoAPI is designed for production workloads. We provide 99.9% uptime SLA, monitoring, and dedicated support for enterprise accounts.'
        )}
      </p>

      <h2>{t('What if a provider has an outage?')}</h2>
      <p>
        {t(
          'Calls to the affected provider will return a 503 error with details. Other providers remain available. Check the status page for real-time updates.'
        )}
      </p>

      <h2>{t('Do you support streaming?')}</h2>
      <p>
        {t(
          'Yes. Set stream: true in your request to receive responses as Server-Sent Events, just like the OpenAI API.'
        )}
      </p>

      <h2>{t('How is billing calculated for streaming?')}</h2>
      <p>
        {t(
          'Token counts are tallied as the response streams, and the final cost is deducted when the stream completes.'
        )}
      </p>

      <h2>{t('Can multiple people share one account?')}</h2>
      <p>
        {t(
          'Accounts are designed for individual use, but you can create separate keys for team members with their own quotas. Enterprise plans support team management.'
        )}
      </p>

      <h2>{t('How do I contact support?')}</h2>
      <p>
        {t(
          'Email support@picoapi.com or use the in-app chat. We typically respond within 24 hours, faster for urgent issues.'
        )}
      </p>

      <h2>{t('Is there an API for managing keys programmatically?')}</h2>
      <p>
        {t(
          'Yes. The management API lets you create, list, and revoke keys via code. Documentation is in the API Reference section.'
        )}
      </p>

      <h2>{t('Do you offer discounts for high volume?')}</h2>
      <p>
        {t(
          'Enterprise plans with committed spend receive volume discounts. Contact sales for pricing.'
        )}
      </p>
    </div>
  )
}
