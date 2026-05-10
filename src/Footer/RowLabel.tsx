'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<any>()

  // navItems have a title field
  if (data?.data?.title) {
    return <div>{data.data.title}</div>
  }

  // legalItems have link.label
  const label = data?.data?.link?.label
  return <div>{label || 'Item'}</div>
}
