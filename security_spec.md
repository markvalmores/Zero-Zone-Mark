# Security Specification - Zero Zone Mark

## Data Invariants
1.  **Authentication**: Every operation requires the user to be authenticated.
2.  **Privacy**: Users can only read/write their own profile and work sessions.
3.  **Privilege**: Only admins can read/write other users' data, and export data.
4.  **Integrity**: Work sessions must be linked to a valid user UID.
5.  **Registration**: New users must provide a valid, unused registration code.

## The "Dirty Dozen" Payloads
1.  `users`: Attempt to create a user with `role: 'admin'` as a new user.
2.  `users`: Attempt to modify `role` of an existing user.
3.  `workSessions`: Attempt to create a document with `uid: 'wrong-uid'` for the current user.
4.  `workSessions`: Attempt to read all work sessions as a non-admin.
5.  `workSessions`: Attempt to delete a work session owned by another user.
6.  `registrationCodes`: Attempt to claim an already `used: true` code.
7.  `registrationCodes`: Attempt to add a random code not in the `registrationCodes` list.
8.  `users`: Attempt to set `idPictureUrl` to an invalid URL format.
9.  `workSessions`: Attempt to update `clockInTime` after creating the session.
10. `workSessions`: Attempt to create a session for the future.
11. `users`: Attempt to read another user's profile as a worker.
12. `workSessions`: Attempt to create a work session without a required field (`dayWorked`).
