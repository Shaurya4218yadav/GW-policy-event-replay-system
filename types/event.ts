export interface ReplayEvent {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}
