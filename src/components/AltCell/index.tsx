'use client'

import React from 'react'

type Props = {
  cellData?: string
  rowData?: { isDecorative?: boolean }
}

export const AltCell: React.FC<Props> = ({ cellData, rowData }) => {
  if (rowData?.isDecorative) {
    return (
      <span style={{ color: 'var(--theme-elevation-400)', fontStyle: 'italic' }}>
        &lt;decorative&gt;
      </span>
    )
  }

  return <span>{cellData ?? ''}</span>
}

export default AltCell
