import * as React from 'react';
import styles from '../../PaymentPortal.module.scss';
import { STATUS } from '../../constants/status';

export const StatusPill: React.FC<{ value: string }> = ({ value }) => {
  let cls = styles.pillDefault;
  if (value === STATUS.PendingManager || value === STATUS.PendingTreasury) cls = styles.pillPending;
  else if (value === STATUS.ApprovedReady) cls = styles.pillApproved;
  else if (value === STATUS.Rejected) cls = styles.pillRejected;
  else if (value === STATUS.Completed) cls = styles.pillCompleted;

  return <span className={`${styles.pill} ${cls}`}>{value}</span>;
};
