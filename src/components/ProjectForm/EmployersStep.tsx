import React, { useState, useEffect } from "react";
import { useEmployers } from "@/hooks/useEmployers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Employer {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  group: string;
}

interface EmployersStepProps {
  onNext: () => void;
  onBack: () => void;
  onEmployersSelect: (employers: string[]) => void;
  initialEmployers?: string[];
}

export const EmployersStep: React.FC<EmployersStepProps> = ({
  onNext,
  onBack,
  onEmployersSelect,
  initialEmployers = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedEmployers, setSelectedEmployers] =
    useState<string[]>(initialEmployers);
  const [selectedEmployersDetails, setSelectedEmployersDetails] = useState<
    Employer[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch employers with search and group filters for the list
  const apiGroup =
    selectedGroup && selectedGroup !== "all" ? selectedGroup : undefined;

  const { data: employersData, isLoading } = useEmployers({
    search: searchTerm,
    group: apiGroup,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "username",
  });

  // Fetch ALL employers to get available groups
  const { data: allEmployersData } = useEmployers({
    page_size: "1000",
    ordering: "group",
  });

  // Initialize with initial employers
  useEffect(() => {
    if (initialEmployers.length > 0 && allEmployersData?.results) {
      const initialDetails = allEmployersData.results.filter((emp: Employer) =>
        initialEmployers.includes(emp.id)
      );
      setSelectedEmployersDetails(initialDetails);

      // Auto-detect groups from initial employers
      const initialGroups = [
        ...new Set(
          initialDetails
            .map((emp: Employer) => emp.group)
            .filter(
              (group): group is string =>
                group !== null &&
                group !== undefined &&
                group !== "" &&
                group.trim() !== ""
            )
        ),
      ];
      setSelectedGroups(initialGroups);
    }
  }, [initialEmployers, allEmployersData]);

  useEffect(() => {
    onEmployersSelect(selectedEmployers);
  }, [selectedEmployers, onEmployersSelect]);

  // Get unique groups from ALL employers
  const availableGroups = React.useMemo(() => {
    if (!allEmployersData?.results) return [];

    const groups = allEmployersData.results
      .map((employer: any) => employer.group)
      .filter(
        (group: string | null): group is string =>
          group !== null &&
          group !== undefined &&
          group !== "" &&
          group.trim() !== ""
      );

    return [...new Set(groups)].sort();
  }, [allEmployersData]);

  // Handle group selection for the list filter
  const handleGroupFilterChange = (value: string) => {
    setSelectedGroup(value);
    setCurrentPage(1);
  };

  // Handle adding a group to selection
  const handleGroupSelect = (groupId: string) => {
    if (groupId === "none" || selectedGroups.includes(groupId)) return;

    const newGroups = [...selectedGroups, groupId];
    setSelectedGroups(newGroups);

    // Add all employers from this group to selection
    if (allEmployersData?.results) {
      const groupEmps = allEmployersData.results
        .filter((emp: Employer) => emp.group === groupId)
        .map((emp: Employer) => emp.id);

      const newSelection = [...new Set([...selectedEmployers, ...groupEmps])];
      setSelectedEmployers(newSelection);

      // Update details
      const newDetails = allEmployersData.results.filter((emp: Employer) =>
        newSelection.includes(emp.id)
      );
      setSelectedEmployersDetails(newDetails);
    }
  };

  const handleRemoveGroup = (groupToRemove: string) => {
    const newGroups = selectedGroups.filter((group) => group !== groupToRemove);
    setSelectedGroups(newGroups);

    // Remove employers that belong only to the removed group
    if (allEmployersData?.results) {
      const employersToKeep = selectedEmployers.filter((empId) => {
        const employer = allEmployersData.results.find(
          (e: Employer) => e.id === empId
        );
        if (!employer) return true;

        // Keep employer if they belong to at least one remaining selected group
        // OR if they don't belong to any group
        return newGroups.includes(employer.group) || !employer.group;
      });

      setSelectedEmployers(employersToKeep);

      // Update details
      const newDetails = allEmployersData.results.filter((emp: Employer) =>
        employersToKeep.includes(emp.id)
      );
      setSelectedEmployersDetails(newDetails);
    }
  };

  const handleEmployerToggle = (employer: Employer) => {
    setSelectedEmployers((prev) => {
      if (prev.includes(employer.id)) {
        return prev.filter((id) => id !== employer.id);
      } else {
        return [...prev, employer.id];
      }
    });

    setSelectedEmployersDetails((prev) => {
      if (prev.find((e) => e.id === employer.id)) {
        return prev.filter((e) => e.id !== employer.id);
      } else {
        return [...prev, employer];
      }
    });
  };

  const handleRemoveEmployer = (employerId: string) => {
    setSelectedEmployers((prev) => prev.filter((id) => id !== employerId));
    setSelectedEmployersDetails((prev) =>
      prev.filter((e) => e.id !== employerId)
    );
  };

  const handleClearAllGroups = () => {
    setSelectedGroups([]);
    // Don't clear all employers, just remove group-based selections
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGroup("");
    setCurrentPage(1);
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assigner les Employés</h3>
        <p className="text-sm text-gray-600">
          Sélectionnez les employés qui travailleront sur ce projet{" "}
          <span className="text-gray-500">(Optionnel)</span>
        </p>
      </div>

      {/* Selected Groups */}
      {selectedGroups.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Groupes sélectionnés:</h4>
            <Button variant="outline" size="sm" onClick={handleClearAllGroups}>
              Effacer tous les groupes
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map((group) => (
              <Badge
                key={group}
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-800"
              >
                {group}
                <button
                  className="cursor-pointer ml-1"
                  onClick={() => handleRemoveGroup(group)}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected Employers */}
      {selectedEmployersDetails.length > 0 && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">
            Employés sélectionnés ({selectedEmployersDetails.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedEmployersDetails.map((employer) => (
              <Badge
                key={employer.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {employer.first_name && employer.last_name
                  ? `${employer.first_name} ${employer.last_name}`
                  : employer.username}
                {employer.group && (
                  <span className="text-xs ml-1">({employer.group})</span>
                )}
                <button
                  className="cursor-pointer ml-1"
                  onClick={() => handleRemoveEmployer(employer.id)}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add Group Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="group-select">Ajouter un groupe</Label>
          <Select onValueChange={handleGroupSelect} value="">
            <SelectTrigger>
              <SelectValue placeholder="Choisir un groupe à ajouter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sélectionner un groupe</SelectItem>
              {availableGroups
                .filter((group) => !selectedGroups.includes(group))
                .map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez un groupe pour ajouter tous ses employés
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Recherche et Filtres
          </h2>
          {(searchTerm || selectedGroup) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Group Filter */}
          <div>
            <Label
              htmlFor="group-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filtrer par groupe
            </Label>
            <Select
              value={selectedGroup}
              onValueChange={handleGroupFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les groupes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes</SelectItem>
                {availableGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex items-end">
          {(searchTerm || (selectedGroup && selectedGroup !== "all")) && (
            <div className="text-sm text-gray-600">
              Filtres actifs:
              {searchTerm && (
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Recherche: "{searchTerm}"
                </span>
              )}
              {selectedGroup && selectedGroup !== "all" && (
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Groupe: {selectedGroup}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      {employersData && (
        <div className="text-sm text-gray-600">
          {employersData.count === 0 ? (
            "Aucun employé trouvé"
          ) : (
            <>
              {searchTerm || (selectedGroup && selectedGroup !== "all")
                ? "Résultats de la recherche: "
                : "Total: "}
              <strong>{employersData.count}</strong> employé(s)
              {selectedGroup &&
                selectedGroup !== "all" &&
                ` dans le groupe "${selectedGroup}"`}
              {searchTerm && ` pour "${searchTerm}"`}
            </>
          )}
        </div>
      )}

      {/* Employers List */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Chargement...</div>
        ) : employersData?.results?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || (selectedGroup && selectedGroup !== "all")
              ? "Aucun employé ne correspond aux critères de recherche"
              : "Aucun employé trouvé"}
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {employersData?.results?.map((employer: Employer) => (
              <div
                key={employer.id}
                className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedEmployers.includes(employer.id)}
                    onCheckedChange={() => handleEmployerToggle(employer)}
                  />
                  <div>
                    <div className="font-medium">
                      {employer.first_name && employer.last_name
                        ? `${employer.first_name} ${employer.last_name}`
                        : employer.username}
                    </div>
                    <div className="text-sm text-gray-600">
                      {employer.group && (
                        <Badge variant="outline" className="mr-2">
                          {employer.group}
                        </Badge>
                      )}
                      {employer.username}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    selectedEmployers.includes(employer.id)
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedEmployers.includes(employer.id)
                    ? "Sélectionné"
                    : "Non sélectionné"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {employersData && employersData.count > 10 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, employersData.count)} sur{" "}
            {employersData.count} employés
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={!employersData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={handleContinue}>Continuer</Button>
      </div>
    </div>
  );
};
