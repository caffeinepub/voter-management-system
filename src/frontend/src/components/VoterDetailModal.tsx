import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, User, MapPin, Phone, Calendar, Briefcase, FileText } from 'lucide-react';
import type { Voter } from '../backend';

interface VoterDetailModalProps {
  voter: Voter;
  onClose: () => void;
}

export default function VoterDetailModal({ voter, onClose }: VoterDetailModalProps) {
  const handleDownloadDocument = (doc: any, index: number) => {
    const url = doc.getDirectURL();
    const link = document.createElement('a');
    link.href = url;
    link.download = `educational-document-${index + 1}`;
    link.click();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Voter Details
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Complete information for {voter.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Photo and Signature Section */}
            {(voter.photo || voter.signature) && (
              <div className="flex gap-4 justify-center">
                {voter.photo && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">Photo</p>
                    <img
                      src={voter.photo.getDirectURL()}
                      alt="Voter Photo"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                {voter.signature && (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">Signature</p>
                    <img
                      src={voter.signature.getDirectURL()}
                      alt="Voter Signature"
                      className="w-32 h-32 object-contain rounded-lg border bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sr. No</p>
                  <p className="font-medium">{voter.srNo.toString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{voter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father/Husband Name</p>
                  <p className="font-medium">{voter.fatherHusbandName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <Badge variant="outline" className="capitalize">
                    {voter.gender || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {voter.dob || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Caste</p>
                  <p className="font-medium">{voter.caste || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact & Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Contact & Address
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {voter.mobileNo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">House Number</p>
                  <p className="font-medium">{voter.houseNumber?.toString() || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{voter.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-medium">{voter.area || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taluka</p>
                  <p className="font-medium">{voter.taluka || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="font-medium">{voter.district || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{voter.state || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pincode</p>
                  <p className="font-medium">{voter.pincode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voter ID</p>
                  <p className="font-medium">{voter.voterId.toString()}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Professional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Education</p>
                  <p className="font-medium">{voter.education || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profession</p>
                  <p className="font-medium">{voter.profession || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Office</p>
                  <p className="font-medium">{voter.office || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Political Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Political Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Political Ideology</p>
                  <p className="font-medium">{voter.politicalIdeology || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="font-medium whitespace-pre-wrap">{voter.comments || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Educational Documents */}
            {voter.educationalDocuments && voter.educationalDocuments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Educational Documents
                  </h3>
                  <div className="space-y-2">
                    {voter.educationalDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="text-sm font-medium">
                          Document {index + 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc, index)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
