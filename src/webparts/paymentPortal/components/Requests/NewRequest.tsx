// src/webparts/paymentPortal/components/Requests/NewRequest.tsx
import * as React from 'react';
import {
  TextField, Dropdown, IDropdownOption, DatePicker, Checkbox,
  PrimaryButton, MessageBar, MessageBarType, Label
} from '@fluentui/react';

import styles from '../../PaymentPortal.module.scss';
import { LookupService } from '../../services/LookupService';
import { RequestService } from '../../services/RequestService';

type Props = { onAfterSubmit: (id: number) => void };

export const NewRequest: React.FC<Props> = ({ onAfterSubmit }) => {
  const [title, setTitle] = React.useState('');
  const [requestDate, setRequestDate] = React.useState<Date | null>(new Date());
  const [disbDate, setDisbDate] = React.useState<Date | null>(new Date());
  const [amount, setAmount] = React.useState<number>(0);
  const [paymentType, setPaymentType] = React.useState<'ACH' | 'Wire' | 'Check'>('ACH');

  const [vendor, setVendor] = React.useState<number | null>(null);
  const [reason, setReason] = React.useState<number | null>(null);
  const [entity, setEntity] = React.useState<number | null>(null);
  const [asset, setAsset] = React.useState<number | null>(null);

  const [taxId, setTaxId] = React.useState(false);
  const [verbal, setVerbal] = React.useState(false);
  const [purpose, setPurpose] = React.useState('');

  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const [vendorOpts, setVendorOpts] = React.useState<IDropdownOption[]>([]);
  const [reasonOpts, setReasonOpts] = React.useState<IDropdownOption[]>([]);
  const [entityOpts, setEntityOpts] = React.useState<IDropdownOption[]>([]);
  const [assetOpts, setAssetOpts] = React.useState<IDropdownOption[]>([]);

  React.useEffect(() => {
    (async () => {
      const [v, r, e, a] = await Promise.all([
        LookupService.vendors(), LookupService.reasons(), LookupService.entities(), LookupService.assets()
      ]);
      setVendorOpts(v.map(x => ({ key: x.Id, text: x.Title })));
      setReasonOpts(r.map(x => ({ key: x.Id, text: x.Title })));
      setEntityOpts(e.map(x => ({ key: x.Id, text: x.Title })));
      setAssetOpts(a.map(x => ({ key: x.Id, text: x.Title })));
    })();
  }, []);

  const onFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files ? Array.from(ev.target.files) : [];
    setFiles(f);
  };

  const validate = () => {
    if (!requestDate || !disbDate) return 'Please select both dates.';
    if (disbDate < requestDate) return 'Disbursement date cannot be earlier than Request date.';
    if (!amount || amount < 1) return 'Amount must be at least 1.';
    if (!vendor || !reason || !entity || !asset) return 'Please select Vendor, Reason, Entity, and Asset.';
    if (!purpose.trim()) return 'Please enter Business Purpose.';
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    setBusy(true);
    try {
      const res = await RequestService.createAndSubmit({
        Title: title,
        RequestDate: requestDate!.toISOString(),
        DisbursementDate: disbDate!.toISOString(),
        Amount: amount,
        PaymentType: paymentType,     // server default is ACH as well
        VendorId: vendor!,
        ReasonId: reason!,
        EntityId: entity!,
        AssetId: asset!,
        VendorTaxIDProvided: taxId,
        VerbalValidationCompleted: verbal,
        Purpose: purpose
      }, files);

      const idObj: any = await res.select('Id')();
      onAfterSubmit(idObj.Id);
    } catch (e: any) {
      setError(e?.message || 'Failed to submit the request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.card}>
      <Label>New Payment Request</Label>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}

      {/* Form grid: Title full row, then two-column rows */}
      <div className={styles.formGrid}>
        <div className={styles.colSpan2}>
          <TextField
            label="Request Title (optional)"
            placeholder="Give your request a short title"
            value={title}
            onChange={(_, v) => setTitle(v || '')}
          />
        </div>

        <DatePicker
          label="Request Date *"
          value={requestDate || undefined}
          onSelectDate={(d) => setRequestDate(d || null)}
        />

        <DatePicker
          label="Disbursement Date *"
          value={disbDate || undefined}
          onSelectDate={(d) => setDisbDate(d || null)}
        />

        <TextField
          label="Amount *"
          type="number"
          value={String(amount)}
          onChange={(_, v) => setAmount(Number(v || 0))}
        />

        <Dropdown
          label="Payment Type *"
          selectedKey={paymentType}
          options={[{ key:'ACH', text:'ACH' }, { key:'Wire', text:'Wire' }, { key:'Check', text:'Check' }]}
          onChange={(_, opt) => setPaymentType(opt!.key as any)}
        />

        <Dropdown
          label="Vendor *"
          placeholder="Select vendor"
          options={vendorOpts}
          selectedKey={vendor}
          onChange={(_, o) => setVendor(o?.key as number)}
        />

        <Dropdown
          label="Reason *"
          options={reasonOpts}
          selectedKey={reason}
          onChange={(_, o) => setReason(o?.key as number)}
        />

        <Dropdown
          label="Entity *"
          options={entityOpts}
          selectedKey={entity}
          onChange={(_, o) => setEntity(o?.key as number)}
        />

        <Dropdown
          label="Asset *"
          options={assetOpts}
          selectedKey={asset}
          onChange={(_, o) => setAsset(o?.key as number)}
        />

        <Checkbox label="Vendor Tax ID Provided" checked={taxId} onChange={(_, ck) => setTaxId(!!ck)} />
        <Checkbox label="Verbal Validation Completed" checked={verbal} onChange={(_, ck) => setVerbal(!!ck)} />

        <div className={styles.colSpan2}>
          <TextField
            label="Business Purpose / Description *"
            multiline rows={4}
            value={purpose}
            onChange={(_, v) => setPurpose(v || '')}
          />
        </div>

        <div className={styles.colSpan2}>
          <Label>Attachments (optional)</Label>
          <input type="file" multiple onChange={onFileChange} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <PrimaryButton text={busy ? 'Submitting...' : 'Submit Request'} onClick={submit} disabled={busy} />
      </div>
    </div>
  );
};
