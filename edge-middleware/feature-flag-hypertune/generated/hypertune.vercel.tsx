/* eslint-disable */

import { type FlagOverridesType, encrypt, decrypt } from '@vercel/flags'
import { FlagValues } from '@vercel/flags/react'
import { cookies } from 'next/headers'
import { unstable_flag as flag } from '@vercel/flags/next'
import { DeepPartial, ObjectValue, Value } from 'hypertune'
import * as hypertuneTypes from './hypertune'
import getHypertune from '../lib/getHypertune'

export async function getVercelOverride(): Promise<DeepPartial<hypertuneTypes.Source> | null> {
  const overridesCookieValue = cookies().get('vercel-flag-overrides')?.value

  if (!overridesCookieValue) {
    return null
  }

  const decryptedOverrides = await decrypt<FlagOverridesType>(
    overridesCookieValue
  )
  if (!decryptedOverrides) {
    return null
  }

  const root = Object.fromEntries(
    Object.entries(decryptedOverrides).map(([flagPath, value]) => {
      const [flagName, ...flagPathSteps] = flagPath.split('.')
      return [
        flagName,
        flagPathSteps.reduce((current, step) => ({ [step]: current }), value),
      ]
    })
  ) as DeepPartial<hypertuneTypes.Root>

  return { root }
}

export async function VercelFlagValues({
  flagValues,
}: {
  flagValues: hypertuneTypes.Root
}): Promise<React.ReactElement> {
  const flattenedFlagValues = Object.fromEntries(
    getVercelFlagValuesEntries('', flagValues)
  )

  const encryptedFlagValues = await encrypt(flattenedFlagValues)
  return <FlagValues values={encryptedFlagValues} />
}

function getVercelFlagValuesEntries(
  keyPrefix: string,
  sourceObject: ObjectValue
): [string, Value][] {
  return Object.entries(sourceObject).flatMap(([flagKey, flagValue]) => {
    if (flagKey.startsWith('__') || Array.isArray(flagValue)) {
      return []
    }

    if (typeof flagValue !== 'object') {
      return [[`${keyPrefix}${flagKey}`, flagValue]]
    }
    return getVercelFlagValuesEntries(`${keyPrefix}${flagKey}.`, flagValue)
  })
}

export const exampleFlagFlag = flag<boolean>({
  key: 'exampleFlag',
  defaultValue: false,
  origin:
    'https://app.hypertune.com/projects/2583/main/draft/logic?selected_field_path=root%3EexampleFlag',
  description: 'An example flag.',
  options: [
    { label: 'Off', value: false },
    { label: 'On', value: true },
  ],

  async decide(params) {
    const hypertune = await getHypertune(params)
    return hypertune.exampleFlag({ fallback: false })
  },
})
