import { Voter, Gender } from '../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

interface VoterTableProps {
  voters: Voter[];
}

export default function VoterTable({ voters }: VoterTableProps) {
  // Debug logging
  useEffect(() => {
    console.log('[VoterTable] Received voters:', {
      count: voters?.length ?? 'null/undefined',
      isArray: Array.isArray(voters),
      voters: voters
    });
  }, [voters]);

  // Defensive check - ensure voters is always an array
  const safeVoters = Array.isArray(voters) ? voters : [];

  console.log('[VoterTable] Rendering with', safeVoters.length, 'voters');

  const getGenderBadge = (gender?: Gender) => {
    if (!gender) {
      return <Badge variant="secondary">N/A</Badge>;
    }
    if (gender === Gender.male) {
      return <Badge variant="default" className="bg-blue-500">Male</Badge>;
    } else if (gender === Gender.female) {
      return <Badge variant="default" className="bg-pink-500">Female</Badge>;
    } else {
      return <Badge variant="secondary">Other</Badge>;
    }
  };

  // Always render table structure, even when empty
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Sr. No</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>House No.</TableHead>
            <TableHead>Voter ID</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Taluka</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Caste</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeVoters.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No voters found matching your filters
              </TableCell>
            </TableRow>
          ) : (
            safeVoters.map((voter) => (
              <TableRow key={voter.srNo.toString()}>
                <TableCell className="font-medium">{voter.srNo.toString()}</TableCell>
                <TableCell className="font-medium">{voter.name}</TableCell>
                <TableCell>{voter.houseNumber?.toString() || 'N/A'}</TableCell>
                <TableCell>{voter.voterId.toString()}</TableCell>
                <TableCell>{voter.mobileNo || 'N/A'}</TableCell>
                <TableCell>{voter.area || 'N/A'}</TableCell>
                <TableCell>{voter.taluka || 'N/A'}</TableCell>
                <TableCell>{getGenderBadge(voter.gender)}</TableCell>
                <TableCell>{voter.caste || 'N/A'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
