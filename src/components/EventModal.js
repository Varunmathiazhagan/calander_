import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, 
  FaVideo, FaSyncAlt, FaBell, FaPalette, FaSave, FaTrash,
  FaPlus, FaMinus, FaGlobe, FaFileAlt, FaTags, FaExclamationTriangle
} from 'react-icons/fa';

const EventModal = ({ 
  isOpen, 
  onClose, 
  event, 
  onSave, 
  onDelete, 
  isDarkMode,
  allEvents = []
}) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    color: '#6366F1',
    location: '',
    isRecurring: false,
    recurrencePattern: 'daily',
    attendees: [],
    reminders: [{ time: 30, unit: 'minutes' }],
    hasVideoCall: false,
    category: 'work',
    priority: 'medium',
    tags: [],
    url: '',
    notes: ''
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);

  const colorOptions = [
    '#6366F1', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6',
    '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16'
  ];

  const categoryOptions = [
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'social', label: 'Social', icon: '🎉' },
    { value: 'training', label: 'Training', icon: '📚' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'holiday', label: 'Holiday', icon: '🏛️' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ];

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        attendees: event.attendees || [],
        reminders: event.reminders || [{ time: 30, unit: 'minutes' }],
        category: event.category || 'work',
        priority: event.priority || 'medium',
        tags: event.tags || [],
        url: event.url || '',
        notes: event.notes || ''
      });
    } else {
      const now = new Date();
      const endTime = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        start: now,
        end: endTime
      }));
    }
  }, [event]);

  useEffect(() => {
    checkConflicts();
  }, [formData.start, formData.end, allEvents]);

  const checkConflicts = () => {
    const eventConflicts = allEvents.filter(existingEvent => {
      if (existingEvent.id === formData.id) return false;
      
      const existingStart = new Date(existingEvent.start);
      const existingEnd = new Date(existingEvent.end);
      
      return (
        (formData.start < existingEnd && formData.end > existingStart)
      );
    });
    
    setConflicts(eventConflicts);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.start >= formData.end) {
      newErrors.time = 'End time must be after start time';
    }
    
    if (formData.attendees.some(email => !email.includes('@'))) {
      newErrors.attendees = 'Please enter valid email addresses';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addAttendee = () => {
    if (newAttendee.trim() && newAttendee.includes('@')) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addReminder = () => {
    setFormData(prev => ({
      ...prev,
      reminders: [...prev.reminders, { time: 15, unit: 'minutes' }]
    }));
  };

  const updateReminder = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.map((reminder, i) => 
        i === index ? { ...reminder, [field]: value } : reminder
      )
    }));
  };

  const removeReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <FaTimes />
            </button>
          </div>

          {/* Conflicts Warning */}
          {conflicts.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <FaExclamationTriangle />
                <span className="font-medium">Schedule Conflict Detected</span>
              </div>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                This event overlaps with {conflicts.length} other event(s):
                {conflicts.map(conflict => (
                  <div key={conflict.id} className="ml-4">
                    • {conflict.title} ({new Date(conflict.start).toLocaleTimeString()} - {new Date(conflict.end).toLocaleTimeString()})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  <FaFileAlt className="inline mr-2" />
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter event title..."
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaTags className="inline mr-2" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaClock className="inline mr-2" />
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('start', new Date(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaClock className="inline mr-2" />
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end.toISOString().slice(0, 16)}
                  onChange={(e) => handleInputChange('end', new Date(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  } ${errors.time ? 'border-red-500' : ''}`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Event description..."
              />
            </div>

            {/* Location and URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Event location..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaGlobe className="inline mr-2" />
                  URL/Link
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Color and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FaPalette className="inline mr-2" />
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                      } transition-transform`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <div className="flex gap-2">
                  {priorityOptions.map(priority => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => handleInputChange('priority', priority.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.priority === priority.value
                          ? 'bg-opacity-100 text-white'
                          : 'bg-opacity-20 hover:bg-opacity-30'
                      }`}
                      style={{ 
                        backgroundColor: formData.priority === priority.value ? priority.color : `${priority.color}20`,
                        color: formData.priority === priority.value ? 'white' : priority.color
                      }}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    className="rounded"
                  />
                  <FaSyncAlt className="text-sm" />
                  <span>Recurring Event</span>
                </label>

                {formData.isRecurring && (
                  <select
                    value={formData.recurrencePattern}
                    onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.hasVideoCall}
                    onChange={(e) => handleInputChange('hasVideoCall', e.target.checked)}
                    className="rounded"
                  />
                  <FaVideo className="text-sm" />
                  <span>Video Call</span>
                </label>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FaUsers className="inline mr-2" />
                Attendees
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAttendee())}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Enter email address..."
                />
                <button
                  type="button"
                  onClick={addAttendee}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaPlus />
                </button>
              </div>
              {formData.attendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.attendees.map((attendee, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      {attendee}
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <FaTags className="inline mr-2" />
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  placeholder="Add tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaPlus />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reminders */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  <FaBell className="inline mr-2" />
                  Reminders
                </label>
                <button
                  type="button"
                  onClick={addReminder}
                  className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  <FaPlus className="mr-1" /> Add
                </button>
              </div>
              {formData.reminders.map((reminder, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={reminder.time}
                    onChange={(e) => updateReminder(index, 'time', parseInt(e.target.value))}
                    className={`w-20 px-2 py-1 border rounded ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                    min="1"
                  />
                  <select
                    value={reminder.unit}
                    onChange={(e) => updateReminder(index, 'unit', e.target.value)}
                    className={`px-2 py-1 border rounded ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                  <span className="text-sm">before</span>
                  <button
                    type="button"
                    onClick={() => removeReminder(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FaMinus />
                  </button>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
                placeholder="Additional notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                {event && (
                  <button
                    type="button"
                    onClick={() => onDelete(event.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FaSave /> Save Event
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
