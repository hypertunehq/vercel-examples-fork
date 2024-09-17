import { Suspense } from 'react'
import { Text } from '@vercel/examples-ui'
import { VercelFlagValues } from '../generated/hypertune.vercel'
import getHypertune from '../lib/getHypertune'
import HypertuneClientLogger from '../lib/HypertuneClientLogger'

export default async function ServerComponent() {
  const hypertune = await getHypertune()

  const exampleFlag = hypertune.exampleFlag({ fallback: false })

  return (
    <>
      <Text>
        (Server Component) Example Flag: <strong>{String(exampleFlag)}</strong>
      </Text>
      {/* Ensure we log correct analytics data for events and A/B test exposures. */}
      <HypertuneClientLogger shouldLogExampleFlag />

      <Suspense fallback={null}>
        <VercelFlagValues flagValues={hypertune.get()} />
      </Suspense>
    </>
  )
}
