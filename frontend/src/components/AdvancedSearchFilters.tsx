import React, { useState } from 'react';
import { Voter, Gender } from '../backend';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterState {
  name: string;
  mobile: string;
  voterId: string;
  houseNumber: string;
  gender: string;
  caste: string;
  area: string;
  taluka: string;
  district: string;
  state: string;
}

interface AdvancedSearchFiltersProps {
  voters: Voter[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function AdvancedSearchFilters({ voters, filters, onFiltersChange }: AdvancedSearchFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const uniqueValues = (key: keyof Voter): string[] => {
    const vals = voters
      .map(v => v[key])
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '');
    return [...new Set(vals)].sort();
  };

  const update = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFiltersChange({
      name: '', mobile: '', voterId: '', houseNumber: '',
      gender: '', caste: '', area: '', taluka: '', district: '', state: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div
      className="rounded-xl border p-4 space-y-4"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Basic search row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <Input
            placeholder="Search by name..."
            value={filters.name}
            onChange={e => update('name', e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="relative flex-1">
          <Input
            placeholder="Search by Voter ID..."
            value={filters.voterId}
            onChange={e => update('voterId', e.target.value)}
          />
        </div>
        <div className="relative flex-1">
          <Input
            placeholder="Search by mobile..."
            value={filters.mobile}
            onChange={e => update('mobile', e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="whitespace-nowrap"
          >
            {expanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            More Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-1">
            <Label className="text-xs">Gender</Label>
            <Select value={filters.gender || 'all'} onValueChange={v => update('gender', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value={Gender.male}>Male</SelectItem>
                <SelectItem value={Gender.female}>Female</SelectItem>
                <SelectItem value={Gender.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Caste</Label>
            <Input
              placeholder="Filter caste..."
              value={filters.caste}
              onChange={e => update('caste', e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Area</Label>
            <Select value={filters.area || 'all'} onValueChange={v => update('area', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueValues('area').map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Taluka</Label>
            <Select value={filters.taluka || 'all'} onValueChange={v => update('taluka', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All talukas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueValues('taluka').map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">District</Label>
            <Select value={filters.district || 'all'} onValueChange={v => update('district', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueValues('district').map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">State</Label>
            <Select value={filters.state || 'all'} onValueChange={v => update('state', v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueValues('state').map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">House Number</Label>
            <Input
              placeholder="House no..."
              value={filters.houseNumber}
              onChange={e => update('houseNumber', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
