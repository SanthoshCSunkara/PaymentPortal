import * as React from 'react';
import { DefaultButton, Text } from '@fluentui/react';
import styles from '../../PaymentPortal.module.scss';

import { RequestService } from '../../services/RequestService';
import { fmtMoney } from '../../Utilities/format';
import { StatusPill } from '../ui/StatusPill';

export const MySubmitted: React.FC<{ onOpenDetails: (id: number) => void }> = ({ onOpenDetails }) => {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    RequestService.mySubmitted().then(setItems);
  }, []);

  return (
    <div className={styles.card}>
      <Text variant="large">My Submitted Requests</Text>
      {items.map(i => (
        <div key={i.Id} className={styles.listRow}>
          <div>
            <span className={styles.badge}>{i.RequestID}</span>
            <strong>{i.Title || 'Untitled'}</strong> — {fmtMoney(i.Amount)}
          </div>
          <div>
            <StatusPill value={i.Status} />{' '}
            <DefaultButton text="Open" onClick={() => onOpenDetails(i.Id)} />
          </div>
        </div>
      ))}
      {items.length === 0 && <Text>You haven’t submitted any requests yet.</Text>}
    </div>
  );
};
