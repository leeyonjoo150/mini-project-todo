import TodoItem from './TodoItem';

function TodoList({
  tasks,
  completedTaskIds,
  onToggleComplete,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  emptyMessage = '할 일이 없습니다.',
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-xl font-bold text-gray-700 mb-2">{emptyMessage}</p>
        <p className="text-gray-500">새로운 할 일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          isCompleted={completedTaskIds.includes(task.id)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}

export default TodoList;
