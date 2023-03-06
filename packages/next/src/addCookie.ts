export function addCookie (
  existingCookies: number | string | string[] | undefined,
  cookieValue: string
) {
  if (existingCookies !== undefined) {
    if (Array.isArray(existingCookies)) {
      return [...existingCookies, cookieValue]
    } else {
      return [existingCookies.toString(), cookieValue]
    }
  }
  return cookieValue
}
