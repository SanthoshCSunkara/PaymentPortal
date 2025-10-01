import { sp } from './spfxContext';
import { LISTS, FIELDS } from '../constants/lists';
import { STATUS, ROLES } from '../constants/status';
import { nowIso } from '../Utilities/format';

async function appendLog(itemId: number, line: string) {
  const list = sp().web.lists.getByTitle(LISTS.VendorPaymentRequests);
  const cur = await list.items.getById(itemId).select(FIELDS.ApprovalLog)();
  await list.items.getById(itemId).update({
    [FIELDS.ApprovalLog]: `${cur[FIELDS.ApprovalLog] || ''}\n[${nowIso()}] ${line}`
  });
}

export const ApprovalService = {
  /** Manager approves -> Treasury */
  managerApprove: async (id: number, userName: string) => {
    const list = sp().web.lists.getByTitle(LISTS.VendorPaymentRequests);
    await list.items.getById(id).update({
      [FIELDS.Status]: STATUS.PendingTreasury,
      [FIELDS.CurrentApprover + 'Id']: null,
      [FIELDS.CurrentApproverRole]: ROLES.Treasury
    });
    await appendLog(id, `${userName} approved (Manager). Routed to Treasury.`);
  },

  /** Treasury approves -> Ready for Payment */
  treasuryApprove: async (id: number, userName: string) => {
    const list = sp().web.lists.getByTitle(LISTS.VendorPaymentRequests);
    await list.items.getById(id).update({
      [FIELDS.Status]: STATUS.ApprovedReady,
      [FIELDS.CurrentApprover + 'Id']: null,
      [FIELDS.CurrentApproverRole]: ROLES.None
    });
    await appendLog(id, `${userName} approved (Treasury). Marked Ready for Payment.`);
  },

  /** Treasury marks paid */
  markPaid: async (id: number, userName: string) => {
    const list = sp().web.lists.getByTitle(LISTS.VendorPaymentRequests);
    await list.items.getById(id).update({
      [FIELDS.Status]: STATUS.Completed
    });
    await appendLog(id, `${userName} marked Payment Completed.`);
  },

  /** Reject (Manager or Treasury) */
  reject: async (id: number, userName: string, reason: string) => {
    const list = sp().web.lists.getByTitle(LISTS.VendorPaymentRequests);
    await list.items.getById(id).update({
      [FIELDS.Status]: STATUS.Rejected,
      [FIELDS.CurrentApprover + 'Id']: null,
      [FIELDS.CurrentApproverRole]: ROLES.None
    });
    await appendLog(id, `${userName} rejected: ${reason}`);
  }
};
