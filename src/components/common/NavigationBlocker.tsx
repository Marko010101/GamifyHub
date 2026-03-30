import { useBlocker } from 'react-router-dom'
import { ConfirmDialog } from './ConfirmDialog'

interface NavigationBlockerProps {
  isDirty: boolean
  message?: string
}

export function NavigationBlocker({
  isDirty,
  message = 'You have unsaved changes. Are you sure you want to leave this page?',
}: NavigationBlockerProps) {
  const blocker = useBlocker(isDirty)

  if (blocker.state !== 'blocked') return null

  return (
    <ConfirmDialog
      open
      title="Unsaved Changes"
      message={message}
      confirmLabel="Leave Page"
      cancelLabel="Stay"
      confirmColor="error"
      onConfirm={() => blocker.proceed()}
      onCancel={() => blocker.reset()}
    />
  )
}
