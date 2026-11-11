export interface WorkflowStateInfo {
  label: string;
  badgeStyle: string;
  description: string;
}

export function getWorkflowState(status?: string): WorkflowStateInfo {
  switch (status) {
    case 'DRAFT':
      return {
        label: 'Draft',
        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300',
        description: 'Requisition draft is being prepared.',
      };
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return {
        label: 'Pending Review',
        badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300',
        description: 'Submitted and awaiting supervisor review in Checking Sheet.',
      };
    case 'REVISION_REQUIRED':
      return {
        label: 'Revision Required',
        badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Supervisor requested modifications. Awaiting requester resubmission.',
      };
    case 'RFQS_ISSUED':
    case 'RFQ_ISSUED':
    case 'AWAITING_QUOTATIONS':
    case 'AWAITING_QUOTATION':
    case 'APPROVED_FOR_RFQ':
      return {
        label: 'Awaiting Quotes',
        badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        description: 'RFQs dispatched to suppliers. Bids pending submission.',
      };
    case 'QUOTATIONS_READY':
    case 'QUOTATION_RECEIVED':
    case 'QUOTED':
    case 'VENDOR_SELECTION_PENDING':
      return {
        label: 'Quotes Received',
        badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Supplier bids submitted and ready for multi-criteria evaluation.',
      };
    case 'FINAL_APPROVAL_PENDING':
    case 'VENDOR_SELECTED':
    case 'APPROVED':
      return {
        label: 'Ready for PO',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Supplier awarded. Ready for final approval and official PO issuance.',
      };
    case 'PO_GENERATED':
      return {
        label: 'PO Generated',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Official purchase order PDF generated and dispatched.',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        description: 'Procurement cycle completed.',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        badgeStyle: 'bg-rose-100 text-rose-800 border-rose-300',
        description: 'Procurement request rejected.',
      };
    default:
      return {
        label: status || 'Pending',
        badgeStyle: 'bg-slate-100 text-slate-700 border-slate-300',
        description: 'Status: ' + (status || 'Unknown'),
      };
  }
}

export function categorizePRForRole(pr: any, role: string): 'ACTION_REQUIRED' | 'WAITING' | 'HISTORY' {
  const status = pr?.status || '';

  if (['PO_GENERATED', 'COMPLETED', 'REJECTED'].includes(status)) {
    return 'HISTORY';
  }

  const upperRole = (role || '').toUpperCase();

  if (upperRole === 'EMPLOYEE' || upperRole === 'REQUESTER') {
    if (status === 'REVISION_REQUIRED' || status === 'DRAFT') {
      return 'ACTION_REQUIRED';
    }
    return 'WAITING';
  }

  if (upperRole === 'SUPERVISOR') {
    if (
      status === 'SUBMITTED' ||
      status === 'UNDER_REVIEW' ||
      status === 'QUOTATIONS_READY' ||
      status === 'QUOTATION_RECEIVED' ||
      status === 'VENDOR_SELECTION_PENDING' ||
      status === 'VENDOR_SELECTED' ||
      status === 'FINAL_APPROVAL_PENDING' ||
      status === 'APPROVED'
    ) {
      return 'ACTION_REQUIRED';
    }
    return 'WAITING';
  }

  if (upperRole === 'ADMIN') {
    if (
      status === 'SUBMITTED' ||
      status === 'UNDER_REVIEW' ||
      status === 'REVISION_REQUIRED' ||
      status === 'QUOTATIONS_READY' ||
      status === 'QUOTATION_RECEIVED' ||
      status === 'VENDOR_SELECTION_PENDING' ||
      status === 'VENDOR_SELECTED' ||
      status === 'FINAL_APPROVAL_PENDING' ||
      status === 'APPROVED'
    ) {
      return 'ACTION_REQUIRED';
    }
    return 'WAITING';
  }

  return 'WAITING';
}

export interface PrimaryAction {
  type: 'REVISE' | 'EVALUATE' | 'REVIEW' | 'VIEW';
  label: string;
  style: string;
}

export function getPrimaryAction(pr: any, role: string): PrimaryAction {
  const status = pr?.status || '';
  const upperRole = (role || '').toUpperCase();

  if ((upperRole === 'EMPLOYEE' || upperRole === 'REQUESTER' || upperRole === 'ADMIN') && status === 'REVISION_REQUIRED') {
    return {
      type: 'REVISE',
      label: 'Revise Request',
      style: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    };
  }

  if (
    (upperRole === 'SUPERVISOR' || upperRole === 'ADMIN') &&
    ['QUOTATIONS_READY', 'QUOTATION_RECEIVED', 'VENDOR_SELECTION_PENDING'].includes(status)
  ) {
    return {
      type: 'EVALUATE',
      label: 'Evaluate Bids',
      style: 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm',
    };
  }

  if (
    (upperRole === 'SUPERVISOR' || upperRole === 'ADMIN') &&
    (status === 'SUBMITTED' || status === 'UNDER_REVIEW')
  ) {
    return {
      type: 'REVIEW',
      label: 'Review in Checking Sheet',
      style: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    };
  }

  if (
    (upperRole === 'SUPERVISOR' || upperRole === 'ADMIN') &&
    ['VENDOR_SELECTED', 'FINAL_APPROVAL_PENDING', 'APPROVED'].includes(status)
  ) {
    return {
      type: 'REVIEW',
      label: 'Generate PO',
      style: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    };
  }

  return {
    type: 'VIEW',
    label: 'Checking Sheet',
    style: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  };
}
