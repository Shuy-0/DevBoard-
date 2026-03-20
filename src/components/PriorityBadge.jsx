import { PRIORITY_CONFIG } from '../utils/helpers';

export default function PriorityBadge({ priority, size = 'sm' }) {
  const config = PRIORITY_CONFIG[priority];
  if (!config) return null;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium
        ${config.color} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${priority === 'urgent' ? 'pulse-urgent' : ''}`} />
      {config.label}
    </span>
  );
}
