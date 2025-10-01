export const STATUS = {
  Submitted: 'Submitted',
  PendingManager: 'Pending Manager Approval',
  PendingTreasury: 'Pending Treasury Review',
  ApprovedReady: 'Approved Ready for Payment',
  Completed: 'Payment Completed',
  Rejected: 'Rejected'
} as const;

export type StatusValue = typeof STATUS[keyof typeof STATUS];

export const ROLES = {
  Manager: 'Manager',
  Treasury: 'Treasury',
  None: 'None'
} as const;
