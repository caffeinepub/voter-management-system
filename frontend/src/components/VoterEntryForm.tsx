import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddVoter } from '../hooks/useAddVoter';
import { ExternalBlob } from '../backend';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import ImageUploadField from './ImageUploadField';
import DocumentUploadField from './DocumentUploadField';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  voterId: string;
  fatherHusbandName: string;
  houseNumber: string;
  address: string;
  gender: string;
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
}

interface VoterEntryFormProps {
  onSuccess?: () => void;
}

export default function VoterEntryForm({ onSuccess }: VoterEntryFormProps) {
  const { mutateAsync: addVoter, isPending } = useAddVoter();
  const [photo, setPhoto] = useState<ExternalBlob | null>(null);
  const [signature, setSignature] = useState<ExternalBlob | null>(null);
  const [documents, setDocuments] = useState<ExternalBlob[]>([]);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '', voterId: '', fatherHusbandName: '', houseNumber: '',
      address: '', gender: '', area: '', taluka: '', district: '',
      state: '', pincode: '', mobileNo: '', dob: '', caste: '',
      education: '', profession: '', office: '', politicalIdeology: '', comments: '',
    },
  });

  const genderValue = watch('gender');

  const onSubmit = async (data: FormData) => {
    try {
      // useAddVoter's AddVoterParams uses non-nullable strings for optional fields;
      // the hook itself converts empty strings to null before calling the actor.
      await addVoter({
        name: data.name,
        voterId: data.voterId,
        fatherHusbandName: data.fatherHusbandName,
        houseNumber: data.houseNumber ? BigInt(data.houseNumber) : null,
        address: data.address,
        gender: (data.gender as 'male' | 'female' | 'other') || 'other',
        area: data.area,
        taluka: data.taluka,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        mobileNo: data.mobileNo,
        dob: data.dob,
        caste: data.caste,
        education: data.education,
        profession: data.profession,
        office: data.office,
        politicalIdeology: data.politicalIdeology,
        comments: data.comments,
        photo: photo,
        signature: signature,
        educationalDocuments: documents,
      });

      toast.success('Voter registered successfully!');
      setSuccess(true);
      reset();
      setPhoto(null);
      setSignature(null);
      setDocuments([]);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to add voter');
    }
  };

  if (success) {
    return (
      <div className="p-12 text-center space-y-4">
        <CheckCircle className="w-16 h-16 mx-auto" style={{ color: 'var(--success)' }} />
        <h3 className="font-heading font-bold text-xl" style={{ color: 'var(--foreground)' }}>
          Voter Registered Successfully!
        </h3>
        <p style={{ color: 'var(--muted-foreground)' }}>Redirecting to voter list...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
      {/* Personal Details */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
          Personal Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="voterId">Voter ID *</Label>
            <Input
              id="voterId"
              placeholder="Enter voter ID"
              {...register('voterId', { required: 'Voter ID is required' })}
            />
            {errors.voterId && (
              <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.voterId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fatherHusbandName">Father/Husband Name</Label>
            <Input id="fatherHusbandName" placeholder="Father or husband name" {...register('fatherHusbandName')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" {...register('dob')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gender">Gender</Label>
            <Select value={genderValue} onValueChange={(v) => setValue('gender', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mobileNo">Mobile Number</Label>
            <Input id="mobileNo" placeholder="Mobile number" {...register('mobileNo')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="caste">Caste</Label>
            <Input id="caste" placeholder="Caste" {...register('caste')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="education">Education</Label>
            <Input id="education" placeholder="Education qualification" {...register('education')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profession">Profession</Label>
            <Input id="profession" placeholder="Profession" {...register('profession')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="office">Office</Label>
            <Input id="office" placeholder="Office" {...register('office')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="politicalIdeology">Political Ideology</Label>
            <Input id="politicalIdeology" placeholder="Political ideology" {...register('politicalIdeology')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="comments">Comments</Label>
          <Textarea id="comments" placeholder="Additional comments..." rows={3} {...register('comments')} />
        </div>
      </div>

      <Separator />

      {/* Address */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
          Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="houseNumber">House Number</Label>
            <Input id="houseNumber" type="number" placeholder="House number" {...register('houseNumber')} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="Full address" {...register('address')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="area">Area</Label>
            <Input id="area" placeholder="Area" {...register('area')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="taluka">Taluka</Label>
            <Input id="taluka" placeholder="Taluka" {...register('taluka')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="district">District</Label>
            <Input id="district" placeholder="District" {...register('district')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State</Label>
            <Input id="state" placeholder="State" {...register('state')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" placeholder="Pincode" {...register('pincode')} />
          </div>
        </div>
      </div>

      <Separator />

      {/* File Uploads */}
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--foreground)' }}>
          Documents & Photos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ImageUploadField
            label="Voter Photo"
            value={photo}
            onChange={setPhoto}
          />
          <ImageUploadField
            label="Signature"
            value={signature}
            onChange={setSignature}
          />
        </div>
        <DocumentUploadField
          label="Educational Documents"
          values={documents}
          onChange={setDocuments}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isPending}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Voter'
          )}
        </Button>
      </div>
    </form>
  );
}
