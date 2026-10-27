import type { Access, FieldAccess } from 'payload'

type AnyUser = { collection?: string; role?: string; id?: string | number } | null | undefined

const isPanelUser = (user: AnyUser) => user?.collection === 'users'
const isMemberUser = (user: AnyUser) => user?.collection === 'members'
const role = (user: AnyUser) => (user as { role?: string })?.role

export const isAdmin: Access = ({ req }) => isPanelUser(req.user) && role(req.user) === 'admin'

export const isStaff: Access = ({ req }) =>
  isPanelUser(req.user) && ['admin', 'staff'].includes(role(req.user) ?? '')

export const isAdminField: FieldAccess = ({ req }) =>
  isPanelUser(req.user) && role(req.user) === 'admin'

export const publicRead: Access = () => true

export const staffWrite: Access = ({ req }) =>
  isPanelUser(req.user) && ['admin', 'staff'].includes(role(req.user) ?? '')

/** Anyone can create (registration), members update/read self, staff manage all. */
export const memberSelfOrStaff = {
  create: () => true,
  read: (({ req }) => {
    if (isPanelUser(req.user)) return true
    if (isMemberUser(req.user)) return { id: { equals: req.user?.id } }
    return false
  }) satisfies Access,
  update: (({ req }) => {
    if (isPanelUser(req.user)) return true
    if (isMemberUser(req.user)) return { id: { equals: req.user?.id } }
    return false
  }) satisfies Access,
  delete: isAdmin,
}

/** Members create + read own records; staff/admin manage everything. */
export const memberOwnedOrStaff = {
  create: (({ req }) => !!req.user) satisfies Access,
  read: (({ req }) => {
    if (isPanelUser(req.user)) return true
    if (isMemberUser(req.user)) return { member: { equals: req.user?.id } }
    return false
  }) satisfies Access,
  update: (({ req }) => {
    if (isPanelUser(req.user)) return true
    if (isMemberUser(req.user)) return { member: { equals: req.user?.id } }
    return false
  }) satisfies Access,
  delete: isStaff,
}

/** Logged-in members may create (e.g. tournament entries); staff manage. */
export const memberCreateStaffManage = {
  create: (({ req }) => !!req.user) satisfies Access,
  read: publicRead,
  update: staffWrite,
  delete: isStaff,
}
