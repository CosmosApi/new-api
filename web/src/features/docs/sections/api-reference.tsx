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

export function ApiReferenceContent() {
  const { t } = useTranslation()

  return (
    <div className="doc-section">
      <h1>{t('API Reference')}</h1>
      <p>
        {t(
          'PicoAPI implements the OpenAI API specification. Use your existing OpenAI client libraries by changing only the base URL and API key.'
        )}
      </p>

      <h2>{t('Base URL')}</h2>
      <pre>
        <code>https://api.picoapi.com/v1</code>
      </pre>

      <h2>{t('Authentication')}</h2>
      <p>{t('Pass your API key in the Authorization header:')}</p>
      <pre>
        <code>Authorization: Bearer YOUR_API_KEY</code>
      </pre>

      <h2>{t('Chat Completions')}</h2>
      <p>{t('Generate conversational responses from AI models.')}</p>

      <h3>{t('Endpoint')}</h3>
      <pre>
        <code>POST /v1/chat/completions</code>
      </pre>

      <h3>{t('Request Body')}</h3>
      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>JSON</span>
        </div>
        <pre>
          <code>{`{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": false
}`}</code>
        </pre>
      </div>

      <h3>{t('Key Parameters')}</h3>
      <ul>
        <li>
          <code>model</code> - {t('Model identifier (see Models page for full list)')}
        </li>
        <li>
          <code>messages</code> - {t('Array of conversation messages with role and content')}
        </li>
        <li>
          <code>temperature</code> - {t('Sampling temperature (0-2, default 1)')}
        </li>
        <li>
          <code>max_tokens</code> - {t('Maximum tokens to generate')}
        </li>
        <li>
          <code>stream</code> - {t('Enable streaming responses (SSE format)')}
        </li>
      </ul>

      <h3>{t('Response')}</h3>
      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>JSON</span>
        </div>
        <pre>
          <code>{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1699000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 10,
    "total_tokens": 25
  }
}`}</code>
        </pre>
      </div>

      <h2>{t('Streaming')}</h2>
      <p>{t('Set stream: true to receive responses as Server-Sent Events:')}</p>
      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>Python</span>
        </div>
        <pre>
          <code>{`stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Tell me a story"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`}</code>
        </pre>
      </div>

      <h2>{t('Error Handling')}</h2>
      <p>{t('Errors follow the OpenAI format:')}</p>
      <div className="doc-code-block">
        <div className="doc-code-header">
          <span>JSON</span>
        </div>
        <pre>
          <code>{`{
  "error": {
    "message": "Insufficient balance",
    "type": "insufficient_quota",
    "code": "quota_exceeded"
  }
}`}</code>
        </pre>
      </div>

      <h3>{t('Common Status Codes')}</h3>
      <ul>
        <li>
          <code>400</code> - {t('Invalid request (check parameters)')}
        </li>
        <li>
          <code>401</code> - {t('Invalid or expired API key')}
        </li>
        <li>
          <code>403</code> - {t('Key lacks permission for this model or IP restricted')}
        </li>
        <li>
          <code>429</code> - {t('Rate limit or quota exceeded')}
        </li>
        <li>
          <code>500</code> - {t('Upstream provider error')}
        </li>
      </ul>

      <h2>{t('Rate Limits')}</h2>
      <p>
        {t(
          'Rate limits are applied per key. Limits depend on your account tier and are returned in response headers:'
        )}
      </p>
      <pre>
        <code>{`X-RateLimit-Limit-Requests: 60
X-RateLimit-Remaining-Requests: 59
X-RateLimit-Reset-Requests: 2024-01-01T00:01:00Z`}</code>
      </pre>
    </div>
  )
}
