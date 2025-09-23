'use client'

import { useEffect } from 'react'

export const DevtoolsRemover = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      const devtools = document.querySelector('nextjs-portal')
      if (devtools) {
        devtools.remove()
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return null
}
