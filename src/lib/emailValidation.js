// Add domains to this array when expanding beyond school emails.
const ALLOWED_DOMAINS = ['up.edu.ph']

export function isAllowedEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.includes(domain)
}
