'use client'

import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, BookOpen, Briefcase, Clock } from 'lucide-react';
import { WorkDay } from '@/types';

interface WorkDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workDay: WorkDay) => void;
  selectedDate: string;
  existingWorkDay?: WorkDay;
}

export const WorkDayModal: React.FC<WorkDayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingWorkDay
}) => {
  const [activities, setActivities] = useState('');
  const [learnings, setLearnings] = useState('');
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [mealLocation, setMealLocation] = useState<'school' | 'workplace' | 'other'>('school');
  const [mealLocationOther, setMealLocationOther] = useState('');

  useEffect(() => {
    if (existingWorkDay) {
      setActivities(existingWorkDay.activities);
      setLearnings(existingWorkDay.learnings);
      setHoursWorked(existingWorkDay.hoursWorked);
      setMealLocation(existingWorkDay.mealLocation);
      setMealLocationOther(existingWorkDay.mealLocationOther || '');
    } else {
      setActivities('');
      setLearnings('');
      setHoursWorked(8);
      setMealLocation('school');
      setMealLocationOther('');
    }
  }, [existingWorkDay, isOpen]);

  const handleSave = () => {
    if (!activities.trim() || !learnings.trim() || hoursWorked <= 0) {
      return;
    }

    const workDay: WorkDay = {
      id: existingWorkDay?.id || crypto.randomUUID(),
      date: selectedDate,
      activities: activities.trim(),
      learnings: learnings.trim(),
      hoursWorked,
      mealLocation,
      mealLocationOther: mealLocation === 'other' ? mealLocationOther.trim() : undefined,
      createdAt: existingWorkDay?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(workDay);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fi-FI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {existingWorkDay ? 'Muokkaa työpäivää' : 'Lisää työpäivä'}
            </h2>
            <p className="text-muted text-sm">
              {formatDate(selectedDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Activities Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Mitä teit tänään?</label>
            </div>
            <textarea
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Kuvaile päivän pääasialliset aktiviteetit ja tehtävät..."
              className="input-field resize-none h-24"
              required
            />
          </div>

          {/* Learnings Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Mitä opit?</label>
            </div>
            <textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Mitä uusia taitoja, tietoja tai oivalluksia sait?"
              className="input-field resize-none h-24"
              required
            />
          </div>

          {/* Hours Worked Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Työtunnit</label>
            </div>
            <input
              type="number"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(Math.max(0, parseFloat(e.target.value) || 0))}
              min="0"
              max="24"
              step="0.5"
              className="input-field"
              required
            />
          </div>

          {/* Meal Location Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Missä söit?</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'school', label: 'Koulu', icon: '🏫' },
                { value: 'workplace', label: 'Työpaikka', icon: '🏢' },
                { value: 'other', label: 'Muu', icon: '🍽️' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMealLocation(option.value as 'school' | 'workplace' | 'other')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    mealLocation === option.value
                      ? 'border-primary-500 bg-primary-500/20 text-primary'
                      : 'border-white/20 glass-card text-secondary glass-card-hover'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
            
            {mealLocation === 'other' && (
              <input
                type="text"
                value={mealLocationOther}
                onChange={(e) => setMealLocationOther(e.target.value)}
                placeholder="Määritä missä..."
                className="input-field"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Peruuta
          </button>
          <button
            onClick={handleSave}
            disabled={!activities.trim() || !learnings.trim() || hoursWorked <= 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Tallenna</span>
          </button>
        </div>
      </div>
    </div>
  );
};