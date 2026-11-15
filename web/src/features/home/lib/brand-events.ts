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
/**
 * DOM event a home page element dispatches (bubbling) to start a ripple in
 * the dot field behind the page, at a viewport position.
 */
export const BRAND_RIPPLE_EVENT = 'brand:ripple'

export interface BrandRippleDetail {
  clientX: number
  clientY: number
}

/**
 * Private-use character that marks where the model name goes in the
 * translated slogan. Passed as the `{{model}}` value so i18next leaves a
 * marker the slogan can split on, instead of a finished sentence.
 */
export const SLOGAN_MODEL_SLOT = String.fromCharCode(0xe000)
