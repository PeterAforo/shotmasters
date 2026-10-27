'use client'

export function LogoutButton() {
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        await fetch('/api/members/logout', { method: 'POST', credentials: 'include' })
        window.location.href = '/'
      }}
    >
      Sign Out
    </button>
  )
}
