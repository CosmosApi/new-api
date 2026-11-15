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

export function ModelsContent() {
  const { t } = useTranslation()

  return (
    <div className="doc-section">
      <h1>{t('Models')}</h1>
      <p>
        {t(
          'PicoAPI provides access to the latest models from OpenAI, Anthropic, Google, and more. All models use the same unified API.'
        )}
      </p>

      <h2>{t('OpenAI')}</h2>
      <ul>
        <li>
          <code>gpt-4o</code> - {t('Most capable GPT-4 model, balanced for speed and intelligence')}
        </li>
        <li>
          <code>gpt-4o-mini</code> - {t('Affordable and fast, great for high-volume tasks')}
        </li>
        <li>
          <code>gpt-4-turbo</code> - {t('Previous generation flagship with vision support')}
        </li>
        <li>
          <code>gpt-3.5-turbo</code> - {t('Fast and economical for simple tasks')}
        </li>
      </ul>

      <h2>{t('Anthropic Claude')}</h2>
      <ul>
        <li>
          <code>claude-opus-5-5</code> - {t('Most intelligent Claude model for complex reasoning')}
        </li>
        <li>
          <code>claude-sonnet-5-5</code> - {t('Balanced intelligence and speed')}
        </li>
        <li>
          <code>claude-haiku-5-5</code> - {t('Fastest Claude model for high-throughput tasks')}
        </li>
      </ul>

      <h2>{t('Google Gemini')}</h2>
      <ul>
        <li>
          <code>gemini-2.0-flash-thinking-exp</code> - {t('Advanced reasoning with thinking process')}
        </li>
        <li>
          <code>gemini-2.0-flash-exp</code> - {t('Fast multimodal model')}
        </li>
        <li>
          <code>gemini-1.5-pro</code> - {t('Long context window up to 2M tokens')}
        </li>
      </ul>

      <h2>{t('Model Aliases')}</h2>
      <p>{t('Use standard OpenAI client libraries with these model names:')}</p>
      <ul>
        <li>
          <code>gpt-4</code> → <code>gpt-4o</code>
        </li>
        <li>
          <code>gpt-3.5-turbo</code> → <code>gpt-3.5-turbo</code>
        </li>
      </ul>

      <h2>{t('Context Windows')}</h2>
      <p>{t('Maximum token limits vary by model:')}</p>
      <ul>
        <li>
          GPT-4o: <strong>128K tokens</strong>
        </li>
        <li>
          Claude Opus 5.5: <strong>200K tokens</strong>
        </li>
        <li>
          Gemini 1.5 Pro: <strong>2M tokens</strong>
        </li>
      </ul>

      <h2>{t('Capabilities')}</h2>
      <h3>{t('Vision')}</h3>
      <p>{t('These models accept image inputs:')}</p>
      <ul>
        <li>GPT-4o, GPT-4 Turbo, GPT-4o-mini</li>
        <li>Claude Opus 5.5, Sonnet 5.5</li>
        <li>Gemini 2.0 Flash, Gemini 1.5 Pro</li>
      </ul>

      <h3>{t('Function Calling')}</h3>
      <p>{t('All models support structured function/tool calling for integrations.')}</p>

      <h3>{t('Streaming')}</h3>
      <p>{t('All models support streaming responses via Server-Sent Events.')}</p>

      <h2>{t('Choosing a Model')}</h2>
      <p>{t('Consider these factors:')}</p>
      <ul>
        <li>
          <strong>{t('Task complexity')}</strong> - {t('Use Opus or GPT-4o for reasoning, Haiku or GPT-3.5 for simple tasks')}
        </li>
        <li>
          <strong>{t('Speed')}</strong> - {t('Smaller models return faster')}
        </li>
        <li>
          <strong>{t('Cost')}</strong> - {t('Larger models cost more per token (see Billing page)')}
        </li>
        <li>
          <strong>{t('Context length')}</strong> - {t('Use Gemini 1.5 Pro for very long documents')}
        </li>
      </ul>

      <h3>{t('Need Help Choosing?')}</h3>
      <p>{t('Start with gpt-4o or claude-sonnet-5-5 - both offer strong performance across most tasks.')}</p>
    </div>
  )
}
