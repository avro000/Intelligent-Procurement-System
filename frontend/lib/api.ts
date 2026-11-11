import { broadcastSyncEvent } from './sync';

const BASE_URL = '/api/v1';

export const DEMO_USERS = [
  { label: 'David Miller (IT Supervisor)', email: 'david.supervisor@company.com', password: 'password123', role: 'SUPERVISOR' },
  { label: 'Rachel Zhang (Ops Supervisor)', email: 'rachel.supervisor@company.com', password: 'password123', role: 'SUPERVISOR' },
  { label: 'Alex Turner (Requester - IT)', email: 'alex.employee@company.com', password: 'password123', role: 'EMPLOYEE' },
  { label: 'Sarah Jenkins (Requester - Ops)', email: 'sarah.employee@company.com', password: 'password123', role: 'EMPLOYEE' },
  { label: 'Apex Tech Supplier Rep', email: 'vendor.apex@company.com', password: 'password123', role: 'VENDOR' },
  { label: 'Silicon Edge Supplier Rep', email: 'vendor.quick@company.com', password: 'password123', role: 'VENDOR' },
  { label: 'ByteCraft Supplier Rep', email: 'vendor.bytecraft@company.com', password: 'password123', role: 'VENDOR' },
  { label: 'ErgoComfort Supplier Rep', email: 'vendor.ergo@company.com', password: 'password123', role: 'VENDOR' },
  { label: 'System Administrator', email: 'admin@company.com', password: 'password123', role: 'ADMIN' },
];

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  getMe: () => request('/auth/me'),

  // PRs
  getPRs: () => request('/purchase-requests'),
  getPRDetail: (id: string) => request(`/purchase-requests/${id}`),
  createPR: async (data: any) => {
    const res = await request('/purchase-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    broadcastSyncEvent({ type: 'PR_UPDATED', pr_id: res.id });
    return res;
  },
  deletePR: async (prId: string) => {
    const res = await request(`/purchase-requests/${prId}`, { method: 'DELETE' });
    broadcastSyncEvent({ type: 'PR_UPDATED', pr_id: prId });
    return res;
  },
  checkDuplicates: (itemId: string, quantity: number) =>
    request(`/purchase-requests/duplicate-check?item_id=${itemId}&quantity=${quantity}`),
  issueRFQs: async (prId: string, vendorIds: string[], deadline?: string) => {
    const res = await request(`/purchase-requests/${prId}/issue-rfqs`, {
      method: 'POST',
      body: JSON.stringify({ vendor_ids: vendorIds, due_date: deadline }),
    });
    broadcastSyncEvent({ type: 'RFQS_ISSUED', pr_id: prId });
    return res;
  },
  selectVendor: async (prId: string, vendorId: string, justification?: string) => {
    const res = await request(`/purchase-requests/${prId}/vendor-selection`, {
      method: 'POST',
      body: JSON.stringify({
        selected_vendor_id: vendorId,
        vendor_id: vendorId,
        override_reason: justification || null,
        justification: justification || null,
      }),
    });
    broadcastSyncEvent({ type: 'VENDOR_SELECTED', pr_id: prId });
    return res;
  },
  finalApproval: async (prId: string) => {
    const res = await request(`/purchase-requests/${prId}/final-approval`, {
      method: 'POST',
      body: JSON.stringify({ pr_id: prId }),
    });
    broadcastSyncEvent({ type: 'PR_UPDATED', pr_id: prId });
    return res;
  },
  returnPR: async (prId: string, reason: string) => {
    const res = await request(`/purchase-requests/${prId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    broadcastSyncEvent({ type: 'PR_UPDATED', pr_id: prId });
    return res;
  },
  rejectPR: async (prId: string, reason: string) => {
    const res = await request(`/purchase-requests/${prId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    broadcastSyncEvent({ type: 'PR_UPDATED', pr_id: prId });
    return res;
  },
  resubmitPR: async (prId: string, data: any) => {
    const res = await request(`/purchase-requests/${prId}/resubmit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    broadcastSyncEvent({ type: 'PR_UPDATED', pr_id: prId });
    return res;
  },

  // Catalog & Inventory
  getItems: () => request('/items'),
  getItem: (id: string) => request(`/items/${id}`),
  getDepartments: () => request('/departments'),
  checkInventory: (itemId: string, quantity: number) =>
    request(`/inventory/items/${itemId}?quantity=${quantity}`),

  // Vendors
  getVendors: () => request('/vendors'),
  getVendor: (id: string) => request(`/vendors/${id}`),
  getVendorRecommendations: (itemId: string) =>
    request(`/vendors/recommendations?item_id=${itemId}`),
  getVendorRecommendationsRAG: (itemId: string, quantity: number) =>
    request(`/vendors/recommendations/rag?item_id=${itemId}&quantity=${quantity}`),

  // Recommendation Snapshots
  getRecommendationSnapshot: (prId: string) =>
    request(`/purchase-requests/${prId}/recommendation`),
  saveRecommendationSnapshot: (prId: string, payload: any) =>
    request(`/purchase-requests/${prId}/recommendation`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  refreshRecommendationSnapshot: (prId: string) =>
    request(`/purchase-requests/${prId}/recommendation/refresh`, { method: 'POST' }),

  // RFQs & Quotations
  getRFQs: () => request('/rfqs'),
  getRFQ: (id: string) => request(`/rfqs/${id}`),
  submitQuotation: async (rfqId: string, data: any) => {
    const res = await request(`/rfqs/${rfqId}/quotations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    broadcastSyncEvent({ type: 'QUOTATION_SUBMITTED', rfq_id: rfqId });
    return res;
  },
  getQuotationAnalysis: (prId: string) =>
    request(`/purchase-requests/${prId}/quotation-analysis`),

  // Purchase Orders
  getPOs: () => request('/purchase-orders'),
  getPO: (id: string) => request(`/purchase-orders/${id}`),
  generatePO: async (prId: string) => {
    const res = await request(`/purchase-requests/${prId}/purchase-order`, { method: 'POST' });
    broadcastSyncEvent({ type: 'PO_GENERATED', pr_id: prId });
    return res;
  },
  downloadPO: (poId: string, poNumber: string) => {
    const token = getToken();
    const url = `${BASE_URL}/purchase-orders/${poId}/pdf${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${poNumber}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (notifId: string) =>
    request(`/notifications/${notifId}/read`, { method: 'POST' }),

  // AI
  aiChat: (message: string, context_type?: string, context_id?: string) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context_type, context_id }),
    }),
  aiExplainQuotation: (prId: string) =>
    request(`/ai/explain/quotation-analysis/${prId}`, { method: 'POST' }),
  aiExplainVendor: (prId: string) =>
    request(`/ai/explain/vendor-recommendation/${prId}`, { method: 'POST' }),

  // Admin DB Explorer
  getDbTables: () => request('/admin/db/tables'),
  getDbTableData: (tableName: string, limit = 100, offset = 0, search = '') =>
    request(`/admin/db/tables/${tableName}?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`),
  updateDbTableRow: (tableName: string, rowId: string, data: any) =>
    request(`/admin/db/tables/${tableName}/${rowId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    }),
  createDbTableRow: (tableName: string, data: any) =>
    request(`/admin/db/tables/${tableName}`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    }),
  deleteDbTableRow: (tableName: string, rowId: string) =>
    request(`/admin/db/tables/${tableName}/${rowId}`, { method: 'DELETE' }),
  executeRawSql: (query: string) =>
    request('/admin/db/execute-sql', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
