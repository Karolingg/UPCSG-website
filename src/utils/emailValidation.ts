const ALLOWED_DOMAINS = ['up.edu.ph']

export function isAllowedEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.includes(domain)
}
