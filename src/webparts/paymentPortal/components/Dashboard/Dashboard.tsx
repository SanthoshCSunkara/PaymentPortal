import * as React from 'react';
import { Text, Stack, DefaultButton } from '@fluentui/react';
import styles from '../../PaymentPortal.module.scss';


import { RequestService } from '../../services/RequestService';
import { StatusPill } from '../ui/StatusPill';

type Props = {
  onOpenDetails: (id: number) => void;
  onNew: () => void;
  onMy: () => void;
};

export const Dashboard: React.FC<Props> = ({ onOpenDetails, onNew, onMy }) => {
  const [myCount, setMyCount] = React.useState(0);
  const [managerItems, setManagerItems] = React.useState<any[]>([]);
  const [treasuryItems, setTreasuryItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;

    RequestService.mySubmitted().then(items => {
      if (!mounted) return;
      setMyCount(items?.length || 0);
    });

    RequestService.approvalsForMe().then(({ managerItems, treasuryItems }) => {
      if (!mounted) return;
      setManagerItems(managerItems || []);
      setTreasuryItems(treasuryItems || []);
    });

    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className={styles.grid3}>
        <div className={styles.card}>
          <Text variant="mediumPlus">My Requests</Text>
          <Text variant="xxLarge">{myCount}</Text>
        </div>
        <div className={styles.card}>
          <Text variant="mediumPlus">Pending for Me</Text>
          <Text variant="xxLarge">{(managerItems?.length || 0) + (treasuryItems?.length || 0)}</Text>
        </div>
        <div className={styles.card}>
          <Text variant="mediumPlus">Quick Actions</Text>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text="New Request" onClick={onNew} />
            <DefaultButton text="My Submitted" onClick={onMy} />
          </Stack>
        </div>
      </div>

      <div className={styles.card}>
        <Text variant="large">Approvals for Me</Text>
        {managerItems.map(i => (
          <div key={i.Id} className={styles.listRow}>
            <div>
              <span className={styles.badge}>{i.RequestID}</span>
              <strong>{i.Title || 'Untitled'}</strong>
            </div>
            <div>
              <StatusPill value={i.Status} />{' '}
              <DefaultButton text="Open" onClick={() => onOpenDetails(i.Id)} />
            </div>
          </div>
        ))}
        {treasuryItems.map(i => (
          <div key={i.Id} className={styles.listRow}>
            <div>
              <span className={styles.badge}>{i.RequestID}</span>
              <strong>{i.Title || 'Untitled'}</strong>
            </div>
            <div>
              <StatusPill value={i.Status} />{' '}
              <DefaultButton text="Open" onClick={() => onOpenDetails(i.Id)} />
            </div>
          </div>
        ))}
        {(managerItems.length + treasuryItems.length === 0) && <Text>No approvals right now.</Text>}
      </div>

      <div className={styles.card}>
        <Text variant="large">My Requests (recent)</Text>
        <DefaultButton text="Go to My Submitted" onClick={onMy} />
      </div>
    </div>
  );
};
