import { redirect } from 'next/navigation'

// fallback for malformed/unmatched URLs — redirect to locale-aware 404
export default function NotFound() {
  redirect('/404')
}
