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
import Migration "migration";

// Use migration module to transform old actor state to new one.
(with migration = Migration.run)
actor {
  include MixinStorage();

  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let voters = Map.empty<Nat, Voter>();
  var nextVoterId = 1;

  public type UserProfile = {
    name : Text;
    role : Text; // "Admin", "Supervisor", or "Karyakarta"
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Voter = {
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

  public type Role = {
    #admin;
    #supervisor;
    #karyakarta;
  };

  let tasks = Map.empty<Nat, Task>();
  var nextTaskId = 1;

  // Helper function to get user's application role from profile
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

  // Helper function to check if caller has required role
  private func hasRole(caller : Principal, requiredRole : Role) : Bool {
    switch (getCallerRole(caller)) {
      case (?role) {
        switch (requiredRole, role) {
          case (#admin, #admin) { true };
          case (#supervisor, #supervisor) { true };
          case (#supervisor, #admin) { true }; // Admin can act as supervisor
          case (#karyakarta, #karyakarta) { true };
          case (#karyakarta, #supervisor) { true }; // Supervisor can act as karyakarta
          case (#karyakarta, #admin) { true }; // Admin can act as karyakarta
          case (_, _) { false };
        };
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or must be admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    // Check if user is trying to change their role
    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        // If role is being changed, only admins can do it
        if (existingProfile.role != profile.role) {
          if (not AccessControl.isAdmin(accessControlState, caller)) {
            Runtime.trap("Unauthorized: Only admins can change user roles");
          };
        };
      };
      case (null) {
        // New profile - only admins can set roles
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only admins can assign roles to new profiles");
        };
      };
    };

    // Validate role value
    if (profile.role != "Admin" and profile.role != "Supervisor" and profile.role != "Karyakarta") {
      Runtime.trap("Invalid role: Must be Admin, Supervisor, or Karyakarta");
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func assignUserRole(user : Principal, profile : UserProfile) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can assign user roles");
    };

    // Validate role value
    if (profile.role != "Admin" and profile.role != "Supervisor" and profile.role != "Karyakarta") {
      Runtime.trap("Invalid role: Must be Admin, Supervisor, or Karyakarta");
    };

    userProfiles.add(user, profile);
  };

  public shared ({ caller }) func addVoter(
    name : Text,
    voterId : Nat,
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

    // Verify caller has at least Karyakarta role
    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can add voters");
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

    voters.add(nextVoterId, voter);
    nextVoterId += 1;
  };

  public query ({ caller }) func getVoters() : async [Voter] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view voter data");
    };

    // Verify caller has at least Karyakarta role
    if (not hasRole(caller, #karyakarta)) {
      Runtime.trap("Unauthorized: Only users with Karyakarta role or above can view voters");
    };

    voters.values().toArray();
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };

    // Verify caller has at least Karyakarta role
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

    // Verify assignment permissions based on role hierarchy
    switch (callerRole) {
      case (?#admin) {
        // Admin can only assign to Supervisors
        if (assignedTo != #supervisor) {
          Runtime.trap("Unauthorized: Admins can only assign tasks to Supervisors");
        };
      };
      case (?#supervisor) {
        // Supervisor can only assign to Karyakartas
        if (assignedTo != #karyakarta) {
          Runtime.trap("Unauthorized: Supervisors can only assign tasks to Karyakartas");
        };
      };
      case (?#karyakarta) {
        // Karyakartas cannot assign tasks
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

        // Verify caller is assigned to this task or is the assigner
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
