'use client'

import { useEffect } from 'react'
import { useHypertune } from '../generated/hypertune.react'

export default function HypertuneClientLogger({
  shouldLogExampleFlag,
}: {
  shouldLogExampleFlag?: boolean
}): null {
  const hypertune = useHypertune()

  useEffect(() => {
    if (shouldLogExampleFlag) {
      hypertune.exampleFlag({ fallback: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
