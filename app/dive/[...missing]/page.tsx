import { notFound } from 'next/navigation'

// Unknown /dive/* paths render the review copy's 404 rather than escaping to
// the root one.
export default function DiveMissing() {
  notFound()
}
