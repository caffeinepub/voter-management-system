import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Gender, ExternalBlob } from '../backend';

interface AddVoterParams {
  name: string;
  fatherHusbandName: string;
  houseNumber: bigint | null;
  voterId: bigint;
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
  photo: ExternalBlob | null;
  signature: ExternalBlob | null;
  educationalDocuments: ExternalBlob[];
}

export function useAddVoter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddVoterParams) => {
      if (!actor) throw new Error('Actor not available');

      const genderEnum: Gender = 
        params.gender === 'male' ? Gender.male :
        params.gender === 'female' ? Gender.female :
        Gender.other;

      return actor.addVoter(
        params.name,
        params.voterId,
        params.fatherHusbandName || null,
        params.houseNumber,
        params.address || null,
        genderEnum,
        params.area || null,
        params.taluka || null,
        params.district || null,
        params.state || null,
        params.pincode || null,
        params.mobileNo || null,
        params.dob || null,
        params.caste || null,
        params.education || null,
        params.profession || null,
        params.office || null,
        params.politicalIdeology || null,
        params.comments || null,
        params.photo,
        params.signature,
        params.educationalDocuments.length > 0 ? params.educationalDocuments : null
      );
    },
    onSuccess: () => {
      // Invalidate and refetch voters query to ensure dashboard updates
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
}
