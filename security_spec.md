# PhysioGo Security Specification & Access Control Model

## 1. Data Invariants
1. **User Identity & Role Separation**: A user document at `/users/{userId}` can only be created with their own `request.auth.uid`. Role cannot be self-elevated to 'admin'.
2. **Clinical Records Protection**: Clinical assessments, treatment sessions, and rehabilitation plans can only be written by registered physiotherapists who have an active patient relationship or explicit record access grant, or by the treating clinician.
3. **Patient Self-Ownership**: Patients can read their own clinical records (`patientId == request.auth.uid`) and manage their own `recordAccessGrants` and `therapistTransferRequests`.
4. **Physiotherapist Verification Gate**: Only physiotherapists with `verificationStatus == 'verified'` are publicly visible in directories or permitted to initiate clinical appointments and assessments.
5. **Therapist Handover Consent**: When transferring care, a receiving therapist can only access historical records if an active `RecordAccessGrant` exists for that patient and therapist ID.
6. **Immutable Timestamps**: `createdAt` timestamps cannot be forged or altered after creation.
7. **Equipment Marketplace**: Only the seller can edit or delete their equipment listing; any authenticated user can submit a rental or purchase request.
8. **Community Safety**: Community posts & comments can only be created by authenticated users; users cannot modify others' posts.

## 2. The Dirty Dozen Test Scenarios
1. **Unauthenticated Read of Clinical Assessment**: Anonymous user attempts to read `/clinicalAssessments/{id}`. (Must be REJECTED)
2. **Patient Privilege Escalation**: Patient attempts to set their role to 'admin' in `/users/{userId}`. (Must be REJECTED)
3. **Cross-Patient Assessment Peeking**: Patient A attempts to read Patient B's assessment without a grant. (Must be REJECTED)
4. **Forged Assessment Authorship**: Therapist A submits an assessment under Therapist B's UID. (Must be REJECTED)
5. **Silent Overwrite of Finalized Note**: Non-author therapist attempts to update a completed SOAP treatment session. (Must be REJECTED)
6. **Unauthorized Handover Access**: New therapist attempts to query patient records before patient signs `RecordAccessGrant`. (Must be REJECTED)
7. **Expired Grant Bypass**: Therapist attempts to read records using an expired or revoked grant. (Must be REJECTED)
8. **Public Directory Injection of Unverified Professional**: An unverified applicant attempts to set `verificationStatus = 'verified'` directly. (Must be REJECTED)
9. **Malicious Giant Payload**: An attacker injects a 2MB payload into `chiefComplaint`. (Must be REJECTED)
10. **Community Impersonation**: User posts a message with another user's `authorId`. (Must be REJECTED)
11. **Equipment Price Tampering**: Non-seller user attempts to modify an equipment listing's price. (Must be REJECTED)
12. **Appointment Hijacking**: Patient attempts to accept or decline an appointment for a therapist. (Must be REJECTED)
