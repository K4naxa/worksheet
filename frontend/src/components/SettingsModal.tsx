'use client'

import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Settings } from 'lucide-react';
import { WorkPracticeSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: WorkPracticeSettings) => void;
  currentSettings: WorkPracticeSettings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workDays, setWorkDays] = useState<number[]>([]);

  const weekDays = [
    { value: 1, label: 'Maanantai' },
    { value: 2, label: 'Tiistai' },
    { value: 3, label: 'Keskiviikko' },
    { value: 4, label: 'Torstai' },
    { value: 5, label: 'Perjantai' },
    { value: 6, label: 'Lauantai' },
    { value: 0, label: 'Sunnuntai' }
  ];

  useEffect(() => {
    if (isOpen) {
      setStartDate(currentSettings.startDate || '');
      setEndDate(currentSettings.endDate || '');
      setWorkDays(currentSettings.workDays || [1, 2, 3, 4, 5]);
    }
  }, [isOpen, currentSettings]);

  const handleWorkDayToggle = (dayValue: number) => {
    setWorkDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue].sort()
    );
  };

  const handleSave = () => {
    const settings: WorkPracticeSettings = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      workDays
    };
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Harjoittelun asetukset</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Harjoittelun ajankohta</label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-secondary mb-1">Alkupäivä</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">Loppupäivä</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Work Days */}
          <div className="space-y-3">
            <label className="text-primary font-medium">Työpäivät viikossa</label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleWorkDayToggle(day.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm ${
                    workDays.includes(day.value)
                      ? 'border-primary-500 bg-primary-500/20 text-primary'
                      : 'border-white/20 glass-card text-secondary glass-card-hover'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
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
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Tallenna</span>
          </button>
        </div>
      </div>
    </div>
  );
};