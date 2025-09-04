"use client";
import React, { useState, useMemo } from "react";
import {
  Edit,
  Trash2,
  BookOpen,
  Briefcase,
  Clock,
  Calendar,
  Utensils,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Workday } from "@/types";
import { formatDate, formatDateFinLong } from "@/utils/formatUtils";

interface WorkDaysListProps {
  workDays: Workday[];
  onEdit: (workDay: Workday) => void;
  onDelete: (date: string) => void;
}

const getMealLocationDisplay = (workDay: Workday) => {
  switch (workDay.mealLocation) {
    case "school":
      return { icon: "🏫", text: "Koulu" };
    case "work":
      return { icon: "🏢", text: "Työpaikka" };
    case "other":
      return { icon: "🍽️", text: "Muu" };
    default:
      return { icon: "❓", text: "Tuntematon" };
  }
};

export const WorkDaysList: React.FC<WorkDaysListProps> = ({ workDays, onEdit, onDelete }) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [mealLocationFilter, setMealLocationFilter] = useState<"all" | "school" | "work" | "other">("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // --------------------------------------------------------------------------
  // Filtering and Sorting Logic
  // --------------------------------------------------------------------------
  const filteredAndSortedWorkDays = useMemo(() => {
    let filtered = [...workDays];

    // Apply search filter - only search in activities, learnings, and mealLocationOther
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (workDay) =>
          workDay.activities.toLowerCase().includes(search) || workDay.learnings.toLowerCase().includes(search)
      );
    }

    // Apply meal location filter
    if (mealLocationFilter !== "all") {
      filtered = filtered.filter((workDay) => workDay.mealLocation === mealLocationFilter);
    }

    // Apply year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter((workDay) => new Date(workDay.date).getFullYear().toString() === yearFilter);
    }

    // Apply month filter
    if (monthFilter !== "all") {
      filtered = filtered.filter((workDay) => (new Date(workDay.date).getMonth() + 1).toString() === monthFilter);
    }

    // Apply sorting - always sort by date
    filtered.sort((a, b) => {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [workDays, searchTerm, mealLocationFilter, yearFilter, monthFilter, sortOrder]);

  // --------------------------------------------------------------------------
  // Pagination Logic
  // --------------------------------------------------------------------------
  const totalPages = Math.ceil(filteredAndSortedWorkDays.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkDays = filteredAndSortedWorkDays.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, mealLocationFilter, yearFilter, monthFilter, sortOrder]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
      if (e.key === "Escape" && showFilters) {
        setShowFilters(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFilters]);

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------
  const handleClearFilters = () => {
    setSearchTerm("");
    setMealLocationFilter("all");
    setYearFilter("all");
    setMonthFilter("all");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the page when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    searchTerm.trim() ||
    mealLocationFilter !== "all" ||
    yearFilter !== "all" ||
    monthFilter !== "all" ||
    sortOrder !== "desc";

  // Get available years and months from workdays data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    workDays.forEach((workDay) => {
      years.add(new Date(workDay.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Newest first
  }, [workDays]);

  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    workDays.forEach((workDay) => {
      const date = new Date(workDay.date);
      if (yearFilter === "all" || date.getFullYear().toString() === yearFilter) {
        months.add(date.getMonth() + 1);
      }
    });
    return Array.from(months).sort((a, b) => a - b); // January first
  }, [workDays, yearFilter]);

  const monthNames = [
    "Tammikuu",
    "Helmikuu",
    "Maaliskuu",
    "Huhtikuu",
    "Toukokuu",
    "Kesäkuu",
    "Heinäkuu",
    "Elokuu",
    "Syyskuu",
    "Lokakuu",
    "Marraskuu",
    "Joulukuu",
  ];

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
    <div className="space-y-4 h-full flex flex-col min-h-[600px]">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">Työpäivät</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">
              {filteredAndSortedWorkDays.length} / {workDays.length} työpäivää
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-200 glass-card glass-card-hover ${
                showFilters || hasActiveFilters ? "bg-primary/20 text-primary scale-105" : " text-secondary"
              }`}
              title="Suodattimet (Ctrl+F)"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Etsi aktiviteeteista, oppimisista tai ruokapaikasta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-card rounded-lg border border-white/20 bg-white/5 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
          />
        </div>

        {/* Filters Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out transform ${
            showFilters ? "max-h-96 opacity-100 mb-4 translate-y-0" : "max-h-0 opacity-0 mb-0 -translate-y-2"
          }`}
        >
          <div className="glass-card rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Meal Location Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm text-secondary whitespace-nowrap">Aterian paikka:</label>
                <select
                  value={mealLocationFilter}
                  onChange={(e) => setMealLocationFilter(e.target.value as any)}
                  className="glass-card bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all hover:bg-white/10 cursor-pointer"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    Kaikki
                  </option>
                  <option value="school" className="bg-gray-800 text-white">
                    Koulu
                  </option>
                  <option value="work" className="bg-gray-800 text-white">
                    Työpaikka
                  </option>
                  <option value="other" className="bg-gray-800 text-white">
                    Muu
                  </option>
                </select>
              </div>

              {/* Year Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm text-secondary whitespace-nowrap">Vuosi:</label>
                <select
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setMonthFilter("all"); // Reset month filter when year changes
                  }}
                  className="glass-card bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all hover:bg-white/10 cursor-pointer"
                >
                  <option value="all" className="bg-gray-800 text-white">
                    Kaikki vuodet
                  </option>
                  {availableYears.map((year) => (
                    <option key={year} value={year.toString()} className="bg-gray-800 text-white">
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm text-secondary whitespace-nowrap">Kuukausi:</label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="glass-card bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all hover:bg-white/10 cursor-pointer"
                  disabled={availableMonths.length === 0}
                >
                  <option value="all" className="bg-gray-800 text-white">
                    Kaikki kuukaudet
                  </option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month.toString()} className="bg-gray-800 text-white">
                      {monthNames[month - 1]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm text-secondary whitespace-nowrap">Järjestys:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="glass-card bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all hover:bg-white/10 cursor-pointer"
                >
                  <option value="desc" className="bg-gray-800 text-white">
                    Uusin ensin
                  </option>
                  <option value="asc" className="bg-gray-800 text-white">
                    Vanhin ensin
                  </option>
                </select>
              </div>

              {/* Items per page */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <label className="text-sm text-secondary whitespace-nowrap">Näytä:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="glass-card bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all hover:bg-white/10 cursor-pointer"
                >
                  <option value={10} className="bg-gray-800 text-white">
                    10
                  </option>
                  <option value={25} className="bg-gray-800 text-white">
                    25
                  </option>
                  <option value={50} className="bg-gray-800 text-white">
                    50
                  </option>
                  <option value={filteredAndSortedWorkDays.length} className="bg-gray-800 text-white">
                    Kaikki
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}

        {/* Quick summary when filters are active */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out transform ${
            hasActiveFilters ? "max-h-32 opacity-100 mb-4 translate-y-0" : "max-h-0 opacity-0 mb-0 -translate-y-2"
          }`}
        >
          <div className="glass-card rounded-lg p-3 bg-primary/5 flex gap-2 flex-wrap justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-primary font-medium">Suodatettu näkymä:</span>
              {searchTerm.trim() && (
                <span className="bg-white/10 px-2 py-1 rounded text-secondary flex items-center gap-1 hover:bg-white/15 transition-colors">
                  Haku: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-muted hover:text-primary transition-colors"
                    title="Poista haku"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {mealLocationFilter !== "all" && (
                <span className="bg-white/10 px-2 py-1 rounded text-secondary flex items-center gap-1 hover:bg-white/15 transition-colors">
                  {mealLocationFilter === "school" && "Koulu"}
                  {mealLocationFilter === "work" && "Työpaikka"}
                  {mealLocationFilter === "other" && "Muu"}
                  <button
                    onClick={() => setMealLocationFilter("all")}
                    className="text-muted hover:text-primary transition-colors"
                    title="Poista aterian paikka -suodatin"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {yearFilter !== "all" && (
                <span className="bg-white/10 px-2 py-1 rounded text-secondary flex items-center gap-1 hover:bg-white/15 transition-colors">
                  Vuosi: {yearFilter}
                  <button
                    onClick={() => {
                      setYearFilter("all");
                      setMonthFilter("all"); // Also reset month filter
                    }}
                    className="text-muted hover:text-primary transition-colors"
                    title="Poista vuosisuodatin"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {monthFilter !== "all" && (
                <span className="bg-white/10 px-2 py-1 rounded text-secondary flex items-center gap-1 hover:bg-white/15 transition-colors">
                  {monthNames[parseInt(monthFilter) - 1]}
                  <button
                    onClick={() => setMonthFilter("all")}
                    className="text-muted hover:text-primary transition-colors"
                    title="Poista kuukausisuodatin"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {sortOrder !== "desc" && (
                <span className="bg-white/10 px-2 py-1 rounded text-secondary flex items-center gap-1 hover:bg-white/15 transition-colors">
                  Vanhin ensin
                  <button
                    onClick={() => setSortOrder("desc")}
                    className="text-muted hover:text-primary transition-colors"
                    title="Palauta oletusjärjestys"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <div className="flex justify-start">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-1 text-sm text-secondary hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" />
                Tyhjennä suodattimet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Work Days List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        {filteredAndSortedWorkDays.length === 0 && hasActiveFilters ? (
          // Empty state for filtered results
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center">
              <Filter className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-primary mb-2">Ei työpäiviä suodattimilla</h3>
              <p className="text-secondary mb-4">Kokeile muuttaa suodattimia tai tyhjentää ne kokonaan</p>
              <button
                onClick={handleClearFilters}
                className="glass-card glass-card-hover px-4 py-2 rounded-lg text-primary text-sm transition-colors"
              >
                Tyhjennä suodattimet
              </button>
            </div>
          </div>
        ) : (
          // Normal list view
          <div className="space-y-4">
            {currentWorkDays.map((workDay) => {
              const formattedDate = formatDateFinLong(workDay.date);
              const isSickday = workDay.isSickday;

              if (isSickday) {
                return (
                  <div
                    key={workDay.id}
                    className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all overflow-hidden bg-gradient-to-r from-amber-400/5 to-amber-500/10 text-white border border-amber-500"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted" />
                        <h3 className="font-semibold text-primary">{formattedDate}</h3>
                      </div>
                      <div className="flex flex-col gap-2 justify-center sm:flex-row items-center">
                        <button
                          onClick={() => onEdit(workDay)}
                          className="p-1.5 rounded-lg glass-card glass-card-hover text-primary transition-colors"
                          title="Muokkaa työpäivää"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(formatDate(workDay.date))}
                          className="p-1.5 btn-danger glass-card "
                          title="Poista työpäivä"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <div className="text-2xl">🤒</div>
                      <span className="text-lg font-medium text-amber-400">Sairaspäivä</span>
                    </div>
                  </div>
                );
              }

              // Regular workday
              const mealDisplay = getMealLocationDisplay(workDay);
              const hours = Math.floor(workDay.hours);
              const minutes = Math.round((workDay.hours % 1) * 60);

              return (
                <div
                  key={workDay.id}
                  className="glass-card rounded-xl p-4 hover:bg-white/15 transition-all overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <h3 className="font-semibold text-primary">{formattedDate}</h3>
                    </div>
                    <div className="flex flex-col gap-2 justify-center sm:flex-row items-center">
                      <button
                        onClick={() => onEdit(workDay)}
                        className="p-1.5 rounded-lg glass-card glass-card-hover text-primary transition-colors"
                        title="Muokkaa työpäivää"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(formatDate(workDay.date))}
                        className="p-1.5 btn-danger glass-card "
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
                      <p className="text-sm text-secondary line-clamp-3 break-words">{workDay.activities}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-success-400" />
                        <span className="text-sm font-medium text-primary">Oppiminen</span>
                      </div>
                      <p className="text-sm text-secondary line-clamp-3 break-words">{workDay.learnings}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <div className="text-sm text-secondary">
                          <span>{`${hours} tuntia`}</span>
                          {minutes > 0 && <span> {`${minutes} minuuttia`}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-secondary break-words">{mealDisplay.text}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted">
                      {workDay.updatedAt && new Date(workDay.updatedAt).toLocaleDateString("fi-FI")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && itemsPerPage < filteredAndSortedWorkDays.length && filteredAndSortedWorkDays.length > 0 && (
        <div className="shrink-0 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between glass-card rounded-lg p-3 gap-3">
            <div className="text-sm text-secondary order-2 sm:order-1">
              Sivu {currentPage} / {totalPages} • Näytetään {startIndex + 1}-
              {Math.min(endIndex, filteredAndSortedWorkDays.length)} / {filteredAndSortedWorkDays.length}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg glass-card glass-card-hover text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Edellinen sivu"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;

                  // Show fewer pages on smaller screens - simplified mobile detection
                  const showPage =
                    totalPages <= 7
                      ? true
                      : page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage) {
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="text-secondary px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-sm transition-colors ${
                        isCurrentPage
                          ? "bg-primary/20 text-primary font-medium"
                          : "glass-card glass-card-hover text-secondary"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg glass-card glass-card-hover text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Seuraava sivu"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
