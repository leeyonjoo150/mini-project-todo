import { useState } from 'react';

const TASK_TYPES = {
  once: '한 번만',
  daily: '매일',
  weekly: '요일별',
  period: '기간',
};

const PRIORITIES = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_NAMES = {
  Mon: '월',
  Tue: '화',
  Wed: '수',
  Thu: '목',
  Fri: '금',
  Sat: '토',
  Sun: '일',
};

function TodoForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      task_type: 'once',
      priority: 'medium',
      due_date: '',
      start_date: '',
      end_date: '',
      repeat_days: [],
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleWeekdayToggle = (day) => {
    const currentDays = formData.repeat_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    setFormData({
      ...formData,
      repeat_days: newDays,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // task_type에 따른 데이터 정리
    const submitData = { ...formData };

    if (formData.task_type === 'weekly') {
      submitData.repeat_days = formData.repeat_days.join(',');
    } else {
      delete submitData.repeat_days;
    }

    if (formData.task_type !== 'once') {
      delete submitData.due_date;
    }

    if (formData.task_type !== 'period') {
      delete submitData.start_date;
      delete submitData.end_date;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
        {initialData ? '✏️ 할 일 수정' : '✨ 새 할 일'}
      </h3>

      <div className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            📝 제목 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            placeholder="무엇을 할까요?"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            📄 설명
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            placeholder="자세한 내용을 입력하세요"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task_type" className="block text-sm font-semibold text-gray-700 mb-2">
              🔄 반복 유형 *
            </label>
            <select
              id="task_type"
              name="task_type"
              value={formData.task_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
            >
              {Object.entries(TASK_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
              ⭐ 우선순위
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
            >
              {Object.entries(PRIORITIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formData.task_type === 'once' && (
          <div className="bg-blue-50 p-4 rounded-xl">
            <label htmlFor="due_date" className="block text-sm font-semibold text-gray-700 mb-2">
              📅 마감일 *
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            />
          </div>
        )}

        {formData.task_type === 'period' && (
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  🚀 시작일 *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  🏁 종료일 *
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {formData.task_type === 'weekly' && (
          <div className="bg-indigo-50 p-4 rounded-xl">
            <label className="block text-sm font-semibold text-gray-700 mb-3">📆 반복 요일 *</label>
            <div className="flex gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWeekdayToggle(day)}
                  className={`flex-1 py-3 px-3 rounded-xl font-bold transition-all ${
                    formData.repeat_days?.includes(day)
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {WEEKDAY_NAMES[day]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-200"
        >
          {initialData ? '✅ 수정하기' : '➕ 추가하기'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3.5 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            ❌ 취소
          </button>
        )}
      </div>
    </form>
  );
}

export default TodoForm;
