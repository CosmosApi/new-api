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

export function QuickStartContent() {
  const { t } = useTranslation()

  return (
    <div className="doc-section">
      <h1>{t('Quick Start')}</h1>
      <p>
        {t(
          'PicoAPI provides unified access to major AI models through a single API key. Get started in minutes.'
        )}
      </p>

      <h2>{t('1. Create Your Account')}</h2>
      <p>
        {t('Sign up at PicoAPI and verify your email. Your account comes with a pre-configured wallet ready to use.')}
      </p>

      <h2>{t('2. Generate an API Key')}</h2>
      <p>{t('Navigate to the Keys page and create your first key. You can set:')}</p>
      <ul>
        <li>{t('Quota - daily or total token limits')}</li>
        <li>{t('Expiry - when the key stops working')}</li>
        <li>{t('Model access - which models this key can call')}</li>
        <li>{t('IP restrictions - lock the key to specific addresses')}</li>
      </ul>

      <h2>{t('3. Make Your First Call')}</h2>
      <p>{t('Use the OpenAI-compatible endpoint with your key:')}</p>

      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>cURL</span>
        </div>
        <pre>
          <code>{`curl https://api.picoapi.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`}</code>
        </pre>
      </div>

      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>Python</span>
        </div>
        <pre>
          <code>{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.picoapi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)

print(response.choices[0].message.content)`}</code>
        </pre>
      </div>

      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>Node.js</span>
        </div>
        <pre>
          <code>{`import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://api.picoapi.com/v1'
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});

console.log(response.choices[0].message.content);`}</code>
        </pre>
      </div>

      <h2>{t('4. Monitor Usage')}</h2>
      <p>
        {t(
          'Every call is logged with model, tokens, and cost. Check your dashboard to see real-time usage and remaining balance.'
        )}
      </p>

      <h3>{t('Next Steps')}</h3>
      <ul>
        <li>{t('Browse the Models page to see all available models and pricing')}</li>
        <li>{t('Set up billing alerts to get notified when balance runs low')}</li>
        <li>{t('Create separate keys for different projects with their own quotas')}</li>
      </ul>
    </div>
  )
}
