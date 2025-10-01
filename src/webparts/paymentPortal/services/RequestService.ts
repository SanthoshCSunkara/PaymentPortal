// src/webparts/paymentPortal/services/RequestService.ts

import { sp } from './spfxContext';
import { LISTS, FIELDS } from '../constants/lists';
import { STATUS, ROLES } from '../constants/status';
import { makeRequestId, nowIso } from '../Utilities/format';
import { UserService } from './UserService';

export type NewRequestPayload = {
  Title?: string;
  RequestDate: string;         // ISO
  DisbursementDate: string;    // ISO
  Amount: number;
  PaymentType?: 'ACH' | 'Wire' | 'Check'; // defaults to ACH
  VendorId: number;
  ReasonId: number;
  EntityId: number;
  AssetId: number;
  VendorTaxIDProvided?: boolean;
  VerbalValidationCompleted?: boolean;
  Purpose: string;
};

export const RequestService = {
  /**
   * Create the list item, upload attachments, assign initial status/approver,
   * and return the PnP item wrapper.
   */
  createAndSubmit: async (p: NewRequestPayload, files: File[]) => {
    const me = await sp().web.currentUser();

    // 1) Create the item with initial Submitted status
    const addRes = await sp()
  .web
  .lists.getByTitle(LISTS.VendorPaymentRequests)
  .items.add({
    [FIELDS.Title]: p.Title || '',
    [`${FIELDS.Requester}Id`]: me.Id,
    [FIELDS.RequestDate]: p.RequestDate,
    [FIELDS.DisbursementDate]: p.DisbursementDate,
    [FIELDS.Amount]: p.Amount,
    [FIELDS.PaymentType]: p.PaymentType || 'ACH',
    [`${FIELDS.Vendor}Id`]: p.VendorId,
    [`${FIELDS.Reason}Id`]: p.ReasonId,
    [`${FIELDS.Entity}Id`]: p.EntityId,
    [`${FIELDS.Asset}Id`]: p.AssetId,
    [FIELDS.Purpose]: p.Purpose,
    [FIELDS.Status]: STATUS.Submitted,
    [FIELDS.ApprovalLog]: `[${nowIso()}] ${me.Title} submitted request`
  });

        const item = addRes.item;
        try {
            await item.update({
                [FIELDS.VendorTaxIDProvided]: !!p.VendorTaxIDProvided,
                [FIELDS.VerbalValidationCompleted]: !!p.VerbalValidationCompleted,
            });
        } catch { /* swallow – non-blocking */ }
    // 2) Generate friendly RequestID (e.g., VPR-0025) from the list item Id
    const idObj = await item.select('Id')();
    await item.update({ [FIELDS.RequestID]: makeRequestId(idObj.Id) });

    // 3) Upload attachments (if any)
    if (files && files.length > 0) {
      // '@pnp/sp/attachments' is imported in spfxContext, so this is available
      await item.attachmentFiles.addMultiple(
        files.map(f => ({ name: f.name, content: f }))
      );
    }

    // 4) Routing rule: ≤10,000 → Treasury; else → Manager
    const firstStop =
      p.Amount <= 10000 ? STATUS.PendingTreasury : STATUS.PendingManager;

    let currentApproverId: number | null = null;
    let currentRole: typeof ROLES[keyof typeof ROLES] = ROLES.None;

    if (firstStop === STATUS.PendingManager) {
      // Try to resolve manager (User Profiles first, then Graph if consented)
      const mgr = await UserService.getManager(me.Email);
      if (mgr?.Id) {
        currentApproverId = mgr.Id;
      }
      currentRole = ROLES.Manager; // even if null, the stage is Manager
    } else {
      // Treasury is represented by the CR-Treasury SharePoint group
      currentRole = ROLES.Treasury;
    }

    // Append routing note to ApprovalLog
    const curLog =
      (await item.select(FIELDS.ApprovalLog)())[FIELDS.ApprovalLog] || '';
    await item.update({
      [FIELDS.Status]: firstStop,
      [`${FIELDS.CurrentApprover}Id`]: currentApproverId,
      [FIELDS.CurrentApproverRole]: currentRole,
      [FIELDS.ApprovalLog]: `${curLog}\n[${nowIso()}] Routed to ${firstStop}`
    });

    return item;
  },

  /** Items created by me (requester) */
  mySubmitted: async () => {
    const me = await sp().web.currentUser();
    return sp()
      .web
      .lists.getByTitle(LISTS.VendorPaymentRequests)
      .items
      .select('Id,Title,RequestID,Amount,Status,Modified')
      // Person field filter syntax: "<InternalName>Id eq <number>"
      .filter(`${FIELDS.Requester}Id eq ${me.Id}`)
      .orderBy('Modified', false)();
  },

  /**
   * Requests that need my approval:
   * - Manager view: Pending Manager Approval + CurrentApprover == me
   * - Treasury view: Pending Treasury Review and I am in CR-Treasury
   */
  approvalsForMe: async () => {
    const me = await sp().web.currentUser();
    const amTreasury = await UserService.isTreasury();

    const managerItems = await sp()
      .web
      .lists.getByTitle(LISTS.VendorPaymentRequests)
      .items
      .select('Id,Title,RequestID,Amount,Status,Modified')
      .filter(
        `${FIELDS.Status} eq '${STATUS.PendingManager}' and ` +
        `${FIELDS.CurrentApprover}Id eq ${me.Id}`
      )
      .orderBy('Modified', false)();

    let treasuryItems: any[] = [];
    if (amTreasury) {
      treasuryItems = await sp()
        .web
        .lists.getByTitle(LISTS.VendorPaymentRequests)
        .items
        .select('Id,Title,RequestID,Amount,Status,Modified')
        .filter(`${FIELDS.Status} eq '${STATUS.PendingTreasury}'`)
        .orderBy('Modified', false)();
    }

    return { managerItems, treasuryItems };
  },

  /** Fully expanded single item for the Details page */
  getById: async (id: number) => {
    return sp()
      .web
      .lists.getByTitle(LISTS.VendorPaymentRequests)
      .items.getById(id)
      .select(
        '*',
        'Author/Id', 'Author/Title',
        'Editor/Id', 'Editor/Title',
        `${FIELDS.CurrentApprover}/Id`, `${FIELDS.CurrentApprover}/Title`,
        `${FIELDS.Vendor}/Id`, `${FIELDS.Vendor}/Title`,
        `${FIELDS.Reason}/Id`, `${FIELDS.Reason}/Title`,
        `${FIELDS.Entity}/Id`, `${FIELDS.Entity}/Title`,
        `${FIELDS.Asset}/Id`, `${FIELDS.Asset}/Title`
      )
      .expand(
        'Author',
        'Editor',
        FIELDS.CurrentApprover,
        FIELDS.Vendor,
        FIELDS.Reason,
        FIELDS.Entity,
        FIELDS.Asset
      )();
  },
};
