import React from 'react';
import { Voter, Gender } from '../backend';
import { Skeleton } from './ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table';

interface VoterTableProps {
  voters: Voter[];
  isLoading?: boolean;
  onRowClick?: (voter: Voter) => void;
}

function GenderBadge({ gender }: { gender?: Gender }) {
  if (!gender) return <span style={{ color: 'var(--muted-foreground)' }}>N/A</span>;
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    [Gender.male]: { bg: 'oklch(0.85 0.08 220)', text: 'oklch(0.35 0.12 220)', label: 'Male' },
    [Gender.female]: { bg: 'oklch(0.90 0.08 340)', text: 'oklch(0.40 0.12 340)', label: 'Female' },
    [Gender.other]: { bg: 'oklch(0.88 0.08 145)', text: 'oklch(0.38 0.12 145)', label: 'Other' },
  };
  const s = styles[gender] ?? { bg: 'var(--muted)', text: 'var(--muted-foreground)', label: gender };
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

export default function VoterTable({ voters, isLoading, onRowClick }: VoterTableProps) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow style={{ background: 'var(--muted)' }}>
              <TableHead className="font-semibold">Sr. No</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Voter ID</TableHead>
              <TableHead className="font-semibold">House No.</TableHead>
              <TableHead className="font-semibold">Mobile</TableHead>
              <TableHead className="font-semibold">Area</TableHead>
              <TableHead className="font-semibold">Taluka</TableHead>
              <TableHead className="font-semibold">Gender</TableHead>
              <TableHead className="font-semibold">Caste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : voters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                  No voters found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              voters.map((voter) => (
                <TableRow
                  key={voter.voterId}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onRowClick?.(voter)}
                >
                  <TableCell className="font-mono text-sm">{String(voter.srNo)}</TableCell>
                  <TableCell className="font-medium">{voter.name}</TableCell>
                  <TableCell className="font-mono text-sm">{voter.voterId}</TableCell>
                  <TableCell>{voter.houseNumber !== undefined ? String(voter.houseNumber) : 'N/A'}</TableCell>
                  <TableCell>{voter.mobileNo ?? 'N/A'}</TableCell>
                  <TableCell>{voter.area ?? 'N/A'}</TableCell>
                  <TableCell>{voter.taluka ?? 'N/A'}</TableCell>
                  <TableCell><GenderBadge gender={voter.gender} /></TableCell>
                  <TableCell>{voter.caste ?? 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
