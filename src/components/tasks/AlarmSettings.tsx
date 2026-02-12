interface AlarmSettingsProps {
  dueTime: string | null;
  alarmEnabled: boolean;
  alarmMinutesBefore: number;
  onDueTimeChange: (time: string | null) => void;
  onAlarmEnabledChange: (enabled: boolean) => void;
  onAlarmMinutesBeforeChange: (minutes: number) => void;
}

const AlarmSettings = ({
  dueTime,
  alarmEnabled,
  alarmMinutesBefore,
  onDueTimeChange,
  onAlarmEnabledChange,
  onAlarmMinutesBeforeChange,
}: AlarmSettingsProps) => {

  const handleTimeChange = (e) => {
    const timeValue = e.target.value;
    onDueTimeChange(timeValue || null);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
      <div className="flex items-center mb-4">
        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-lg font-medium text-gray-900">Alarm Settings</h4>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Due Time */}
        <div>
          <label htmlFor="due_time" className="block text-sm font-medium text-gray-700 mb-2">
            Due Time
          </label>
          <input
            type="time"
            id="due_time"
            value={dueTime || ''}
            onChange={handleTimeChange}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
            step="900"
          />
          <p className="mt-1 text-xs text-gray-500">
            Set time of day when this task should be completed (24-hour format)
          </p>
        </div>

        {/* Alarm Enabled */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enable Alarm
          </label>
          <div className="flex items-center h-10">
            <input
              type="checkbox"
              id="alarm_enabled"
              checked={alarmEnabled}
              onChange={(e) => onAlarmEnabledChange(e.target.checked)}
              disabled={!dueTime}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="alarm_enabled" className="ml-2 text-sm text-gray-700">
              Send reminder email
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {dueTime ? 'Send email reminder before due time' : 'Set a due time first'}
          </p>
        </div>
      </div>

      {/* Alarm Minutes Before */}
      {alarmEnabled && dueTime && (
        <div className="mt-4">
          <label htmlFor="alarm_minutes_before" className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Time
          </label>
          <select
            id="alarm_minutes_before"
            value={alarmMinutesBefore}
            onChange={(e) => onAlarmMinutesBeforeChange(parseInt(e.target.value))}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
          >
            <option value={5}>5 minutes before</option>
            <option value={10}>10 minutes before</option>
            <option value={15}>15 minutes before</option>
            <option value={30}>30 minutes before</option>
            <option value={45}>45 minutes before</option>
            <option value={60}>1 hour before</option>
            <option value={120}>2 hours before</option>
            <option value={180}>3 hours before</option>
            <option value={1440}>1 day before</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            When to send reminder email
          </p>
        </div>
      )}

      {!dueTime && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 002 2v12a2 2 0 002-2H3a2 2 0 01-2-2V4a2 2 0 012-2h3a1 1 0 00-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Set a due time to enable alarm notifications. You'll receive email reminders based on your task's recurrence and due time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmSettings;
