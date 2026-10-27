import type { PayloadRequest } from 'payload'
import { getPayloadClient } from './payload'

/** Resolve the logged-in member from the request cookie, inside route handlers. */
export async function getAuthMember(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  return user?.collection === 'members' ? user : null
}

export async function getAuthMemberFromPayloadReq(req: PayloadRequest) {
  return req.user?.collection === 'members' ? req.user : null
}
