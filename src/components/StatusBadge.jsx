import { STATUS_CONFIG } from '../utils/helpers';

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.color}/20 ${config.textColor} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}
