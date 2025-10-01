import * as React from 'react';
import { DefaultButton, PrimaryButton, Text, TextField, MessageBar, MessageBarType, Stack } from '@fluentui/react';
import styles from '../../PaymentPortal.module.scss';

import { RequestService } from '../../services/RequestService';
import { ApprovalService } from '../../services/ApprovalService';
import { StatusPill } from '../ui/StatusPill';
import { fmtMoney } from '../../Utilities/format';
import { STATUS } from '../../constants/status';
import { sp } from '../../services/spfxContext';
import { UserService } from '../../services/UserService';

type Props = { id: number; onBack: () => void };

export const RequestDetails: React.FC<Props> = ({ id, onBack }) => {
  const [item, setItem] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [rejectNotes, setRejectNotes] = React.useState('');

  const reload = React.useCallback(async () => {
    const i = await RequestService.getById(id);
    // get attachments
    const atts = await sp().web.lists.getByTitle('VendorPaymentRequests').items.getById(id).attachmentFiles();
    (i as any)._attachments = atts || [];
    setItem(i);
  }, [id]);

  React.useEffect(() => { reload(); }, [reload]);

  const canManagerApprove = async () => {
    const me = await sp().web.currentUser();
    return item?.Status === STATUS.PendingManager && item?.CurrentApprover?.Id === me.Id;
  };

  const canTreasuryApprove = async () => {
    const isTre = await UserService.isTreasury();
    return isTre && item?.Status === STATUS.PendingTreasury;
  };

  const canMarkPaid = async () => {
    const isTre = await UserService.isTreasury();
    return isTre && item?.Status === STATUS.ApprovedReady;
  };

  const doManagerApprove = async () => {
    setBusy(true); setError(null);
    try {
      const me = await sp().web.currentUser();
      await ApprovalService.managerApprove(id, me.Title);
      await reload();
    } catch (e: any) { setError(e?.message || 'Approve failed.'); } finally { setBusy(false); }
  };

  const doTreasuryApprove = async () => {
    setBusy(true); setError(null);
    try {
      const me = await sp().web.currentUser();
      await ApprovalService.treasuryApprove(id, me.Title);
      await reload();
    } catch (e: any) { setError(e?.message || 'Approve failed.'); } finally { setBusy(false); }
  };

  const doMarkPaid = async () => {
    setBusy(true); setError(null);
    try {
      const me = await sp().web.currentUser();
      await ApprovalService.markPaid(id, me.Title);
      await reload();
    } catch (e: any) { setError(e?.message || 'Operation failed.'); } finally { setBusy(false); }
  };

  const doReject = async () => {
    if (!rejectNotes.trim()) { setError('Please enter rejection reason.'); return; }
    setBusy(true); setError(null);
    try {
      const me = await sp().web.currentUser();
      await ApprovalService.reject(id, me.Title, rejectNotes);
      await reload();
      setRejectNotes('');
    } catch (e: any) { setError(e?.message || 'Reject failed.'); } finally { setBusy(false); }
  };

  if (!item) return <Text>Loading...</Text>;

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.badge}>{item.RequestID}</span>{' '}
          <Text variant="xLarge">{item.Title || 'Untitled Request'}</Text>{' '}
          <StatusPill value={item.Status} />
        </div>
        <DefaultButton text="Back" onClick={onBack} />
      </div>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      <div className={styles.grid2}>
        <div className={styles.card}>
          <Text variant="large">Request Summary</Text>
          <div style={{ marginTop: 8 }}>
            <div><b>Request Date:</b> {new Date(item.RequestDate).toLocaleDateString()}</div>
            <div><b>Disbursement Date:</b> {new Date(item.DisbursementDate).toLocaleDateString()}</div>
            <div><b>Amount:</b> {fmtMoney(item.Amount)}</div>
            <div><b>Payment Type:</b> {item.PaymentType}</div>
            <div><b>Vendor:</b> {item?.Vendor?.Title}</div>
            <div><b>Reason:</b> {item?.Reason?.Title}</div>
            <div><b>Entity:</b> {item?.Entity?.Title}</div>
            <div><b>Asset:</b> {item?.Asset?.Title}</div>
            <div><b>Vendor Tax ID Provided:</b> {item.VendorTaxIDProvided ? 'Yes' : 'No'}</div>
            <div><b>Verbal Validation Completed:</b> {item.VerbalValidationCompleted ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div className={styles.card}>
          <Text variant="large">Business Purpose</Text>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{item.Purpose || '-'}</div>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <Text variant="large">Attachments</Text>
          {(item as any)._attachments?.length ? (
            (item as any)._attachments.map((a: any) => (
              <div key={a.FileName} style={{ marginTop: 8 }}>
                <a href={a.ServerRelativeUrl} target="_blank" rel="noreferrer">{a.FileName}</a>
              </div>
            ))
          ) : <Text>No attachments</Text>}
        </div>

        <div className={styles.card}>
          <Text variant="large">Activity Log</Text>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{item.ApprovalLog || '-'}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles.card}>
        <Text variant="large">Actions</Text>
        <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 8 }}>
          {/* Manager approve */}
          <ConditionalButton when={canManagerApprove} text="Approve (Manager)" onClick={doManagerApprove} disabled={busy} />
          {/* Treasury approve */}
          <ConditionalButton when={canTreasuryApprove} text="Approve (Treasury)" onClick={doTreasuryApprove} disabled={busy} />
          {/* Mark paid */}
          <ConditionalButton when={canMarkPaid} text="Mark as Paid" onClick={doMarkPaid} disabled={busy} />
        </Stack>

        <div style={{ marginTop: 12 }}>
          <TextField label="Reject reason" multiline rows={3} value={rejectNotes} onChange={(_, v) => setRejectNotes(v || '')} />
          <PrimaryButton text="Reject" onClick={doReject} disabled={busy} />
        </div>
      </div>
    </div>
  );
};

const ConditionalButton: React.FC<{ when: () => Promise<boolean>; text: string; onClick: () => void; disabled?: boolean }> = (props) => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => { props.when().then(setShow); }, []);
  if (!show) return null;
  return <PrimaryButton text={props.text} onClick={props.onClick} disabled={props.disabled} />;
};
