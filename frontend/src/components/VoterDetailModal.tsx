import React from 'react';
import { Voter, Gender } from '../backend';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Download, User } from 'lucide-react';

interface VoterDetailModalProps {
  voter: Voter;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-sm" style={{ color: 'var(--foreground)' }}>{value ?? 'N/A'}</p>
    </div>
  );
}

function genderLabel(g?: Gender) {
  if (!g) return undefined;
  return g === Gender.male ? 'Male' : g === Gender.female ? 'Female' : 'Other';
}

export default function VoterDetailModal({ voter, onClose }: VoterDetailModalProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--card)' }}>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Voter Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo and basic info */}
          <div className="flex gap-4">
            {voter.photo ? (
              <img
                src={voter.photo.getDirectURL()}
                alt="Voter photo"
                className="w-24 h-24 rounded-lg object-cover border"
                style={{ borderColor: 'var(--border)' }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-lg flex items-center justify-center border"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                <User className="w-10 h-10" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                {voter.name}
              </h3>
              <p className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>
                ID: {voter.voterId}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Sr. No: {String(voter.srNo)}
              </p>
              {voter.gender && (
                <Badge variant="outline">{genderLabel(voter.gender)}</Badge>
              )}
            </div>
            {voter.signature && (
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Signature</p>
                <img
                  src={voter.signature.getDirectURL()}
                  alt="Signature"
                  className="w-20 h-12 object-contain border rounded"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Personal details */}
          <div>
            <h4 className="font-heading font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Personal Details
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Father/Husband Name" value={voter.fatherHusbandName} />
              <Field label="Date of Birth" value={voter.dob} />
              <Field label="Mobile No." value={voter.mobileNo} />
              <Field label="Caste" value={voter.caste} />
              <Field label="Education" value={voter.education} />
              <Field label="Profession" value={voter.profession} />
              <Field label="Office" value={voter.office} />
              <Field label="Political Ideology" value={voter.politicalIdeology} />
            </div>
            {voter.comments && (
              <div className="mt-3 space-y-0.5">
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Comments</p>
                <p className="text-sm" style={{ color: 'var(--foreground)' }}>{voter.comments}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Address */}
          <div>
            <h4 className="font-heading font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Address
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="House Number" value={voter.houseNumber !== undefined ? String(voter.houseNumber) : undefined} />
              <Field label="Address" value={voter.address} />
              <Field label="Area" value={voter.area} />
              <Field label="Taluka" value={voter.taluka} />
              <Field label="District" value={voter.district} />
              <Field label="State" value={voter.state} />
              <Field label="Pincode" value={voter.pincode} />
            </div>
          </div>

          {/* Documents */}
          {voter.educationalDocuments && voter.educationalDocuments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-heading font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
                  Educational Documents
                </h4>
                <div className="space-y-2">
                  {voter.educationalDocuments.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors text-sm"
                      style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
                    >
                      <Download className="w-4 h-4" />
                      Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
