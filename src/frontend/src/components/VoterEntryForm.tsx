import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddVoter } from '../hooks/useAddVoter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import DocumentUploadField from './DocumentUploadField';
import { ExternalBlob } from '../backend';

type VoterFormData = {
  name: string;
  fatherHusbandName: string;
  houseNumber: string;
  voterId: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  area: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  mobileNo: string;
  dob: string;
  caste: string;
  education: string;
  profession: string;
  office: string;
  politicalIdeology: string;
  comments: string;
};

export default function VoterEntryForm() {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<VoterFormData>();
  const { mutate: addVoter, isPending } = useAddVoter();
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [photo, setPhoto] = useState<ExternalBlob | null>(null);
  const [signature, setSignature] = useState<ExternalBlob | null>(null);
  const [documents, setDocuments] = useState<ExternalBlob[]>([]);

  const comments = watch('comments') || '';
  const remainingChars = 500 - comments.length;

  const onSubmit = (data: VoterFormData) => {
    if (comments.length > 500) {
      toast.error('Comments must be 500 characters or less');
      return;
    }

    addVoter(
      {
        ...data,
        houseNumber: data.houseNumber ? BigInt(data.houseNumber) : null,
        voterId: BigInt(data.voterId || 0),
        gender,
        photo,
        signature,
        educationalDocuments: documents,
      },
      {
        onSuccess: () => {
          toast.success('Voter added successfully!');
          reset();
          setGender('male');
          setPhoto(null);
          setSignature(null);
          setDocuments([]);
        },
        onError: (error) => {
          toast.error(`Failed to add voter: ${error.message}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Personal Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter full name"
              disabled={isPending}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatherHusbandName">
              Father/Husband Name
            </Label>
            <Input
              id="fatherHusbandName"
              {...register('fatherHusbandName')}
              placeholder="Enter father/husband name"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="houseNumber">
              House Number
            </Label>
            <Input
              id="houseNumber"
              type="text"
              {...register('houseNumber')}
              placeholder="Enter house number"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voterId">
              Voter ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="voterId"
              type="text"
              {...register('voterId', { required: 'Voter ID is required' })}
              placeholder="Enter voter ID"
              disabled={isPending}
            />
            {errors.voterId && <p className="text-sm text-destructive">{errors.voterId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender
            </Label>
            <Select value={gender} onValueChange={(value: 'male' | 'female' | 'other') => setGender(value)} disabled={isPending}>
              <SelectTrigger id="gender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              {...register('dob')}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNo">
              Mobile Number
            </Label>
            <Input
              id="mobileNo"
              {...register('mobileNo', { 
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit mobile number'
                }
              })}
              placeholder="10-digit mobile number"
              disabled={isPending}
            />
            {errors.mobileNo && <p className="text-sm text-destructive">{errors.mobileNo.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caste">
              Caste
            </Label>
            <Input
              id="caste"
              {...register('caste')}
              placeholder="Enter caste"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Address Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">
              Address
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Enter complete address"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">
              Area (Landmark)
            </Label>
            <Input
              id="area"
              {...register('area')}
              placeholder="Enter area/landmark"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taluka">
              Taluka
            </Label>
            <Input
              id="taluka"
              {...register('taluka')}
              placeholder="Enter taluka"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">
              District
            </Label>
            <Input
              id="district"
              {...register('district')}
              placeholder="Enter district"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State
            </Label>
            <Input
              id="state"
              {...register('state')}
              placeholder="Enter state"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">
              Pincode
            </Label>
            <Input
              id="pincode"
              {...register('pincode', { 
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'Please enter a valid 6-digit pincode'
                }
              })}
              placeholder="6-digit pincode"
              disabled={isPending}
            />
            {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Professional Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="education">
              Education
            </Label>
            <Input
              id="education"
              {...register('education')}
              placeholder="Enter education qualification"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">
              Profession
            </Label>
            <Input
              id="profession"
              {...register('profession')}
              placeholder="Enter profession"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="office">
              Office
            </Label>
            <Input
              id="office"
              {...register('office')}
              placeholder="Enter office/workplace"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="politicalIdeology">
              Political Ideology
            </Label>
            <Input
              id="politicalIdeology"
              {...register('politicalIdeology')}
              placeholder="Enter political ideology"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Documents</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <ImageUploadField
            label="Photo"
            value={photo}
            onChange={setPhoto}
            disabled={isPending}
          />
          <ImageUploadField
            label="Signature"
            value={signature}
            onChange={setSignature}
            disabled={isPending}
          />
          <div className="md:col-span-2">
            <DocumentUploadField
              label="Educational Documents"
              value={documents}
              onChange={setDocuments}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">Additional Information</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="comments">Comments</Label>
            <span className={`text-sm ${remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
          <Textarea
            id="comments"
            {...register('comments')}
            placeholder="Enter any additional comments (max 500 characters)"
            rows={4}
            disabled={isPending}
            className={remainingChars < 0 ? 'border-destructive' : ''}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || remainingChars < 0} size="lg" className="min-w-[200px]">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Voter
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
