export const LISTS = {
  VendorPaymentRequests: 'VendorPaymentRequests',
  VendorDirectory: 'VendorDirectory',
  RequestReasons: 'RequestReasons',
  Entities: 'Entities',
  Assets: 'Assets',
  ApprovalMatrix: 'ApprovalMatrix'
} as const;

export const FIELDS = {
  // VendorPaymentRequests
  Title: 'Title',
  RequestID: 'RequestID',
  Requester: 'Requester', // Person
  RequestDate: 'RequestDate',
  DisbursementDate: 'DisbursementDate',
  Amount: 'Amount',
  PaymentType: 'PaymentType', // Choice: ACH, Wire, Check
  Vendor: 'Vendor',           // Lookup -> VendorDirectory: Title
  Reason: 'Reason',           // Lookup -> RequestReasons: Title
  Entity: 'Entity',           // Lookup -> Entities: Title
  Asset: 'Asset',             // Lookup -> Assets: Title
  Purpose: 'Purpose',         // MLT
  VendorTaxIDProvided: 'Vendor_x0020_Tax_x0020_ID_x0020_',         // Yes/No
  VerbalValidationCompleted: 'Verbal_x0020_Validation_x0020_Co', // Yes/No
  Status: 'Status', // Submitted, Pending Manager Approval, Pending Treasury Review,
                    // Approved Ready for Payment, Payment Completed, Rejected
  ApprovalLog: 'ApprovalLog', // MLT
  CurrentApprover: 'CurrentApprover', // Person
  CurrentApproverRole: 'CurrentApproverRole', // Choice: Manager, Treasury, None
} as const;

// SharePoint group that represents treasury approvers
export const GROUPS = {
  Treasury: 'CR-Treasury'
} as const;
