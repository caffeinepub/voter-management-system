import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import type { Voter } from '../backend';

interface AdvancedSearchFiltersProps {
  voters: Voter[];
  onFilteredVotersChange: (filtered: Voter[]) => void;
}

export default function AdvancedSearchFilters({ voters, onFilteredVotersChange }: AdvancedSearchFiltersProps) {
  const [searchName, setSearchName] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [searchHouseNumber, setSearchHouseNumber] = useState('');
  const [searchVoterId, setSearchVoterId] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterCaste, setFilterCaste] = useState<string>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterTaluka, setFilterTaluka] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');

  // Extract unique values for dropdowns
  const uniqueCastes = Array.from(new Set(voters.map(v => v.caste).filter(Boolean))) as string[];
  const uniqueAreas = Array.from(new Set(voters.map(v => v.area).filter(Boolean))) as string[];
  const uniqueTalukas = Array.from(new Set(voters.map(v => v.taluka).filter(Boolean))) as string[];
  const uniqueDistricts = Array.from(new Set(voters.map(v => v.district).filter(Boolean))) as string[];
  const uniqueStates = Array.from(new Set(voters.map(v => v.state).filter(Boolean))) as string[];

  // Apply filters
  useEffect(() => {
    let filtered = [...voters];

    if (searchName) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchMobile) {
      filtered = filtered.filter(v =>
        v.mobileNo?.includes(searchMobile)
      );
    }

    if (searchHouseNumber) {
      filtered = filtered.filter(v =>
        v.houseNumber?.toString().includes(searchHouseNumber)
      );
    }

    if (searchVoterId) {
      filtered = filtered.filter(v =>
        v.voterId.toString().includes(searchVoterId)
      );
    }

    if (filterGender !== 'all') {
      filtered = filtered.filter(v => v.gender === filterGender);
    }

    if (filterCaste !== 'all') {
      filtered = filtered.filter(v => v.caste === filterCaste);
    }

    if (filterArea !== 'all') {
      filtered = filtered.filter(v => v.area === filterArea);
    }

    if (filterTaluka !== 'all') {
      filtered = filtered.filter(v => v.taluka === filterTaluka);
    }

    if (filterDistrict !== 'all') {
      filtered = filtered.filter(v => v.district === filterDistrict);
    }

    if (filterState !== 'all') {
      filtered = filtered.filter(v => v.state === filterState);
    }

    onFilteredVotersChange(filtered);
  }, [
    searchName,
    searchMobile,
    searchHouseNumber,
    searchVoterId,
    filterGender,
    filterCaste,
    filterArea,
    filterTaluka,
    filterDistrict,
    filterState,
    voters,
    onFilteredVotersChange,
  ]);

  const handleClearFilters = () => {
    setSearchName('');
    setSearchMobile('');
    setSearchHouseNumber('');
    setSearchVoterId('');
    setFilterGender('all');
    setFilterCaste('all');
    setFilterArea('all');
    setFilterTaluka('all');
    setFilterDistrict('all');
    setFilterState('all');
  };

  const hasActiveFilters =
    searchName ||
    searchMobile ||
    searchHouseNumber ||
    searchVoterId ||
    filterGender !== 'all' ||
    filterCaste !== 'all' ||
    filterArea !== 'all' ||
    filterTaluka !== 'all' ||
    filterDistrict !== 'all' ||
    filterState !== 'all';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Search & Filters</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Text Search Fields */}
            <div className="space-y-2">
              <Label htmlFor="searchName">Name</Label>
              <Input
                id="searchName"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchMobile">Mobile Number</Label>
              <Input
                id="searchMobile"
                placeholder="Search by mobile..."
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchHouseNumber">House Number</Label>
              <Input
                id="searchHouseNumber"
                placeholder="Search by house no..."
                value={searchHouseNumber}
                onChange={(e) => setSearchHouseNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchVoterId">Voter ID</Label>
              <Input
                id="searchVoterId"
                placeholder="Search by voter ID..."
                value={searchVoterId}
                onChange={(e) => setSearchVoterId(e.target.value)}
              />
            </div>

            {/* Dropdown Filters */}
            <div className="space-y-2">
              <Label htmlFor="filterGender">Gender</Label>
              <Select value={filterGender} onValueChange={setFilterGender}>
                <SelectTrigger id="filterGender">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterCaste">Caste</Label>
              <Select value={filterCaste} onValueChange={setFilterCaste}>
                <SelectTrigger id="filterCaste">
                  <SelectValue placeholder="All Castes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Castes</SelectItem>
                  {uniqueCastes.map((caste) => (
                    <SelectItem key={caste} value={caste}>
                      {caste}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterArea">Area</Label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger id="filterArea">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {uniqueAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterTaluka">Taluka</Label>
              <Select value={filterTaluka} onValueChange={setFilterTaluka}>
                <SelectTrigger id="filterTaluka">
                  <SelectValue placeholder="All Talukas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Talukas</SelectItem>
                  {uniqueTalukas.map((taluka) => (
                    <SelectItem key={taluka} value={taluka}>
                      {taluka}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterDistrict">District</Label>
              <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                <SelectTrigger id="filterDistrict">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {uniqueDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterState">State</Label>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger id="filterState">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
