import React from 'react';
import VoterEntryForm from '../components/VoterEntryForm';
import { UserPlus } from 'lucide-react';

interface VoterEntryProps {
  onSuccess?: () => void;
}

export default function VoterEntry({ onSuccess }: VoterEntryProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-heading font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <UserPlus className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          Voter Entry
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Register a new voter in the system
        </p>
      </div>

      <div
        className="rounded-xl border shadow-sm"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <VoterEntryForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}
