import { Policy } from '@/types/policy';

interface PolicyCardProps {
  policy: Policy;
}

export default function PolicyCard({ policy }: PolicyCardProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Policy Card</h2>
      <div className="space-y-2">
        <p><strong>ID:</strong> {policy.id}</p>
        <p><strong>Name:</strong> {policy.name}</p>
        <p><strong>Premium:</strong> ${policy.premium}</p>
        <p><strong>Coverage Limit:</strong> ${policy.coverageLimit}</p>
        <p><strong>Status:</strong> <span className="capitalize">{policy.status}</span></p>
      </div>
    </div>
  );
}
