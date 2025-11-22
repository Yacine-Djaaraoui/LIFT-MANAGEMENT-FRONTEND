import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Users,
} from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendar";

const localizer = momentLocalizer(moment);

// Algerian wilayas (provinces) grouped by regions
const ALGERIAN_REGIONS = {
  west: [
    "Tlemcen",
    "Aïn Témouchent",
    "Sidi Bel Abbès",
    "Mascara",
    "Mostaganem",
    "Oran",
    "Relizane",
    "Saïda",
    "Tiaret",
    "Tissemsilt",
    "El Bayadh",
    "Naâma",
  ],
  middle: [
    "Alger",
    "Blida",
    "Boumerdès",
    "Tipaza",
    "Medea",
    "Aïn Defla",
    "Chlef",
    "Bouira",
    "Tizi Ouzou",
    "Béjaïa",
    "Bordj Bou Arréridj",
    "M'Sila",
    "Djelfa",
    "Laghouat",
  ],
  east: [
    "Jijel",
    "Skikda",
    "Annaba",
    "El Tarf",
    "Guelma",
    "Constantine",
    "Mila",
    "Oum El Bouaghi",
    "Sétif",
    "Batna",
    "Khenchela",
    "Souk Ahras",
    "Tébessa",
  ],
  south: [
    "Adrar",
    "Béchar",
    "Biskra",
    "El Oued",
    "Ghardaïa",
    "Illizi",
    "Tamanrasset",
    "Ouargla",
    "Tindouf",
    "Timimoun",
    "Bordj Badji Mokhtar",
    "Ouled Djellal",
    "Béni Abbès",
    "In Salah",
    "In Guezzam",
    "Touggourt",
    "Djanet",
    "El M'Ghair",
    "El Menia",
  ],
};

// Flatten all wilayas for the multi-select
const ALL_WILAYAS = Object.values(ALGERIAN_REGIONS).flat();

// Region names in French
const REGION_NAMES = {
  west: "Ouest",
  middle: "Centre",
  east: "Est",
  south: "Sud",
};

// Time zone colors
const TIME_ZONE_COLORS = {
  west: "#3B82F6", // Blue
  east: "#EF4444", // Red
  south: "#10B981", // Green
  middle: "#F59E0B", // Amber
};

// Get region for a wilaya
const getRegionForWilaya = (wilaya: string): string | null => {
  for (const [region, wilayas] of Object.entries(ALGERIAN_REGIONS)) {
    if (wilayas.includes(wilaya)) {
      return region;
    }
  }
  return null;
};

// Custom event component to remove time display
const CustomEvent = ({ event }: any) => {
  return (
    <div className="p-1 text-xs">
      <div className="font-medium truncate">{event.title}</div>
    </div>
  );
};

// Loading Calendar Component
const LoadingCalendar = () => {
  return (
    <div className="animate-pulse">
      {/* Calendar Header Loading */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
          <div className="flex items-center space-x-2">
            <div className="w-32 h-9 bg-gray-200 rounded"></div>
            <div className="w-24 h-9 bg-gray-200 rounded"></div>
          </div>
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
        </div>
        <div className="flex space-x-2">
          <div className="w-16 h-9 bg-gray-200 rounded"></div>
          <div className="w-20 h-9 bg-gray-200 rounded"></div>
          <div className="w-12 h-9 bg-gray-200 rounded"></div>
          <div className="w-20 h-9 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Calendar Grid Loading */}
      <div className="h-[600px] bg-gray-50 rounded-lg border">
        {/* Month Header */}
        <div className="grid grid-cols-7 gap-px border-b bg-gray-100">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-3 text-center">
              <div className="h-4 bg-gray-200 rounded mx-auto w-16"></div>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[100px] p-2 bg-white border-r border-b"
            >
              {/* Day number */}
              <div className="flex justify-between items-start mb-2">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>

              {/* Events loading */}
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Calculate time zone coloring periods
const calculateTimeZonePeriods = (events: any[]) => {
  const periods: any[] = [];

  // Get all projects with their regions
  const projectsWithRegions = events
    .map((event) => ({
      ...event,
      region: getRegionForWilaya(event.originalEvent.client_address?.city),
    }))
    .filter((project) => project.region) // Only projects with known regions
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Group projects by region
  const projectsByRegion: { [key: string]: any[] } = {};
  projectsWithRegions.forEach((project) => {
    if (!projectsByRegion[project.region]) {
      projectsByRegion[project.region] = [];
    }
    projectsByRegion[project.region].push(project);
  });

  // For each region, find projects that should trigger coloring
  Object.entries(projectsByRegion).forEach(([region, regionProjects]) => {
    regionProjects.forEach((project, index) => {
      const projectStart = new Date(project.start);
      const sevenDaysBefore = new Date(projectStart);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 6);

      // Check if there are any projects from the same region in the 7 days before this project
      const hasProjectsInPrevious7Days = regionProjects.some(
        (otherProject, otherIndex) => {
          if (otherIndex >= index) return false; // Only check projects before this one
          const otherStart = new Date(otherProject.start);
          return otherStart >= sevenDaysBefore && otherStart < projectStart;
        }
      );

      // If no projects in the previous 7 days, color the next 7 days
      if (!hasProjectsInPrevious7Days) {
        const periodStart = projectStart;
        const periodEnd = new Date(projectStart);
        periodEnd.setDate(periodEnd.getDate() + 6);

        periods.push({
          region: region,
          start: periodStart,
          end: periodEnd,
          triggeredBy: project.originalEvent.title,
        });
      }
    });
  });

  return periods;
};

// Get colored days for dayPropGetter
const getColoredDays = (periods: any[], currentDate: Date) => {
  const coloredDays: { [key: string]: { style: React.CSSProperties } } = {};

  periods.forEach((period) => {
    const periodStart = moment(period.start);
    const periodEnd = moment(period.end);
    const currentMonth = moment(currentDate).startOf("month");
    const currentMonthEnd = moment(currentDate).endOf("month");

    // Get overlap with current month
    const overlapStart = periodStart.isBefore(currentMonth)
      ? currentMonth
      : periodStart;
    const overlapEnd = periodEnd.isAfter(currentMonthEnd)
      ? currentMonthEnd
      : periodEnd;

    if (overlapStart.isAfter(overlapEnd)) return;

    // Generate all days in the period
    const currentDay = overlapStart.clone();
    while (currentDay.isSameOrBefore(overlapEnd)) {
      const dateString = currentDay.format("YYYY-MM-DD");
      coloredDays[dateString] = {
        style: {
          backgroundColor: `${
            TIME_ZONE_COLORS[period.region as keyof typeof TIME_ZONE_COLORS]
          }33`, // Add transparency
          backgroundImage: `linear-gradient(45deg, ${
            TIME_ZONE_COLORS[period.region as keyof typeof TIME_ZONE_COLORS]
          }33 25%, transparent 25%, transparent 50%, ${
            TIME_ZONE_COLORS[period.region as keyof typeof TIME_ZONE_COLORS]
          }33 50%, ${
            TIME_ZONE_COLORS[period.region as keyof typeof TIME_ZONE_COLORS]
          }33 75%, transparent 75%, transparent)`,
          backgroundSize: "4px 4px",
        },
      };
      currentDay.add(1, "day");
    }
  });

  return coloredDays;
};

export const CalendarComponent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<"regions" | "wilayas">(
    "regions"
  );

  // Filters state - use "all" for empty values
  const [filters, setFilters] = useState({
    event_type: "all",
    project_name: "",
    client_name: "",
    start_date: "",
    end_date: "",
    status: "all",
    is_verified: "all",
    is_overdue: "all",
    province: "",
    city: "",
    postal_code: "",
  });

  // Get final wilayas list based on selected regions and individual wilayas
  const getFinalWilayasList = () => {
    if (selectedRegions.length === 0 && selectedWilayas.length === 0) {
      return [];
    }

    const regionWilayas = selectedRegions.flatMap(
      (region) =>
        ALGERIAN_REGIONS[region as keyof typeof ALGERIAN_REGIONS] || []
    );

    const allWilayas = [...new Set([...regionWilayas, ...selectedWilayas])];
    return allWilayas;
  };

  // Prepare filters for API call
  const finalWilayas = getFinalWilayasList();
  const apiFilters = {
    event_type: filters.event_type === "all" ? "" : filters.event_type,
    project_name: filters.project_name,
    client_name: filters.client_name,
    start_date: filters.start_date,
    end_date: filters.end_date,
    status: filters.status === "all" ? "" : filters.status,
    is_verified: filters.is_verified === "all" ? "" : filters.is_verified,
    is_overdue: filters.is_overdue === "all" ? "" : filters.is_overdue,
    province: filters.province,
    city: finalWilayas.length > 0 ? finalWilayas : undefined,
    postal_code: filters.postal_code,
  };

  const {
    data: calendarData,
    isLoading,
    error,
  } = useCalendarEvents(apiFilters);

  // Convert API events to calendar events
  const events = (calendarData?.events || []).map((event: any) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.start),
    allDay: true,
    originalEvent: event,
  }));

  // Calculate time zone periods
  const timeZonePeriods = useMemo(
    () => calculateTimeZonePeriods(events),
    [events]
  );

  // Get colored days for dayPropGetter
  const coloredDays = useMemo(
    () => getColoredDays(timeZonePeriods, currentDate),
    [timeZonePeriods, currentDate]
  );

  // Day prop getter for time zone coloring
  const dayPropGetter = useMemo(() => {
    return (date: Date) => {
      const dateString = moment(date).format("YYYY-MM-DD");
      return coloredDays[dateString] || {};
    };
  }, [coloredDays]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      event_type: "all",
      project_name: "",
      client_name: "",
      start_date: "",
      end_date: "",
      status: "all",
      is_verified: "all",
      is_overdue: "all",
      province: "",
      city: "",
      postal_code: "",
    });
    setSelectedWilayas([]);
    setSelectedRegions([]);
    setWilayaSearch("");
  };

  // Region selection functions
  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const selectAllRegions = () => {
    setSelectedRegions(Object.keys(ALGERIAN_REGIONS));
  };

  const clearAllRegions = () => {
    setSelectedRegions([]);
  };

  // Wilaya selection functions
  const toggleWilaya = (wilaya: string) => {
    setSelectedWilayas((prev) =>
      prev.includes(wilaya)
        ? prev.filter((w) => w !== wilaya)
        : [...prev, wilaya]
    );
  };

  const removeWilaya = (wilaya: string) => {
    setSelectedWilayas((prev) => prev.filter((w) => w !== wilaya));
  };

  const clearAllWilayas = () => {
    setSelectedWilayas([]);
  };

  // Filter wilayas based on search and exclude those from selected regions
  const filteredWilayas = ALL_WILAYAS.filter((wilaya) => {
    const matchesSearch = wilaya
      .toLowerCase()
      .includes(wilayaSearch.toLowerCase());

    const isInSelectedRegion = selectedRegions.some((region) =>
      ALGERIAN_REGIONS[region as keyof typeof ALGERIAN_REGIONS].includes(wilaya)
    );

    return matchesSearch && !isInSelectedRegion;
  });

  // Get wilayas that are selected individually (not via regions)
  const getIndividualWilayas = () => {
    return selectedWilayas.filter(
      (wilaya) =>
        !selectedRegions.some((region) =>
          ALGERIAN_REGIONS[region as keyof typeof ALGERIAN_REGIONS].includes(
            wilaya
          )
        )
    );
  };

  // Navigation functions
  const navigateToPrevious = () => {
    if (currentView === "month") {
      setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
    } else if (currentView === "week") {
      setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
    } else {
      setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
    }
  };

  const navigateToNext = () => {
    if (currentView === "month") {
      setCurrentDate(moment(currentDate).add(1, "month").toDate());
    } else if (currentView === "week") {
      setCurrentDate(moment(currentDate).add(1, "week").toDate());
    } else {
      setCurrentDate(moment(currentDate).add(1, "day").toDate());
    }
  };

  // Month and year selection functions
  const selectMonth = (month: number) => {
    const newDate = moment(currentDate).month(month).toDate();
    setCurrentDate(newDate);
    setShowMonthPicker(false);
  };

  const selectYear = (year: number) => {
    const newDate = moment(currentDate).year(year).toDate();
    setCurrentDate(newDate);
    setShowYearPicker(false);
  };

  // Get current month and year for display
  const currentMonth = moment(currentDate).format("MMMM");
  const currentYear = moment(currentDate).format("YYYY");

  // Generate months for picker
  const months = moment.months();

  // Generate years for picker (from current year - 10 to current year + 10)
  const currentYearNum = moment().year();
  const years = Array.from({ length: 21 }, (_, i) => currentYearNum - 10 + i);

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "";

    switch (event.originalEvent.type) {
      case "project":
        backgroundColor = "#3B82F6";
        break;
      case "maintenance":
        backgroundColor = "#F59E0B";
        break;
      default:
        backgroundColor = "#6B7280";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "12px",
        padding: "2px 4px",
        margin: "1px 0",
      },
    };
  };

  const getEventStatusBadge = (status: string) => {
    const statusConfig: any = {
      DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
      UPCOMING: { label: "À venir", color: "bg-blue-100 text-blue-800" },
      ACTIVE: { label: "Actif", color: "bg-green-100 text-green-800" },
      COMPLETED: { label: "Terminé", color: "bg-purple-100 text-purple-800" },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getEventTypeBadge = (type: string) => {
    const typeConfig: any = {
      project: { label: "Projet", color: "bg-blue-100 text-blue-800" },
      maintenance: {
        label: "Maintenance",
        color: "bg-amber-100 text-amber-800",
      },
    };

    const config = typeConfig[type];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getProgressBadge = (progress: number) => {
    let color = "bg-gray-100 text-gray-800";
    if (progress >= 100) color = "bg-green-100 text-green-800";
    else if (progress >= 75) color = "bg-blue-100 text-blue-800";
    else if (progress >= 50) color = "bg-yellow-100 text-yellow-800";
    else if (progress > 0) color = "bg-orange-100 text-orange-800";

    return <Badge className={color}>{progress}%</Badge>;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Erreur lors du chargement du calendrier
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendrier</h1>
          <p className="text-sm text-gray-600">
            {calendarData &&
              `Rôle: ${calendarData.user_role} • ${calendarData.total_events} événements`}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
            {finalWilayas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {finalWilayas.length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentDate(new Date());
              setCurrentView("month");
            }}
            className="flex items-center space-x-2"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Aujourd'hui</span>
          </Button>
        </div>
      </div>

      {/* Time Zone Legend */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-3">Légende des Zones Temporelles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(REGION_NAMES).map(([key, name]) => (
            <div key={key} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded border"
                style={{
                  backgroundColor:
                    TIME_ZONE_COLORS[key as keyof typeof TIME_ZONE_COLORS],
                  opacity: 0.3,
                }}
              />
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Les 7 jours suivant un projet sont colorés si aucun autre projet de
          la même région n'existe dans les 7 jours précédents
        </p>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filtres Géographiques</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Effacer tout
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeFilterTab === "regions"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveFilterTab("regions")}
            >
              <MapPin className="w-4 h-4" />
              <span>Par Régions</span>
            </button>
            <button
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeFilterTab === "wilayas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveFilterTab("wilayas")}
            >
              <Users className="w-4 h-4" />
              <span>Par Wilayas</span>
            </button>
          </div>

          {/* Active Filters Summary */}
          {(selectedRegions.length > 0 || selectedWilayas.length > 0) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Filtres actifs:
                </span>
                <span className="text-sm text-blue-600">
                  {finalWilayas.length} wilaya(s) sélectionnée(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedRegions.map((region) => (
                  <Badge
                    key={region}
                    className="bg-blue-100 text-blue-800 flex items-center space-x-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>
                      {REGION_NAMES[region as keyof typeof REGION_NAMES]}
                    </span>
                    <button
                      onClick={() => toggleRegion(region)}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {getIndividualWilayas().map((wilaya) => (
                  <Badge
                    key={wilaya}
                    variant="secondary"
                    className="flex items-center space-x-1"
                  >
                    <span>{wilaya}</span>
                    <button
                      onClick={() => removeWilaya(wilaya)}
                      className="ml-1 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Region Filter */}
            {activeFilterTab === "regions" && (
              <div className="md:col-span-2 lg:col-span-4">
                <div className="flex justify-between items-center mb-3">
                  <Label>Sélectionnez une ou plusieurs régions</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllRegions}
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllRegions}
                    >
                      Tout effacer
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(REGION_NAMES).map(([key, name]) => (
                    <div
                      key={key}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedRegions.includes(key)
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => toggleRegion(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {
                              ALGERIAN_REGIONS[
                                key as keyof typeof ALGERIAN_REGIONS
                              ].length
                            }{" "}
                            wilayas
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedRegions.includes(key)
                              ? "bg-blue-500 border-blue-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {selectedRegions.includes(key) && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wilaya Multi-Select */}
            {activeFilterTab === "wilayas" && (
              <div className="md:col-span-2 lg:col-span-4">
                <div className="flex justify-between items-center mb-3">
                  <Label>Sélectionnez des wilayas individuelles</Label>
                  {selectedWilayas.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllWilayas}
                    >
                      Effacer la sélection
                    </Button>
                  )}
                </div>

                {selectedRegions.length > 0 && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Les wilayas des régions
                      sélectionnées sont automatiquement incluses. Vous pouvez
                      ajouter des wilayas supplémentaires ici.
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher une wilaya..."
                      value={wilayaSearch}
                      onChange={(e) => setWilayaSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Wilayas list */}
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredWilayas.length > 0 ? (
                      filteredWilayas.map((wilaya) => (
                        <div
                          key={wilaya}
                          className={`flex items-center space-x-3 p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                            selectedWilayas.includes(wilaya)
                              ? "bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleWilaya(wilaya)}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedWilayas.includes(wilaya)
                                ? "bg-blue-500 border-blue-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {selectedWilayas.includes(wilaya) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{wilaya}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {wilayaSearch
                          ? "Aucune wilaya trouvée pour votre recherche"
                          : "Toutes les wilayas sont déjà sélectionnées via les régions"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other filters */}
            <div className="md:col-span-2 lg:col-span-4 border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Autres Filtres</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Event Type */}
                <div>
                  <Label>Type d'événement</Label>
                  <Select
                    value={filters.event_type}
                    onValueChange={(value) =>
                      handleFilterChange("event_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="project">Projets</SelectItem>
                      <SelectItem value="maintenance">Maintenances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label>Statut</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                      <SelectItem value="UPCOMING">À venir</SelectItem>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="COMPLETED">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Verification */}
                <div>
                  <Label>Vérification</Label>
                  <Select
                    value={filters.is_verified}
                    onValueChange={(value) =>
                      handleFilterChange("is_verified", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="true">Vérifié</SelectItem>
                      <SelectItem value="false">Non vérifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Name Search */}
                <div>
                  <Label>Nom du projet</Label>
                  <Input
                    placeholder="Rechercher par projet..."
                    value={filters.project_name}
                    onChange={(e) =>
                      handleFilterChange("project_name", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation and Component */}
      <div className="bg-white rounded-lg shadow p-4">
        {isLoading ? (
          <LoadingCalendar />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateToPrevious}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Month and Year Selector */}
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowMonthPicker(!showMonthPicker)}
                      className="min-w-[120px] justify-between"
                    >
                      <span>{currentMonth}</span>
                    </Button>
                    {showMonthPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 w-40 max-h-60 overflow-y-auto">
                        {months.map((month, index) => (
                          <button
                            key={month}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                              index === moment(currentDate).month()
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => selectMonth(index)}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={() => setShowYearPicker(!showYearPicker)}
                      className="min-w-[100px] justify-between"
                    >
                      <span>{currentYear}</span>
                    </Button>
                    {showYearPicker && (
                      <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 w-32 max-h-60 overflow-y-auto">
                        {years.map((year) => (
                          <button
                            key={year}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                              year === moment(currentDate).year()
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => selectYear(year)}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="icon" onClick={navigateToNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* View Selector */}
              <div className="flex space-x-2">
                <Button
                  variant={currentView === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("month")}
                >
                  Mois
                </Button>
                <Button
                  variant={currentView === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("week")}
                >
                  Semaine
                </Button>
                <Button
                  variant={currentView === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("day")}
                >
                  Jour
                </Button>
                <Button
                  variant={currentView === "agenda" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("agenda")}
                >
                  Agenda
                </Button>
              </div>
            </div>

            {/* Calendar with time zone backgrounds */}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day", "agenda"]}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              style={{ height: 600 }}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
              onSelectEvent={(event: any) =>
                setSelectedEvent(event.originalEvent)
              }
              components={{
                event: CustomEvent,
                month: {
                  dateHeader: ({ date, label }: any) => (
                    <div className="rbc-date-cell">
                      <span>{label}</span>
                    </div>
                  ),
                },
              }}
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
                date: "Date",
                time: "Heure",
                event: "Événement",
                noEventsInRange: "Aucun événement dans cette période",
              }}
              formats={{
                timeGutterFormat: () => "",
                eventTimeRangeFormat: () => "",
              }}
              step={60}
              timeslots={1}
              showMultiDayTimes={false}
              defaultView="month"
            />
          </>
        )}
      </div>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'événement</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <div className="flex space-x-2">
                  {getEventTypeBadge(selectedEvent.type)}
                  {selectedEvent.type === "project" &&
                    selectedEvent.status &&
                    getEventStatusBadge(selectedEvent.status)}
                  {selectedEvent.is_verified && (
                    <Badge className="bg-green-100 text-green-800">
                      Vérifié
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Projet</Label>
                  <p>{selectedEvent.project_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Client</Label>
                  <p>{selectedEvent.client_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Date de début</Label>
                  <p>
                    {moment(
                      selectedEvent.start_date || selectedEvent.start
                    ).format("DD/MM/YYYY")}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Date de fin</Label>
                  <p>
                    {moment(selectedEvent.end_date || selectedEvent.end).format(
                      "DD/MM/YYYY"
                    )}
                  </p>
                </div>
                {selectedEvent.type === "project" && (
                  <>
                    <div>
                      <Label className="font-medium">Durée</Label>
                      <p>{selectedEvent.duration_days} jours</p>
                    </div>
                    <div>
                      <Label className="font-medium">Progression</Label>
                      <div className="flex items-center space-x-2">
                        {getProgressBadge(
                          selectedEvent.progress_percentage || 0
                        )}
                      </div>
                    </div>
                  </>
                )}
                {selectedEvent.type === "maintenance" && (
                  <>
                    <div>
                      <Label className="font-medium">Numéro</Label>
                      <p>#{selectedEvent.maintenance_number}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Type</Label>
                      <p>{selectedEvent.maintenance_type}</p>
                    </div>
                  </>
                )}
              </div>

              {selectedEvent.client_address && (
                <div>
                  <Label className="font-medium">Adresse du client</Label>
                  <div className="text-sm text-gray-600">
                    {selectedEvent.client_address.city && (
                      <p>Wilaya: {selectedEvent.client_address.city}</p>
                    )}
                    {selectedEvent.client_address.province && (
                      <p>Province: {selectedEvent.client_address.province}</p>
                    )}
                    {selectedEvent.client_address.postal_code && (
                      <p>
                        Code postal: {selectedEvent.client_address.postal_code}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setSelectedEvent(null)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
