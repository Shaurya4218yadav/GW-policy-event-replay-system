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
      <div className="mt-4 space-y-2 border-l border-white/5 ml-1 pl-4">
        <div className="tool-label !text-[6px] mb-2 font-bold tracking-[0.2em] text-text-dim/60">AUDIT_TRACEABILITY</div>
        {list.map((item, idx) => (
          <div key={idx} className="flex items-center text-[10px] font-mono group/item">
            <span className="text-text-dim group-hover/item:text-text-secondary transition-colors mr-3 uppercase !text-[8.5px]">
              {item.type}
            </span>
            <span className="text-accent-secondary font-bold tracking-tight">
              ({typeof item.val === 'number' ? `₹${item.val.toLocaleString()}` : item.val})
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel p-8 rounded-2xl animate-hud-slide">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="tool-title !text-sm flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent glow-primary animate-signal-pulse" />
            POLICY_MASTER_RECORD
          </h2>
          <div className="forensic-text mt-2 text-text-dim uppercase tracking-[0.3em] !text-[8px] font-bold">REGISTRY_ID: {policy.id}</div>
        </div>
        <div className="forensic-text !text-[7.5px] text-accent tracking-[0.5em] pt-1 font-extrabold opacity-80">
          [ AUTHENTICATED_LIVE_STREAM ]
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* PRIMARY METADATA */}
        <div className="lg:col-span-4 space-y-10">
          <div>
            <div className="tool-label !text-[7px] opacity-30 mb-3">HOLDER_ENTITY</div>
            <div className="tool-value !text-2xl text-foreground tracking-tight">
              {policy.name}
            </div>
          </div>

          <div>
            <div className="tool-label !text-[7px] opacity-30 mb-4 tracking-[0.2em]">STATE_VECTOR</div>
            <div className={`tool-value !text-[11px] tracking-[0.4em] uppercase font-black px-4 py-2 glass-panel inline-block rounded-full ${
              policy.status.toLowerCase() === 'active' ? 'text-status-success glow-primary border-status-success/20' :
              policy.status.toLowerCase() === 'cancelled' ? 'text-status-error border-status-error/20' :
              'text-status-warning border-status-warning/20'
            }`}>
              {policy.status}
            </div>
            <div className="mt-8">
              {renderDerivedList('status')}
            </div>
          </div>
        </div>

        {/* FINANCIAL LAYER */}
        <div className="lg:col-span-8 flex flex-col justify-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
             <div className="group transition-all duration-700">
                <div className="tool-label !text-[7.5px] opacity-30 mb-4 tracking-[0.2em]">ANNUAL_PREMIUM_SIGNAL</div>
                <div className="tool-value !text-7xl text-accent font-black tracking-tighter transition-all group-hover:text-signal-gradient group-hover:drop-shadow-[0_0_35px_rgba(34,211,238,0.5)]">
                  ₹{policy.premium.toLocaleString()}
                </div>
                <div className="mt-10 border-t border-white/5 pt-6">
                  {renderDerivedList('premium')}
                </div>
             </div>

             <div className="group transition-all duration-700">
                <div className="tool-label !text-[7.5px] opacity-30 mb-4 tracking-[0.2em]">LIMIT_OF_LIABILITY</div>
                <div className="tool-value !text-4xl text-text-primary/60 font-black tracking-tight transition-all group-hover:text-text-primary">
                  ₹{policy.coverageLimit.toLocaleString()}
                </div>
                <div className="mt-10 border-t border-white/5 pt-6">
                  {renderDerivedList('coverageLimit')}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
