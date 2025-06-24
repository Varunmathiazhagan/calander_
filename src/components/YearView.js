import React from 'react';
import { motion } from 'framer-motion';

const YearView = ({ 
  date, 
  events = [], 
  isDarkMode, 
  onDateClick, 
  onMonthClick,
  weatherData = {} 
}) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Invalid date provided</p>
      </div>
    );
  }

  const year = date.getFullYear();
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  const getMonthEvents = (month) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const getEventsByDay = (year, month) => {
    const eventsByDay = {};
    const monthEvents = getMonthEvents(month);
    
    monthEvents.forEach(event => {
      const day = new Date(event.start).getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    });
    
    return eventsByDay;
  };

  const renderMiniMonth = (monthDate, monthIndex) => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const startDayOfWeek = monthStart.getDay();
    const totalDays = monthEnd.getDate();
    const eventsByDay = getEventsByDay(year, monthIndex);
    
    const days = [];
    
    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(monthStart);
      day.setDate(day.getDate() - i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const day = new Date(year, monthIndex, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, monthIndex + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <motion.div
        key={monthIndex}
        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
        onClick={() => onMonthClick && onMonthClick(monthDate)}
        whileHover={{ scale: 1.02 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: monthIndex * 0.05 }}
      >
        {/* Month header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">
            {monthDate.toLocaleDateString('en-US', { month: 'long' })}
          </h3>
          <div className="text-sm opacity-75">
            {getMonthEvents(monthIndex).length} events
          </div>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-medium opacity-75 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((dayInfo, dayIndex) => {
                const { date: dayDate, isCurrentMonth } = dayInfo;
                const dayNumber = dayDate.getDate();
                const isToday = dayDate.toDateString() === today.toDateString();
                const dayEvents = eventsByDay[dayNumber] || [];
                const hasEvents = dayEvents.length > 0 && isCurrentMonth;
                const hasHoliday = dayEvents.some(event => 
                  event.category === 'holiday' || event.isWorkingDayLeave
                );

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`relative h-8 flex items-center justify-center text-xs rounded transition-colors cursor-pointer ${
                      isCurrentMonth
                        ? isToday
                          ? 'bg-blue-500 text-white font-bold'
                          : hasHoliday
                          ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-semibold'
                          : hasEvents
                          ? isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                          : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateClick && onDateClick(dayDate);
                    }}
                  >
                    {dayNumber}
                    {hasEvents && isCurrentMonth && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                        <div className={`w-1 h-1 rounded-full ${
                          isToday ? 'bg-white' : hasHoliday ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Month summary */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="opacity-75">Work:</span>
              <span className="font-semibold">
                {getMonthEvents(monthIndex).filter(e => e.category === 'work').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="opacity-75">Holidays:</span>
              <span className="font-semibold text-red-600">
                {getMonthEvents(monthIndex).filter(e => e.category === 'holiday' || e.isWorkingDayLeave).length}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Year header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{year}</h2>
            <p className="text-lg opacity-75">
              {events.length} total events • {events.filter(e => e.category === 'holiday' || e.isWorkingDayLeave).length} holidays
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-75 mb-1">Quick stats for {year}</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {events.filter(e => e.category === 'work').length}
                </div>
                <div className="text-xs opacity-75">Work Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.category === 'social').length}
                </div>
                <div className="text-xs opacity-75">Social Events</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Months grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {months.map((monthDate, index) => renderMiniMonth(monthDate, index))}
        </div>
      </div>
    </div>
  );
};

export default YearView;

      