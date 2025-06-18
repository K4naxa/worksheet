'use client'

import React from 'react';
import { Edit, Trash2, MapPin, BookOpen, Briefcase, Clock, Calendar } from 'lucide-react';
import { WorkDay } from '@/types';

interface WorkDaysListProps {
  workDays: WorkDay[];
  onEdit: (workDay: WorkDay) => void;
  onDelete: (date: string) => void;
}

export const WorkDaysList: React.FC<WorkDaysListProps> = ({ workDays, onEdit, onDelete }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fi-FI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMealLocationDisplay = (workDay: WorkDay) => {
    switch (workDay.mealLocation) {
      case 'school':
        return { icon: '🏫', text: 'Koulu' };
      case 'workplace':
        return { icon: '🏢', text: 'Työpaikka' };
      case 'other':
        return { icon: '🍽️', text: workDay.mealLocationOther || 'Muu' };
      default:
        return { icon: '❓', text: 'Tuntematon' };
    }
  };

  const sortedWorkDays = [...workDays].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (workDays.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary mb-2">Ei työpäiviä vielä</h3>
        <p className="text-secondary">Aloita lisäämällä ensimmäinen työpäiväsi kalenterista.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary mb-6">Työpäivät</h2>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {sortedWorkDays.map((workDay) => {
          const mealDisplay = getMealLocationDisplay(workDay);
          
          return (
            <div key={workDay.id} className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted" />
                  <h3 className="font-semibold text-primary">
                    {formatDate(workDay.date)}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(workDay)}
                    className="p-1.5 rounded-lg glass-card glass-card-hover text-primary transition-colors"
                    title="Muokkaa työpäivää"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(workDay.date)}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    title="Poista työpäivä"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Aktiviteetit</span>
                  </div>
                  <p className="text-sm text-secondary line-clamp-3">
                    {workDay.activities}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-success-400" />
                    <span className="text-sm font-medium text-primary">Oppiminen</span>
                  </div>
                  <p className="text-sm text-secondary line-clamp-3">
                    {workDay.learnings}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-secondary">{workDay.hoursWorked}h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-secondary">{mealDisplay.text}</span>
                  </div>
                </div>
                <div className="text-xs text-muted">
                  {new Date(workDay.updatedAt).toLocaleDateString('fi-FI')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};