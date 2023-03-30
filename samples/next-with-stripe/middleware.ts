import { stanzaSession } from '@getstanza/next'

export default stanzaSession().middleware

// export function middleware (req: NextRequest) {
//   const headers = new Headers(req.headers)
//   const res = NextResponse.next({
//     request: {
//       headers
//     }
//   })
//
//   return res
// }
