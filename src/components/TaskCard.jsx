import PriorityBadge from './PriorityBadge';
import { formatRelativeDate, getDueDateStatus } from '../utils/helpers';
import { Calendar, MessageSquare, GripVertical } from 'lucide-react';

export default function TaskCard({ task, onClick, dragHandleProps }) {
  const dueDateStatus = getDueDateStatus(task.dueDate);

  const dueDateClasses = {
    overdue: 'text-red-400',
    today: 'text-amber-400',
    tomorrow: 'text-amber-300',
    soon: 'text-orange-300',
    normal: 'text-surface-500',
    none: 'text-surface-500',
  };

  return (
    <div
      onClick={onClick}
      className="glass rounded-xl p-3.5 cursor-pointer card-lift group border border-surface-700/40 hover:border-surface-600/60"
    >
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="mt-0.5 text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="text-sm font-medium text-surface-200 mb-2 leading-snug group-hover:text-white transition-colors">
            {task.title}
          </h4>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-surface-500 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-700/70 text-surface-400 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <PriorityBadge priority={task.priority} size="xs" />

            {task.dueDate && (
              <div className={`flex items-center gap-1 text-[11px] ${dueDateClasses[dueDateStatus]}`}>
                <Calendar size={11} />
                <span className={dueDateStatus === 'overdue' ? 'font-semibold' : ''}>
                  {formatRelativeDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
