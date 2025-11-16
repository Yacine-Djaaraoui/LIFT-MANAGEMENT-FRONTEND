import React, { useState } from "react";
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
} from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendar";

const localizer = momentLocalizer(moment);

// Algerian wilayas (provinces)
const ALGERIAN_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
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
];

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

export const CalendarComponent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const [wilayaSearch, setWilayaSearch] = useState("");

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

  // Prepare filters for API call - convert "all" to empty string
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
    // Use selected wilayas as city filter - join selected wilayas with comma
    city: selectedWilayas.length > 0 ? selectedWilayas : undefined,
    postal_code: filters.postal_code,
  };

  const {
    data: calendarData,
    isLoading,
    error,
  } = useCalendarEvents(apiFilters);

  // Convert API events to calendar events - show only on start date, no time
  const events = (calendarData?.events || []).map((event: any) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.start), // Same as start to show as single day event
    allDay: true, // Mark as all-day event to remove time display
    originalEvent: event,
  }));

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
    setWilayaSearch("");
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

  // Filter wilayas based on search
  const filteredWilayas = ALGERIAN_WILAYAS.filter((wilaya) =>
    wilaya.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

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
        backgroundColor = "#3B82F6"; // blue for projects
        break;
      case "maintenance":
        backgroundColor = "#F59E0B"; // amber for maintenance
        break;
      default:
        backgroundColor = "#6B7280"; // gray
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

  const getMaintenanceStatusBadge = (isOverdue: boolean, daysUntil: number) => {
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-800">
          En retard ({Math.abs(daysUntil)} jours)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800">
          Dans les temps ({daysUntil} jours)
        </Badge>
      );
    }
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
            {selectedWilayas.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedWilayas.length}
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

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filtres</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wilaya Multi-Select */}
            <div className="md:col-span-2 lg:col-span-4">
              <Label>Wilayas</Label>
              <div className="space-y-2">
                {/* Selected wilayas badges */}
                {selectedWilayas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedWilayas.map((wilaya) => (
                      <Badge
                        key={wilaya}
                        variant="secondary"
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => removeWilaya(wilaya)}
                      >
                        <span>{wilaya}</span>
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllWilayas}
                      className="h-6 px-2 text-xs"
                    >
                      Tout effacer
                    </Button>
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une wilaya..."
                    value={wilayaSearch}
                    onChange={(e) => setWilayaSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Wilayas list */}
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {filteredWilayas.length > 0 ? (
                    filteredWilayas.map((wilaya) => (
                      <div
                        key={wilaya}
                        className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100 ${
                          selectedWilayas.includes(wilaya) ? "bg-blue-50" : ""
                        }`}
                        onClick={() => toggleWilaya(wilaya)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWilayas.includes(wilaya)}
                          onChange={() => {}}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{wilaya}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Aucune wilaya trouvée
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {selectedWilayas.length} wilaya(s) sélectionnée(s)
                </p>
              </div>
            </div>

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
                onValueChange={(value) => handleFilterChange("status", value)}
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

            {/* Client Name Search */}
            <div>
              <Label>Nom du client</Label>
              <Input
                placeholder="Rechercher par client..."
                value={filters.client_name}
                onChange={(e) =>
                  handleFilterChange("client_name", e.target.value)
                }
              />
            </div>

            {/* Province */}
            <div>
              <Label>Province</Label>
              <Input
                placeholder="Filtrer par province..."
                value={filters.province}
                onChange={(e) => handleFilterChange("province", e.target.value)}
              />
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

            {/* Calendar */}
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
              onSelectEvent={(event: any) =>
                setSelectedEvent(event.originalEvent)
              }
              components={{
                event: CustomEvent,
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
                timeGutterFormat: () => "", // Remove time gutter
                eventTimeRangeFormat: () => "", // Remove event time display
              }}
              step={60} // 60 minutes step
              timeslots={1} // Only one timeslot per hour
              showMultiDayTimes={false} // Don't show times for multi-day events
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
