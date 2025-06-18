import React from 'react';
import { Edit, Trash2, MapPin, BookOpen, Briefcase, Calendar } from 'lucide-react';
import { WorkDay } from '../types';

interface WorkDayDetailsProps {
  workDay: WorkDay;
  onEdit: () => void;
  onDelete: () => void;
}

export const WorkDayDetails: React.FC<WorkDayDetailsProps> = ({ workDay, onEdit, onDelete }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMealLocationDisplay = () => {
    switch (workDay.mealLocation) {
      case 'school':
        return { icon: '🏫', text: 'School' };
      case 'workplace':
        return { icon: '🏢', text: 'Workplace' };
      case 'other':
        return { icon: '🍽️', text: workDay.mealLocationOther || 'Other' };
      default:
        return { icon: '❓', text: 'Unknown' };
    }
  };

  const mealDisplay = getMealLocationDisplay();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-white/60" />
            <h3 className="text-xl font-bold text-white">
              {formatDate(workDay.date)}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Edit work day"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              title="Delete work day"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-white/40 text-sm">
          Last updated: {new Date(workDay.updatedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Activities */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h4 className="font-semibold text-white">What you did</h4>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {workDay.activities}
            </p>
          </div>
        </div>

        {/* Learnings */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">What you learned</h4>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {workDay.learnings}
            </p>
          </div>
        </div>

        {/* Meal Location */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            <h4 className="font-semibold text-white">Where you ate</h4>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{mealDisplay.icon}</span>
              <span className="text-white/80 font-medium">{mealDisplay.text}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};