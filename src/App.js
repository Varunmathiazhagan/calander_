import React, { useState, useEffect, useRef } from 'react';
import Calendar from './components/calander';
import { FaCog, FaSearch, FaQuestion, FaBars, FaRegCalendarAlt, FaUser, FaBell, FaSignOutAlt, FaUserCog, 
         FaChevronLeft, FaChevronRight, FaCalendarDay, FaCalendarCheck, FaPlus, FaChevronDown,
         FaClock, FaUsers, FaTasks, FaTimes, FaBirthdayCake } from 'react-icons/fa';
import eventData from './data/events.json';
import currentEventsData from './data/currentEvents.json';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Team Meeting", time: "10 minutes", read: false },
    { id: 2, title: "Project Deadline", time: "Tomorrow", read: false },
    { id: 3, title: "New comment on your event", time: "1 hour ago", read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAllEvents] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  
  // Fix: Create a proper ref instead of using state for ref
  const calendarRef = useRef(null);
  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const createDropdownRef = useRef(null);

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') === 'dark';
    setIsDarkMode(savedTheme);
    
    // Simplified page loading effect
    setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target)) {
        setShowCreateDropdown(false);
      }
    };

    // Auto close sidebar on mobile view
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Load events data and update dates to current year for demo
    const currentYear = new Date().getFullYear();
    const formattedEvents = [...eventData, ...currentEventsData].map(event => {
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      // Update year to current year for demo purposes
      startDate.setFullYear(currentYear);
      endDate.setFullYear(currentYear);
      
      return {
        ...event,
        start: startDate,
        end: endDate
      };
    });
    
    // Sort by start date
    formattedEvents.sort((a, b) => a.start - b.start);
    setEvents(formattedEvents);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mini calendar navigation
  const prevMonth = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 1));
  };

  // Get upcoming events (next 5 events from today)
  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = events
      .filter(event => new Date(event.start) >= today)
      .slice(0, showAllEvents ? 15 : 5); // Using showAllEvents here
    
    return upcomingEvents;
  };
  
  // Check if a day has events
  const dayHasEvents = (day) => {
    return events.some(event => 
      new Date(event.start).toDateString() === day.toDateString()
    );
  };
  
  // Jump to date in main calendar
  const jumpToDate = (date) => {
    if (calendarRef.current && calendarRef.current.jumpToDate) {
      calendarRef.current.jumpToDate(date);
    }
  };

  // Simple function to show events on calendar
  const showEventsOnCalendar = () => {
    // Jump to today and switch to month view to show all events
    const today = new Date();
    jumpToDate(today);
    
    // If there are events today, could switch to day view for better visibility
    const todayEvents = events.filter(event => 
      new Date(event.start).toDateString() === today.toDateString()
    );
    
    // Optionally switch to day view if there are events today
    if (todayEvents.length > 0 && calendarRef.current) {
      // Let the calendar component handle the view switching
    }
  };

  // Create new event function
  const createNewEvent = (type = 'event') => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const eventTemplates = {
      event: {
        title: 'New Event',
        category: 'work',
        color: '#6366F1',
        hasVideoCall: false,
        start: now,
        end: endTime
      },
      meeting: {
        title: 'Team Meeting',
        category: 'work',
        color: '#8B5CF6',
        hasVideoCall: true,
        attendees: [],
        start: now,
        end: endTime,
        description: 'Discuss project progress and next steps'
      },
      task: {
        title: 'New Task',
        category: 'work',
        color: '#F59E0B',
        hasVideoCall: false,
        start: now,
        end: endTime,
        description: 'Task to be completed'
      },
      appointment: {
        title: 'Appointment',
        category: 'personal',
        color: '#10B981',
        hasVideoCall: false,
        start: now,
        end: endTime,
        description: 'Personal appointment'
      },
      reminder: {
        title: 'Reminder',
        category: 'personal',
        color: '#EC4899',
        hasVideoCall: false,
        reminders: [{ time: 15, unit: 'minutes' }],
        start: now,
        end: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes
        description: 'Important reminder'
      },
      birthday: {
        title: 'Birthday Celebration',
        category: 'social',
        color: '#F59E0B',
        hasVideoCall: false,
        isRecurring: true,
        recurrencePattern: 'yearly',
        start: now,
        end: endTime,
        description: 'Annual birthday celebration'
      }
    };

    const template = eventTemplates[type] || eventTemplates.event;
    
    // Call the calendar's createNewEvent method
    if (calendarRef.current && calendarRef.current.createNewEvent) {
      calendarRef.current.createNewEvent(template);
    }
    
    setShowCreateDropdown(false);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
    } ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
      
      {/* Enhanced header - Mobile optimized */}
      <header className={`py-2 px-2 sm:px-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex items-center justify-between sticky top-0 z-10 shadow-sm`}>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleSidebar}
          >
            <FaBars className="text-lg sm:text-xl" />
          </button>
          <div className="flex items-center">
            <FaRegCalendarAlt className={`${isDarkMode ? 'text-blue-400' : 'text-blue-500'} mr-1 sm:mr-2 text-lg sm:text-xl`} />
            <h1 className="text-lg sm:text-xl font-normal bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Chronos</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Search - Hidden on small screens */}
          <div className={`relative rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} px-3 py-2 hidden lg:flex items-center transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400`}>
            <FaSearch className="text-gray-500 mr-2 text-sm" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className={`bg-transparent border-none outline-none w-48 xl:w-64 text-sm ${isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500'}`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
          
          {/* Mobile search button */}
          <button 
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors lg:hidden`}
            title="Search"
          >
            <FaSearch className="text-base" />
          </button>
          
          <button 
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Notifications button */}
          <div className="relative" ref={notificationRef}>
            <button 
              className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors relative`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell className="text-base sm:text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-72 sm:w-80 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border overflow-hidden z-20 max-h-96`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium">Notifications</div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer ${!notification.read ? isDarkMode ? 'bg-gray-700' : 'bg-blue-50' : ''} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notification.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 text-center">
                  <button className="text-blue-500 hover:text-blue-600 text-sm">Mark all as read</button>
                </div>
              </div>
            )}
          </div>
          
          {/* Settings and Help - Hidden on small screens */}
          <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors hidden sm:block`}>
            <FaQuestion className="text-base sm:text-lg" />
          </button>
          
          <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors hidden sm:block`}>
            <FaCog className="text-base sm:text-lg" />
          </button>
          
          {/* User profile dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-md transition-shadow"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <span className="text-xs sm:text-sm font-medium">U</span>
            </button>
            
            {showUserDropdown && (
              <div className={`absolute right-0 mt-2 w-56 sm:w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border overflow-hidden z-20`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium">User Name</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">user@example.com</div>
                </div>
                <div>
                  <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <FaUser className="mr-3 text-gray-500" />
                    <span>Your Profile</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <FaUserCog className="mr-3 text-gray-500" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center">
                    <FaSignOutAlt className="mr-3 text-gray-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced sidebar - Mobile optimized */}
        {sidebarOpen && (
          <div className={`${sidebarOpen ? 'fixed md:relative z-30 md:z-auto' : 'hidden'} w-4/5 sm:w-72 md:w-64 border-r p-3 sm:p-4 ${isDarkMode ? 'border-gray-700 bg-gradient-to-b from-gray-800 to-gray-900' : 'border-gray-200 bg-gradient-to-b from-white to-gray-50'} overflow-y-auto h-full`}>
            {/* Close button for mobile view */}
            <button 
              className="md:hidden absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 z-40"
              onClick={toggleSidebar}
            >
              <FaTimes className="text-xl" />
            </button>
            
            {/* Enhanced Create Button - Mobile optimized */}
            <div className="mb-4 sm:mb-6" ref={createDropdownRef}>
              <div className="relative">
                <button 
                  className={`flex items-center justify-between w-full py-3 sm:py-4 px-3 sm:px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-400 hover:via-purple-400 hover:to-indigo-400 text-white'
                  } hover:shadow-xl group`}
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-white bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-all">
                      <FaPlus className="text-base sm:text-lg" />
                    </div>
                    <span className="text-base sm:text-lg font-semibold">Create</span>
                  </div>
                  <FaChevronDown className={`transition-transform duration-200 text-sm ${showCreateDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Create Dropdown Menu - Mobile optimized */}
                {showCreateDropdown && (
                  <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border overflow-hidden z-50 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
                        Quick Create
                      </div>
                      
                      {/* Event options - Mobile optimized */}
                      {[
                        { type: 'event', icon: FaRegCalendarAlt, color: 'blue', title: 'Event', desc: 'General calendar event' },
                        { type: 'meeting', icon: FaUsers, color: 'purple', title: 'Meeting', desc: 'Team meeting with video call' },
                        { type: 'task', icon: FaTasks, color: 'orange', title: 'Task', desc: 'Personal or work task' },
                        { type: 'appointment', icon: FaClock, color: 'green', title: 'Appointment', desc: 'Doctor, dentist, etc.' }
                      ].map(({ type, icon: Icon, color, title, desc }) => (
                        <button
                          key={type}
                          onClick={() => createNewEvent(type)}
                          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-1.5 sm:p-2 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex-shrink-0`}>
                            <Icon className={`text-${color}-600 dark:text-${color}-400 text-sm`} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-sm">{title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">{desc}</div>
                          </div>
                        </button>
                      ))}

                      <div className={`border-t my-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

                      {/* Special Events - Mobile optimized */}
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wider">
                        Special Events
                      </div>

                      {[
                        { type: 'birthday', icon: FaBirthdayCake, color: 'pink', title: 'Birthday', desc: 'Recurring yearly event' },
                        { type: 'reminder', icon: FaBell, color: 'yellow', title: 'Reminder', desc: 'Quick reminder alert' }
                      ].map(({ type, icon: Icon, color, title, desc }) => (
                        <button
                          key={type}
                          onClick={() => createNewEvent(type)}
                          className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-1.5 sm:p-2 bg-${color}-100 dark:bg-${color}-900 rounded-lg flex-shrink-0`}>
                            <Icon className={`text-${color}-600 dark:text-${color}-400 text-sm`} />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-sm">{title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block truncate">{desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mini Calendar - Mobile optimized */}
            <div className="mb-4 sm:mb-6">
              <div className={`p-3 sm:p-4 rounded-lg mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <button 
                    className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                    onClick={prevMonth}
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <span className="font-medium text-sm sm:text-base">
                    {miniCalendarDate.toLocaleString('default', { month: 'long' })} {miniCalendarDate.getFullYear()}
                  </span>
                  <button 
                    className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                    onClick={nextMonth}
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days - optimized for mobile touch */}
                  {(() => {
                    const days = [];
                    const monthStart = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 1);
                    const monthEnd = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 0);
                    const startDayOfWeek = monthStart.getDay();
                    const totalDays = monthEnd.getDate();
                    
                    // Generate calendar days with better touch targets
                    for (let i = 0; i < startDayOfWeek; i++) {
                      const day = new Date(monthStart);
                      day.setDate(day.getDate() - (startDayOfWeek - i));
                      days.push(
                        <div 
                          key={`prev-${i}`}
                          className="aspect-square flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                          onClick={() => jumpToDate(day)}
                        >
                          {day.getDate()}
                        </div>
                      );
                    }
                    
                    const today = new Date();
                    for (let i = 1; i <= totalDays; i++) {
                      const day = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), i);
                      const isToday = day.toDateString() === today.toDateString();
                      const hasEvents = dayHasEvents(day);
                      
                      days.push(
                        <div 
                          key={`curr-${i}`}
                          className={`aspect-square flex items-center justify-center rounded-full transition-colors cursor-pointer relative
                            ${isToday ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                          onClick={() => jumpToDate(day)}
                        >
                          {i}
                          {hasEvents && !isToday && (
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      );
                    }
                    
                    return days;
                  })()}
                </div>
              </div>
            </div>
            
            {/* Quick Access - Mobile optimized */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}`}></span>
                  Quick Access
                </h3>
                
                <button
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-xl transition-all hover:shadow-lg transform hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white' : 'bg-gradient-to-r from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 text-blue-700 border border-blue-200'
                  }`}
                  onClick={showEventsOnCalendar}
                  title="Show events on calendar"
                >
                  <FaCalendarCheck className="text-xs sm:text-sm" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Events</span>
                  {getUpcomingEvents().length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
                      isDarkMode ? 'bg-white bg-opacity-20 text-white' : 'bg-blue-600 text-white'
                    } font-bold animate-pulse`}>
                      {getUpcomingEvents().length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Quick stats - Mobile optimized */}
              {events.length > 0 && (
                <div className={`p-3 sm:p-4 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-gray-50 to-gray-100'} mb-3 sm:mb-4 shadow-sm border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-blue-500">{events.length}</div>
                        <div className="text-xs">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-xl font-bold text-green-500">{events.filter(event => {
                          const eventDate = new Date(event.start);
                          const today = new Date();
                          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                          return eventDate >= today && eventDate <= weekFromNow;
                        }).length}</div>
                        <div className="text-xs">This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Actions - Mobile optimized */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button 
                  className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl text-xs sm:text-sm transition-all hover:shadow-md transform hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700'
                  }`}
                  onClick={() => {
                    jumpToDate(new Date());
                    if (calendarRef.current && calendarRef.current.setViewMode) {
                      calendarRef.current.setViewMode('year');
                    }
                  }}
                >
                  <FaCalendarCheck className="text-xs" />
                  <span className="font-medium">Year</span>
                </button>
                <button 
                  className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-xl text-xs sm:text-sm transition-all hover:shadow-md transform hover:scale-105 ${
                    isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700'
                  }`}
                  onClick={() => jumpToDate(new Date())}
                >
                  <FaCalendarDay className="text-xs" />
                  <span className="font-medium">Today</span>
                </button>
              </div>
            </div>
            
            {/* My calendars - Mobile optimized */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">My calendars</h3>
              <div className="space-y-2">
                {[
                  { name: 'Calendar', color: 'blue' },
                  { name: 'Birthdays', color: 'green' },
                  { name: 'Tasks', color: 'amber' },
                  { name: 'Meetings', color: 'purple' }
                ].map(({ name, color }) => (
                  <div key={name} className="flex items-center group">
                    <input type="checkbox" className={`rounded text-${color}-500 mr-2 w-5 h-5`} checked readOnly />
                    <span className="text-sm flex-1">{name}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1">
                        <FaCog className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Other calendars - Mobile optimized */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 flex justify-between items-center">
                <span>Other calendars</span>
                <button className="text-blue-500 text-xs hover:text-blue-600">+ Add</button>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" className="rounded text-red-500 mr-2 w-5 h-5" checked readOnly />
                  <span className="text-sm">Holidays</span>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="rounded text-teal-500 mr-2 w-5 h-5" checked readOnly />
                  <span className="text-sm">Team Events</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main calendar content */}
        <main className="flex-1 overflow-auto">
          <Calendar 
            isDarkMode={isDarkMode} 
            ref={calendarRef}
          />
        </main>
      </div>
      
      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}

export default App;
