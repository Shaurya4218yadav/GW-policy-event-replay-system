export interface Policy {
  id: string;
  name: string;
  premium: number;
  coverageLimit: number;
  status: 'active' | 'pending' | 'cancelled' | 'Active' | 'Draft' | 'Cancelled' | 'Claim Open' | 'Claim Approved' | 'Locked';
}
