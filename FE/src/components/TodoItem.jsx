import { useState } from 'react';

const PRIORITY_COLORS = {
  high: 'border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50',
  medium: 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50',
  low: 'border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50',
};

const PRIORITY_BADGES = {
  high: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
  medium: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
  low: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
};

const PRIORITY_LABELS = {
  high: '🔥 높음',
  medium: '⚡ 보통',
  low: '🌱 낮음',
};

const TASK_TYPE_LABELS = {
  once: '📌 한 번',
  daily: '🔄 매일',
  weekly: '📅 요일별',
  period: '⏰ 기간',
};

const WEEKDAY_NAMES = {
  Mon: '월',
  Tue: '화',
  Wed: '수',
  Thu: '목',
  Fri: '금',
  Sat: '토',
  Sun: '일',
};

function TodoItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  isCompleted,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleComplete = () => {
    onToggleComplete(task.id, isCompleted);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const formatRepeatDays = (repeatDaysString) => {
    if (!repeatDaysString) return '';
    const days = repeatDaysString.split(',');
    return days.map((day) => WEEKDAY_NAMES[day.trim()] || day).join(', ');
  };

  return (
    <div
      className={`border-l-4 rounded-2xl shadow-lg p-5 mb-4 transition-all hover:shadow-xl hover:-translate-y-1 duration-200 ${
        PRIORITY_COLORS[task.priority] || 'border-l-gray-500 bg-gray-50'
      } ${task.status === 'archived' ? 'opacity-60' : ''} bg-white`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggleComplete}
          disabled={task.status === 'archived'}
          className="mt-1.5 w-6 h-6 text-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-xl font-bold text-gray-800 ${
                isCompleted ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                  PRIORITY_BADGES[task.priority] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {PRIORITY_LABELS[task.priority] || task.priority}
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                {TASK_TYPE_LABELS[task.task_type] || task.task_type}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-gray-600 text-base mt-2 leading-relaxed">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {task.task_type === 'once' && task.due_date && (
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full font-medium">
                📅 마감: {formatDate(task.due_date)}
              </span>
            )}
            {task.task_type === 'period' && (
              <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full font-medium">
                ⏰ {formatDate(task.start_date)} ~ {formatDate(task.end_date)}
              </span>
            )}
            {task.task_type === 'weekly' && task.repeat_days && (
              <span className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full font-medium">
                📆 {formatRepeatDays(task.repeat_days)}
              </span>
            )}
            {task.status === 'archived' && (
              <span className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full font-bold">
                📦 보관됨
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {task.status === 'active' ? (
              <>
                <button
                  onClick={() => onEdit(task)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200"
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={() => onArchive(task.id)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200"
                >
                  📦 보관
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200"
                >
                  🗑️ 삭제
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onRestore(task.id)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200"
                >
                  ♻️ 복구
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg hover:scale-105 duration-200"
                >
                  🗑️ 삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoItem;
