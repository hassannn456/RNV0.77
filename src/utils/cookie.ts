const regexSessionId = /JSESSIONID=([0-9A-F]+);/
const regexRouteId = /X-Oracle-BMC-LBS-Route=([0-9a-f]+);/

export const parseSessionId = (cookie: string): string | undefined => {
  const match = regexSessionId.exec(cookie)
  return match ? match[1] : undefined
}

export const parseRouteId = (cookie: string): string | undefined => {
  const match = regexRouteId.exec(cookie)
  return match ? match[1] : undefined
}
