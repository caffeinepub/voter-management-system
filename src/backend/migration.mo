import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  // Old Voter record definition
  type OldVoter = {
    srNo : Nat;
    name : Text;
    fatherHusbandName : Text;
    houseNumber : Nat;
    voterId : Nat;
    address : Text;
    gender : Gender;
    area : Text;
    taluka : Text;
    district : Text;
    state : Text;
    pincode : Text;
    mobileNo : Text;
    dob : Text;
    caste : Text;
    education : Text;
    profession : Text;
    office : Text;
    politicalIdeology : Text;
    comments : Text;
    photo : ?Storage.ExternalBlob;
    signature : ?Storage.ExternalBlob;
    educationalDocuments : [Storage.ExternalBlob];
  };

  type Gender = {
    #male;
    #female;
    #other;
  };

  // Old actor state type
  type OldActor = {
    voters : Map.Map<Nat, OldVoter>;
    nextVoterId : Nat;
    userProfiles : Map.Map<Principal, { name : Text; role : Text }>;
    tasks : Map.Map<Nat, { id : Nat; title : Text; description : Text; deadline : Text; status : { #pending; #inProgress; #completed }; attachments : [Storage.ExternalBlob]; assignedTo : { #admin; #supervisor; #karyakarta }; assignedBy : Principal }>;
    nextTaskId : Nat;
  };

  // New Voter record definition
  type NewVoter = {
    srNo : Nat;
    name : Text;
    voterId : Nat;
    fatherHusbandName : ?Text;
    houseNumber : ?Nat;
    address : ?Text;
    gender : ?Gender;
    area : ?Text;
    taluka : ?Text;
    district : ?Text;
    state : ?Text;
    pincode : ?Text;
    mobileNo : ?Text;
    dob : ?Text;
    caste : ?Text;
    education : ?Text;
    profession : ?Text;
    office : ?Text;
    politicalIdeology : ?Text;
    comments : ?Text;
    photo : ?Storage.ExternalBlob;
    signature : ?Storage.ExternalBlob;
    educationalDocuments : ?[Storage.ExternalBlob];
  };

  // New actor state type
  type NewActor = {
    voters : Map.Map<Nat, NewVoter>;
    nextVoterId : Nat;
    userProfiles : Map.Map<Principal, { name : Text; role : Text }>;
    tasks : Map.Map<Nat, { id : Nat; title : Text; description : Text; deadline : Text; status : { #pending; #inProgress; #completed }; attachments : [Storage.ExternalBlob]; assignedTo : { #admin; #supervisor; #karyakarta }; assignedBy : Principal }>;
    nextTaskId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newVoters = old.voters.map<Nat, OldVoter, NewVoter>(
      func(_id, oldVoter) {
        {
          srNo = oldVoter.srNo;
          name = oldVoter.name;
          voterId = oldVoter.voterId;
          fatherHusbandName = ?oldVoter.fatherHusbandName;
          houseNumber = ?oldVoter.houseNumber;
          address = ?oldVoter.address;
          gender = ?oldVoter.gender;
          area = ?oldVoter.area;
          taluka = ?oldVoter.taluka;
          district = ?oldVoter.district;
          state = ?oldVoter.state;
          pincode = ?oldVoter.pincode;
          mobileNo = ?oldVoter.mobileNo;
          dob = ?oldVoter.dob;
          caste = ?oldVoter.caste;
          education = ?oldVoter.education;
          profession = ?oldVoter.profession;
          office = ?oldVoter.office;
          politicalIdeology = ?oldVoter.politicalIdeology;
          comments = ?oldVoter.comments;
          photo = oldVoter.photo;
          signature = oldVoter.signature;
          educationalDocuments = if (oldVoter.educationalDocuments.size() > 0) { ?oldVoter.educationalDocuments } else { null };
        };
      }
    );
    { old with voters = newVoters };
  };
};
