import VoterEntryForm from '../components/VoterEntryForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function VoterEntry() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Voter</h1>
          <p className="text-muted-foreground mt-1">Enter complete voter information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voter Information Form</CardTitle>
          <CardDescription>All fields marked with * are required</CardDescription>
        </CardHeader>
        <CardContent>
          <VoterEntryForm />
        </CardContent>
      </Card>
    </div>
  );
}
