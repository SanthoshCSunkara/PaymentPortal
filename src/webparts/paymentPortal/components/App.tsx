import * as React from 'react';
import { Pivot, PivotItem, PrimaryButton, Text } from '@fluentui/react';
import styles from '../PaymentPortal.module.scss';


import { Dashboard } from './Dashboard/Dashboard';
import { NewRequest } from './Requests/NewRequest';
import { MySubmitted } from './Requests/MySubmitted';
import { RequestDetails } from './Details/RequestDetails';

type View = 'dashboard' | 'new' | 'my' | 'details';

export default function App(): JSX.Element {
  const [view, setView] = React.useState<View>('dashboard');
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  const openDetails = (id: number) => {
    setSelectedId(id);
    setView('details');
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <Text variant="xLargePlus">Payment Portal</Text>
        {view !== 'new' && (
          <PrimaryButton text="+ New Request" onClick={() => setView('new')} />
        )}
      </div>

      {view !== 'details' && (
        <Pivot>
          <PivotItem headerText="Dashboard" itemKey="dash">
            <Dashboard onOpenDetails={openDetails} onNew={() => setView('new')} onMy={() => setView('my')} />
          </PivotItem>
          <PivotItem headerText="My Submitted" itemKey="my">
            <MySubmitted onOpenDetails={openDetails} />
          </PivotItem>
          <PivotItem headerText="New Request" itemKey="new">
            <NewRequest onAfterSubmit={(id) => { setSelectedId(id); setView('details'); }} />
          </PivotItem>
        </Pivot>
      )}

      {view === 'details' && selectedId !== null && (
        <RequestDetails id={selectedId} onBack={() => setView('dashboard')} />
      )}
    </div>
  );
}
