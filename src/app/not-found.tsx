import { redirect } from 'next/navigation'

// fallback for malformed/unmatched URLs
export default function NotFound() {
  redirect('/404')
}
