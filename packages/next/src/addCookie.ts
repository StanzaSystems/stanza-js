export function addCookie(
  existingCookies: number | string | string[] | undefined,
  cookieValue: string
): number | string | string[] {
  if (cookieValue === '') {
    return existingCookies ?? '';
  }

  if (existingCookies !== undefined) {
    if (Array.isArray(existingCookies)) {
      return [...existingCookies, cookieValue];
    } else {
      return [existingCookies.toString(), cookieValue];
    }
  }
  return cookieValue;
}
