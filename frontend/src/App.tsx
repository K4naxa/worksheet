import React, { useState, useEffect } from 'react';
import { Calendar, Statistics, WorkDayModal, WorkDaysList, SettingsModal } from './components';
import { WorkDay, WorkStats, WorkPracticeSettings } from './types';
import { getWorkDays, saveWorkDay, deleteWorkDay, getWorkPracticeSettings, saveWorkPracticeSettings } from './utils/storage';
import { calculateStats } from './utils/stats';
import { BookOpen, BarChart3, CalendarDays, Plus, Settings, List } from 'lucide-react';

function App() {
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [stats, setStats] = useState<WorkStats>({
    totalDays: 0,
    totalHours: 0,
    practiceProgress: 0,
    mealDistribution: { school: 0, workplace: 0, other: 0 }
  });
  const [settings, setSettings] = useState<WorkPracticeSettings>({ workDays: [1, 2, 3, 4, 5] });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'workdays' | 'stats'>('calendar');
  const [editingWorkDay, setEditingWorkDay] = useState<WorkDay | undefined>();

  useEffect(() => {
    const savedWorkDays = getWorkDays();
    const savedSettings = getWorkPracticeSettings();
    setWorkDays(savedWorkDays);
    setSettings(savedSettings);
    setStats(calculateStats(savedWorkDays, savedSettings));
  }, []);

  const handleSaveWorkDay = (workDay: WorkDay) => {
    saveWorkDay(workDay);
    const updatedWorkDays = getWorkDays();
    setWorkDays(updatedWorkDays);
    setStats(calculateStats(updatedWorkDays, settings));
    setEditingWorkDay(undefined);
  };

  const handleDeleteWorkDay = (date: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän työpäivän?')) {
      deleteWorkDay(date);
      const updatedWorkDays = getWorkDays();
      setWorkDays(updatedWorkDays);
      setStats(calculateStats(updatedWorkDays, settings));
      if (selectedDate === date) {
        setSelectedDate('');
        setActiveTab('calendar');
      }
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const existingWorkDay = workDays.find(day => day.date === date);
    setEditingWorkDay(existingWorkDay);
    setIsModalOpen(true);
  };

  const handleEditWorkDay = (workDay: WorkDay) => {
    setSelectedDate(workDay.date);
    setEditingWorkDay(workDay);
    setIsModalOpen(true);
  };

  const handleSaveSettings = (newSettings: WorkPracticeSettings) => {
    saveWorkPracticeSettings(newSettings);
    setSettings(newSettings);
    setStats(calculateStats(workDays, newSettings));
  };

  const tabs = [
    { id: 'calendar', label: 'Kalenteri', icon: CalendarDays },
    { id: 'workdays', label: 'Työpäivät', icon: List },
    { id: 'stats', label: 'Tilastot', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Työharjoittelu Seuranta
            </h1>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-xl glass-card glass-card-hover text-primary transition-colors"
              title="Asetukset"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Seuraa päivittäisiä aktiviteettejasi, oppimistasi ja edistymistäsi työharjoittelun aikana
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card rounded-2xl p-2">
            <div className="flex space-x-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all
                      ${activeTab === tab.id
                        ? 'text-white shadow-lg'
                        : 'text-secondary glass-card-hover'
                      }
                    `}
                    style={activeTab === tab.id ? { background: 'var(--gradient-primary)' } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'calendar' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Calendar
                  workDays={workDays}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              </div>
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setEditingWorkDay(undefined);
                    setIsModalOpen(true);
                  }}
                  className="w-full p-4 btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Lisää tämän päivän työ</span>
                </button>
                
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Pikavinkit</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li>• Klikkaa mitä tahansa päivää lisätäksesi tai nähdäksesi työn tiedot</li>
                    <li>• Vihreät päivät näyttävät suoritetut työpäivät</li>
                    <li>• Seuraa edistymistäsi Tilastot-välilehdessä</li>
                    <li>• Määritä harjoittelun ajankohta asetuksista</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workdays' && (
            <div className="max-w-4xl mx-auto">
              <WorkDaysList
                workDays={workDays}
                onEdit={handleEditWorkDay}
                onDelete={handleDeleteWorkDay}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <Statistics stats={stats} />
          )}
        </div>

        {/* Work Day Modal */}
        <WorkDayModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingWorkDay(undefined);
          }}
          onSave={handleSaveWorkDay}
          selectedDate={selectedDate}
          existingWorkDay={editingWorkDay}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          currentSettings={settings}
        />
      </div>
    </div>
  );
}

export default App;