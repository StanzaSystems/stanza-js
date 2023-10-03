'use client'
import React from 'react'
import { WithStanzaFeature } from '@getstanza/react'

const TestPage = () => {
  return <div>
    <div>Test Page</div>

    <WithStanzaFeature name="search" fallback={() => 'No search'}>
      Search
    </WithStanzaFeature>
  </div>
}

export default TestPage
