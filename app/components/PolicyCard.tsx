import { Policy } from '@/types/policy';
import { ReplayEvent } from '@/types/event';

interface PolicyCardProps {
  policy: Policy;
  events: ReplayEvent[];
}

export default function PolicyCard({ policy, events }: PolicyCardProps) {
  const getDerivedFrom = (field: keyof Policy) => {
    return events
      .filter(e => {
        if (field === 'status') return e.type === 'POLICY_BOUND' || e.type === 'POLICY_CANCELLED' || e.type === 'POLICY_CREATED' || e.type === 'CLAIM_REPORTED' || e.type === 'CLAIM_APPROVED';
        return e.payload !== undefined && e.payload[field] !== undefined;
      })
      .map(e => {
        if (field === 'status') {
           const val = e.type === 'POLICY_BOUND' ? 'Active' : 
                       e.type === 'POLICY_CANCELLED' ? 'Cancelled' : 
                       e.type === 'CLAIM_REPORTED' ? 'Claim Open' :
                       e.type === 'CLAIM_APPROVED' ? 'Claim Approved' : 'Draft';
           return { type: e.type, val };
        }
        return { type: e.type, val: e.payload[field] };
      });
  };

  const renderDerivedList = (field: keyof Policy) => {
    const list = getDerivedFrom(field);
    if (list.length === 0) return null;
    return (
      <div className="mt-2 space-y-1.5 border-l border-slate-200 dark:border-slate-700 ml-1 pl-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 italic">Audit Traceability</div>
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center text-[11px] font-mono group">
            <span className="text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors mr-2">
              {item.type}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              ({typeof item.val === 'number' ? `$${item.val.toLocaleString()}` : item.val})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Policy Master Record</h2>
        <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
          Live System Data
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="group">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Reference ID</div>
            <div className="text-sm font-mono text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-800 group-hover:border-blue-500/30 transition-colors">
              {policy.id}
            </div>
          </div>
          
          <div className="group">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Policy Holder Name</div>
            <div className="text-base font-semibold text-slate-800 dark:text-white">
              {policy.name}
            </div>
          </div>

          <div className="group">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Operational Status</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
              policy.status.toLowerCase() === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
              policy.status.toLowerCase() === 'cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
              'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              {policy.status}
            </div>
            {renderDerivedList('status')}
          </div>
        </div>

        <div className="space-y-6">
          <div className="group">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Annual Premium (USD)</div>
            <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">
              ${policy.premium.toLocaleString()}
            </div>
            {renderDerivedList('premium')}
          </div>

          <div className="group pt-2 border-t border-slate-200 dark:border-slate-800/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider">Total Coverage Limit</div>
            <div className="text-xl font-mono font-semibold text-slate-700 dark:text-slate-200">
              ${policy.coverageLimit.toLocaleString()}
            </div>
            {renderDerivedList('coverageLimit')}
          </div>
        </div>
      </div>
    </div>
  );
}
