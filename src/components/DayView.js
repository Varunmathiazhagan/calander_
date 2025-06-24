import React from 'react';
import { motion } from 'framer-motion';
import { FaRegClock, FaMapMarkerAlt, FaVideo, FaSyncAlt, FaUsers } from 'react-icons/fa';

const DayView = ({ 
  date, 
  events = [], 
  isDarkMode, 
  onEventClick, 
  onTimeSlotClick, 
  weatherData = {} 
}) => {
  // Check date validity
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Invalid date provided</p>
      </div>
    );
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dateKey = date.toISOString().split('T')[0];
  const dayWeather = weatherData[dateKey];

  const getWeatherIcon = (condition) => {
    switch(condition) {
      case 'sunny': return '☀️';
      case 'hot': return '🌞';
      case 'cloudy': return '☁️';
      case 'rainy': return '🌧️';
      case 'partly-cloudy': return '⛅';
      default: return '🌤️';
    }
  };

  const getWeatherDescription = (condition, humidity) => {
    const descriptions = {
      'sunny': 'Clear and bright',
      'hot': 'Hot and sunny',
      'cloudy': 'Overcast',
      'rainy': 'Monsoon showers',
      'partly-cloudy': 'Partly cloudy'
    };
    
    const humidityDesc = {
      'low': 'Low humidity',
      'medium': 'Moderate humidity', 
      'high': 'High humidity',
      'very-high': 'Very humid'
    };
    
    return `${descriptions[condition] || condition} • ${humidityDesc[humidity] || ''}`;
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getEventPosition = (event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    const startHour = startDate.getHours();
    const startMinutes = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    
    const startPercentage = (startHour + startMinutes / 60) * (100 / 24);
    const duration = (endHour + endMinutes / 60) - (startHour + startMinutes / 60);
    const heightPercentage = duration * (100 / 24);
    
    return {
      top: `${startPercentage}%`,
      height: `${Math.max(heightPercentage, 4)}%`
    };
  };

  const formatEventTime = (startDate, endDate) => {
    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  // Fix conflict detection function to avoid duplicates
  const checkEventConflicts = (events) => {
    if (events.length <= 1) return events;
    
    // Ensure we have unique events first
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    const conflictMap = new Map();
    
    for (let i = 0; i < uniqueEvents.length; i++) {
      const event = uniqueEvents[i];
      let hasConflict = false;
      
      for (let j = 0; j < uniqueEvents.length; j++) {
        if (i === j) continue;
        
        const otherEvent = uniqueEvents[j];
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const otherStart = new Date(otherEvent.start);
        const otherEnd = new Date(otherEvent.end);
        
        if (eventStart < otherEnd && eventEnd > otherStart) {
          hasConflict = true;
          break;
        }
      }
      
      conflictMap.set(event.id, hasConflict);
    }
    
    return uniqueEvents.map(event => ({
      ...event,
      hasConflict: conflictMap.get(event.id) || false
    }));
  };

  // Process events with conflict detection and ensure uniqueness
  const processedEvents = checkEventConflicts(events.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  ));

  return (
    <div className="h-full flex flex-col">
      {/* Day Header */}
      <div className={`p-3 sm:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-3xl font-bold mb-2">
              {date.toLocaleDateString('en-US', { 
                weekday: window.innerWidth < 640 ? 'short' : 'long', 
                year: 'numeric', 
                month: window.innerWidth < 640 ? 'short' : 'long', 
                day: 'numeric' 
              })}
            </h2>
            <p className="text-sm sm:text-lg opacity-75">
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          
          {dayWeather && (
            <div className={`p-2 sm:p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} ml-4`}>
              <div className="text-center">
                <div className="text-xl sm:text-3xl mb-1 sm:mb-2">
                  {getWeatherIcon(dayWeather.condition)}
                </div>
                <div className="text-base sm:text-xl font-semibold">{dayWeather.temp}°C</div>
                <div className="text-xs sm:text-sm opacity-75 hidden sm:block">
                  {getWeatherDescription(dayWeather.condition, dayWeather.humidity)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {/* Hour grid */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`relative h-16 sm:h-20 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
              onClick={() => {
                const clickDate = new Date(date);
                clickDate.setHours(hour, 0, 0, 0);
                onTimeSlotClick && onTimeSlotClick(clickDate);
              }}
            >
              <div className={`absolute left-0 top-0 w-16 sm:w-20 h-full flex items-start justify-center pt-1 sm:pt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } text-xs sm:text-sm font-medium border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {formatHour(hour)}
              </div>
              
              {/* Current time indicator - Mobile optimized */}
              {date.toDateString() === new Date().toDateString() && 
               new Date().getHours() === hour && (
                <div 
                  className="absolute left-16 sm:left-20 bg-red-500 h-0.5 z-30 shadow-lg animate-pulse"
                  style={{ 
                    width: 'calc(100% - 4rem)',
                    top: `${(new Date().getMinutes() / 60) * 100}%`
                  }}
                >
                  <div className="absolute -left-1.5 sm:-left-2 -top-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="absolute -right-0 -top-5 sm:-top-6 bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md shadow-lg font-medium">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Events overlay - Mobile optimized */}
          <div className="absolute inset-0 left-16 sm:left-20 right-0">
            {processedEvents.map((event, index) => {
              const position = getEventPosition(event);
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              
              return (
                <motion.div
                  key={event.id || index}
                  className={`absolute left-2 sm:left-4 right-2 sm:right-4 rounded-lg shadow-md cursor-pointer z-20 overflow-hidden ${
                    event.isWorkingDayLeave || event.category === 'holiday'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-2 border-red-600 shadow-lg hover:bg-red-600 hover:shadow-xl'
                      : `border-l-4 ${event.hasConflict ? 'ring-2 ring-orange-400' : ''}`
                  }`}
                  style={event.isWorkingDayLeave || event.category === 'holiday' ? {} : {
                    ...position,
                    backgroundColor: isDarkMode ? `${event.color}20` : `${event.color}15`,
                    borderLeftColor: event.color,
                    minHeight: '48px'
                  }}
                  onClick={() => onEventClick && onEventClick(event)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Add a subtle pattern or design for leave events */}
                  {(event.isWorkingDayLeave || event.category === 'holiday') && (
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full" style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
                      }}></div>
                    </div>
                  )}
                  
                  <div className="p-2 sm:p-4 h-full">
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1 min-w-0">
                        {/* Enhanced event title with badge for holidays */}
                        <h4 className={`mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 ${
                          event.isWorkingDayLeave || event.category === 'holiday'
                            ? 'font-bold text-sm sm:text-lg text-white'
                            : 'font-bold text-sm sm:text-lg'
                        }`} style={event.isWorkingDayLeave || event.category === 'holiday' ? {} : { color: event.color }}>
                          {event.hasConflict && !event.isWorkingDayLeave && event.category !== 'holiday' && (
                            <span className="flex h-2 w-2 relative mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                          )}
                          
                          {/* Simple leave icon with animation */}
                          {(event.isWorkingDayLeave || event.category === 'holiday') && (
                            <span className="text-sm sm:text-lg inline-block animate-pulse">🏢</span>
                          )}
                          
                          <span className="break-words">{event.title}</span>
                          
                          {(event.isWorkingDayLeave || event.category === 'holiday') && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-25 text-white">
                              {event.leaveType || 'Holiday'}
                            </span>
                          )}
                        </h4>
                        
                        {/* Time and details for regular events - Mobile optimized */}
                        {!event.isWorkingDayLeave && event.category !== 'holiday' && (
                          <>
                            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 text-xs sm:text-sm opacity-80">
                              <span className="flex items-center gap-1">
                                <FaRegClock />
                                {formatEventTime(startDate, endDate)}
                              </span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 text-xs sm:text-sm opacity-80">
                                <FaMapMarkerAlt />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            
                            {event.description && (
                              <p className="text-xs sm:text-sm opacity-75 mb-1 sm:mb-2 line-clamp-2 sm:line-clamp-3">
                                {event.description}
                              </p>
                            )}
                          </>
                        )}

                        {/* Enhanced leave day content with icons and badges */}
                        {(event.isWorkingDayLeave || event.category === 'holiday') && (
                          <div className="mt-2 sm:mt-4">
                            <div className="text-white text-xs sm:text-base font-semibold mb-2 sm:mb-3 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2h2m3-4H9a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1m-1 4l-3 3m0 0l-3-3m3 3V3" />
                              </svg>
                              Office Closed - Paid Holiday
                            </div>
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                              <span className="bg-white bg-opacity-30 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium backdrop-blur-sm">
                                {event.leaveType?.toUpperCase() || 'NATIONAL HOLIDAY'}
                              </span>
                              <span className="bg-white bg-opacity-30 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium backdrop-blur-sm">
                                PAID LEAVE
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-white text-xs sm:text-sm opacity-90 border-l-2 border-white border-opacity-50 pl-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Icons for regular events - Mobile optimized */}
                      {!event.isWorkingDayLeave && event.category !== 'holiday' && (
                        <div className="flex flex-col items-end gap-1 sm:gap-2 ml-2 sm:ml-4">
                          <div className="flex flex-col gap-1">
                            {event.isRecurring && (
                              <FaSyncAlt className="text-xs sm:text-sm opacity-75" style={{ color: event.color }} />
                            )}
                            {event.hasVideoCall && (
                              <FaVideo className="text-xs sm:text-sm opacity-75" style={{ color: event.color }} />
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FaUsers className="text-xs sm:text-sm opacity-75" style={{ color: event.color }} />
                                <span className="text-xs opacity-75" style={{ color: event.color }}>
                                  {event.attendees.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current time floating indicator */}
      {date.toDateString() === new Date().toDateString() && (
        <motion.div
          className="fixed right-2 sm:right-8 top-1/2 transform -translate-y-1/2 z-50"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={`p-2 sm:p-4 rounded-xl shadow-xl border-2 border-red-400 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="text-center">
              <div className="text-xs font-medium opacity-75 mb-1">Current Time</div>
              <div className="text-lg sm:text-2xl font-bold text-red-500 mb-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs opacity-75">
                {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="mt-2 w-6 sm:w-8 h-1 bg-red-500 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DayView;
