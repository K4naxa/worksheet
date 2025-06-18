'use client'

import React from 'react';
import { Calendar, Clock, TrendingUp, MapPin } from 'lucide-react';
import { WorkStats } from '@/types';

interface StatisticsProps {
  stats: WorkStats;
}

export const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: Calendar,
      label: 'Työpäivät yhteensä',
      value: stats.totalDays,
      color: 'from-primary-500 to-secondary-500',
      description: 'päivää työskennelty'
    },
    {
      icon: Clock,
      label: 'Tunnit yhteensä',
      value: stats.totalHours,
      color: 'from-success-500 to-success-600',
      description: 'tuntia työskennelty'
    },
    {
      icon: TrendingUp,
      label: 'Harjoittelu edistyminen',
      value: `${Math.round(stats.practiceProgress)}%`,
      color: 'from-yellow-500 to-orange-500',
      description: 'harjoittelusta suoritettu'
    }
  ];

  const mealLocationData = [
    { label: 'Koulu', value: stats.mealDistribution.school, color: 'bg-primary-500' },
    { label: 'Työpaikka', value: stats.mealDistribution.workplace, color: 'bg-success-500' },
    { label: 'Muu', value: stats.mealDistribution.other, color: 'bg-orange-500' }
  ];

  const totalMeals = stats.mealDistribution.school + stats.mealDistribution.workplace + stats.mealDistribution.other;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Tilastot</h2>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">
                {item.value}
              </div>
              <div className="text-secondary text-sm font-medium mb-1">
                {item.label}
              </div>
              <div className="text-muted text-xs">
                {item.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meal Distribution */}
      {totalMeals > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-primary">Missä söit</h3>
          </div>
          
          <div className="space-y-4">
            {mealLocationData.map((item, index) => {
              const percentage = totalMeals > 0 ? (item.value / totalMeals) * 100 : 0;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-medium">{item.label}</span>
                    <span className="text-muted text-sm">
                      {item.value} päivää ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};