# Specification

## Summary
**Goal:** Make all voter fields optional except Name and Voter ID to allow quick voter entry with minimal required information.

**Planned changes:**
- Update backend Voter type to make all fields optional except name and voterId
- Remove backend validation requirements for all fields except name and voterId in the addVoter function
- Remove required validation from all frontend form fields except Name and Voter ID in VoterEntryForm
- Keep all form fields visible but remove required indicators from optional fields

**User-visible outcome:** Users can submit the voter entry form with only Name and Voter ID filled in, while all other fields remain visible but optional. This enables faster data entry when complete voter information is not immediately available.
