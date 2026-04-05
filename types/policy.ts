export interface Policy {
  id: string;
  name: string;
  premium: number;
  coverageLimit: number;
  status: 'active' | 'pending' | 'cancelled';
}
