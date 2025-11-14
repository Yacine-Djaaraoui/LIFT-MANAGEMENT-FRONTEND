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
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { useCalendarEvents } from "@/hooks/useCalendar";

const localizer = momentLocalizer(moment);

export const CalendarComponent: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

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
    city: filters.city,
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
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "";

    switch (event.originalEvent.type) {
      case "project_start":
        backgroundColor = "#3B82F6";
        break;
      case "project_end":
        backgroundColor = "#10B981";
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
      project_start: {
        label: "Début Projet",
        color: "bg-blue-100 text-blue-800",
      },
      project_end: {
        label: "Fin Projet",
        color: "bg-green-100 text-green-800",
      },
      maintenance: {
        label: "Maintenance",
        color: "bg-amber-100 text-amber-800",
      },
    };

    const config = typeConfig[type];
    return <Badge className={config.color}>{config.label}</Badge>;
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
                  <SelectItem value="project_start">Début de projet</SelectItem>
                  <SelectItem value="project_end">Fin de projet</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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

            {/* Overdue */}
            <div>
              <Label>Retard</Label>
              <Select
                value={filters.is_overdue}
                onValueChange={(value) =>
                  handleFilterChange("is_overdue", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">En retard</SelectItem>
                  <SelectItem value="false">Dans les temps</SelectItem>
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

            {/* City */}
            <div>
              <Label>Ville</Label>
              <Input
                placeholder="Filtrer par ville..."
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div>
              <Label>Date de début</Label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
              />
            </div>

            <div>
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-4">
        {isLoading ? (
          <div className="text-center py-8">Chargement du calendrier...</div>
        ) : (
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
          />
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
                  {getEventStatusBadge(selectedEvent.status)}
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
                  <Label className="font-medium">Date</Label>
                  <p>{moment(selectedEvent.start).format("DD/MM/YYYY")}</p>
                </div>
                <div>
                  <Label className="font-medium">Type</Label>
                  <p className="capitalize">
                    {selectedEvent.type.replace("_", " ")}
                  </p>
                </div>
              </div>

              {selectedEvent.client_address && (
                <div>
                  <Label className="font-medium">Adresse du client</Label>
                  <div className="text-sm text-gray-600">
                    {selectedEvent.client_address.city && (
                      <p>Ville: {selectedEvent.client_address.city}</p>
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
