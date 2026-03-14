import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



// Include authorization and blob storage
actor {
  include MixinStorage();

  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let voters = Map.empty<Text, Voter>();
  var nextVoterId = 1;

  public type UserProfile = {
    name : Text;
    role : Text; // Must be "Admin", "Supervisor", or "Karyakarta"
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Voter = {
    srNo : Nat; // Maps to id in frontend
    name : Text;
    voterId : Text;
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

  public type Gender = {
    #male;
    #female;
    #other;
  };

  public type TaskStatus = {
    #pending;
    #inProgress;
    #completed;
  };

  public type Role = {
    #admin;
    #supervisor;
    #karyakarta;
  };

  public type Task = {
    id : Nat;
    title : Text;
    description : Text;
    deadline : Text;
    status : TaskStatus;
    attachments : [Storage.ExternalBlob];
    assignedTo : Role;
    assignedBy : Principal;
  };

  let tasks = Map.empty<Nat, Task>();
  var nextTaskId = 1;

  // Helper Functions

  private func getCallerRole(caller : Principal) : ?Role {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case ("Admin") { ?#admin };
          case ("Supervisor") { ?#supervisor };
          case ("Karyakarta") { ?#karyakarta };
          case (_) { null };
        };
      };
      case (null) { null };
    };
  };

  private func hasRole(caller : Principal, requiredRole : Role) : Bool {
    switch (getCallerRole(caller)) {
      case (?role) {
        switch (requiredRole, role) {
          case (#admin, #admin) { true };
          case (#supervisor, #supervisor) { true };
          case (#supervisor, #admin) { true };
          case (#karyakarta, #karyakarta) { true };
          case (#karyakarta, #supervisor) { true };
          case (#karyakarta, #admin) { true };
          case (_, _) { false };
        };
      };
      case (null) { false };
    };
  };

  private func isCustomAdmin(caller : Principal) : Bool {
    switch (getCallerRole(caller)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  private func hasAnyRegisteredUser() : Bool {
    userProfiles.size() > 0;
  };

  // Role-Based User Profile Management

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    if (caller != user and not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  // Any authenticated user can create their own profile.
  // - If no profiles exist yet, the caller becomes the first Admin regardless of requested role.
  // - If profiles already exist, the caller may only register as "Supervisor" or "Karyakarta"
  //   (not "Admin"); only an existing admin can elevate someone to Admin via assignUserRole.
  // - Once a profile exists, the owner may update their name but cannot change their own role.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    if (profile.role != "Admin" and profile.role != "Supervisor" and profile.role != "Karyakarta") {
      Runtime.trap("Invalid role: Must be Admin, Supervisor, or Karyakarta");
    };

    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        // Existing profile: users can update their name but not their role.
        if (existingProfile.role != profile.role) {
          Runtime.trap("Unauthorized: Cannot change your own role. Contact an admin.");
        };
        userProfiles.add(caller, profile);
      };
      case (null) {
        // New profile registration.
        if (not hasAnyRegisteredUser()) {
          // First user ever: automatically granted Admin role.
          let adminProfile : UserProfile = {
            name = profile.name;
            role = "Admin";
          };
          userProfiles.add(caller, adminProfile);
        } else {
          // Subsequent users: may only self-register as Supervisor or Karyakarta.
          if (profile.role == "Admin") {
            Runtime.trap("Unauthorized: Cannot self-register as Admin. Contact an existing admin.");
          };
          userProfiles.add(caller, profile);
        };
      };
    };
  };

  // Admin-only: assign or change any user's profile (including role elevation to Admin).
  public shared ({ caller }) func assignUserRole(user : Principal, profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can assign roles");
    };

    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can assign user roles");
    };

    if (profile.role != "Admin" and profile.role != "Supervisor" and profile.role != "Karyakarta") {
      Runtime.trap("Invalid role: Must be Admin, Supervisor, or Karyakarta");
    };

    userProfiles.add(user, profile);
  };

  // Voter Management with CRUD

  public shared ({ caller }) func addVoter(
    name : Text,
    voterId : Text,
    fatherHusbandName : ?Text,
    houseNumber : ?Nat,
    address : ?Text,
    gender : ?Gender,
    area : ?Text,
    taluka : ?Text,
    district : ?Text,
    state : ?Text,
    pincode : ?Text,
    mobileNo : ?Text,
    dob : ?Text,
    caste : ?Text,
    education : ?Text,
    profession : ?Text,
    office : ?Text,
    politicalIdeology : ?Text,
    comments : ?Text,
    photo : ?Storage.ExternalBlob,
    signature : ?Storage.ExternalBlob,
    educationalDocuments : ?[Storage.ExternalBlob]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add voters");
    };

    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can add voters");
    };

    // Check for duplicate voterId
    switch (voters.get(voterId)) {
      case (?_) {
        Runtime.trap("Voter with this ID already exists");
      };
      case (null) {
        // Continue with adding voter
      };
    };

    let voter : Voter = {
      srNo = nextVoterId;
      name;
      voterId;
      fatherHusbandName;
      houseNumber;
      address;
      gender;
      area;
      taluka;
      district;
      state;
      pincode;
      mobileNo;
      dob;
      caste;
      education;
      profession;
      office;
      politicalIdeology;
      comments;
      photo;
      signature;
      educationalDocuments;
    };

    voters.add(voterId, voter);
    nextVoterId += 1;
  };

  public query ({ caller }) func getVoters() : async [Voter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view voter data");
    };

    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can view voters");
    };

    voters.values().toArray();
  };

  public query ({ caller }) func getVoterById(voterId : Text) : async ?Voter {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view voter data");
    };

    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can view voters");
    };

    voters.get(voterId);
  };

  // Filter voters by various parameters
  public query ({ caller }) func filterVoters(
    name : ?Text,
    mobileNo : ?Text,
    voterId : ?Text,
    houseNumber : ?Nat,
    gender : ?Gender,
    caste : ?Text,
    area : ?Text,
    taluka : ?Text,
    district : ?Text,
    state : ?Text
  ) : async [Voter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view voter data");
    };

    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can view voters");
    };

    voters.values().toArray().filter(
      func(voter) {
        switch (name) { case (?n) { if (not voter.name.contains(#text n)) { return false } }; case (null) {} };
        switch (mobileNo) {
          case (?m) {
            switch (voter.mobileNo) {
              case (?vMobile) { if (not vMobile.contains(#text m)) { return false } };
              case (null) { return false };
            };
          };
          case (null) {};
        };
        switch (voterId) { case (?id) { if (not voter.voterId.contains(#text id)) { return false } }; case (null) {} };
        switch (houseNumber) { case (?h) { if (voter.houseNumber != ?h) { return false } }; case (null) {} };
        switch (gender) { case (?g) { if (voter.gender != ?g) { return false } } ; case (null) {} };
        switch (caste) {
          case (?c) {
            switch (voter.caste) { case (?vCaste) { if (not vCaste.contains(#text c)) { return false } } ; case (null) { return false } };
          };
          case (null) {};
        };
        switch (area) { case (?a) { if (voter.area != ?a) { return false } }; case (null) {} };
        switch (taluka) { case (?t) { if (voter.taluka != ?t) { return false } }; case (null) {} };
        switch (district) { case (?d) { if (voter.district != ?d) { return false } }; case (null) {} };
        switch (state) { case (?s) { if (voter.state != ?s) { return false } }; case (null) {} };
        true;
      }
    );
  };

  // Update an existing voter record - requires at least Supervisor role
  public shared ({ caller }) func updateVoter(voterId : Text, updatedVoter : Voter) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update voter records");
    };

    if (not hasRole(caller, #supervisor)) {
      Runtime.trap("Unauthorized: Only users with Supervisor role or above can update voters");
    };

    switch (voters.get(voterId)) {
      case (?_) {
        voters.add(voterId, updatedVoter);
      };
      case (null) {
        Runtime.trap("Voter with ID does not exist");
      };
    };
  };

  // Delete a voter record - Admin only (destructive operation)
  public shared ({ caller }) func deleteVoter(voterId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete voter records");
    };

    if (not isCustomAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete voter records");
    };

    switch (voters.get(voterId)) {
      case (?_) {
        voters.remove(voterId);
      };
      case (null) {
        Runtime.trap("Voter with ID does not exist");
      };
    };
  };

  // Task Management

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };

    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can view tasks");
    };

    tasks.values().toArray();
  };

  public shared ({ caller }) func assignTask(
    title : Text,
    description : Text,
    deadline : Text,
    assignedTo : Role,
    attachments : [Storage.ExternalBlob]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can assign tasks");
    };

    let callerRole = getCallerRole(caller);

    switch (callerRole) {
      case (?#admin) {
        if (assignedTo != #supervisor) {
          Runtime.trap("Unauthorized: Admins can only assign tasks to Supervisors");
        };
      };
      case (?#supervisor) {
        if (assignedTo != #karyakarta) {
          Runtime.trap("Unauthorized: Supervisors can only assign tasks to Karyakartas");
        };
      };
      case (?#karyakarta) {
        Runtime.trap("Unauthorized: Karyakartas cannot assign tasks");
      };
      case (null) {
        Runtime.trap("Unauthorized: User must have a valid role to assign tasks");
      };
    };

    let task : Task = {
      id = nextTaskId;
      title;
      description;
      deadline;
      status = #pending;
      attachments;
      assignedTo;
      assignedBy = caller;
    };

    tasks.add(nextTaskId, task);
    nextTaskId += 1;
  };

  public shared ({ caller }) func updateTaskStatus(taskId : Nat, newStatus : TaskStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update task status");
    };

    switch (tasks.get(taskId)) {
      case (?task) {
        let callerRole = getCallerRole(caller);

        let isAssignedUser = switch (callerRole) {
          case (?role) { role == task.assignedTo };
          case (null) { false };
        };

        let isAssigner = caller == task.assignedBy;

        if (not (isAssignedUser or isAssigner)) {
          Runtime.trap("Unauthorized: Only assigned users or task creator can update task status");
        };

        let updatedTask : Task = {
          task with status = newStatus;
        };

        tasks.add(taskId, updatedTask);
      };
      case (null) {
        Runtime.trap("Task not found");
      };
    };
  };
};
