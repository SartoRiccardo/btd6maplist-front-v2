/**
 * Permission string constants.
 *
 * Access pattern: `permissions.<resource>.<action>`
 * e.g. `permissions.completionSubmission.create`
 */

export const permissions = {
  map: {
    create: 'create:map',
  },
  mapSubmission: {
    create: 'create:map_submission',
  },
  completion: {
    create: 'create:completion',
    edit: 'edit:completion',
    delete: 'delete:completion',
  },
  completionSubmission: {
    create: 'create:completion_submission',
    requireRecording: 'require:completion_submission:recording',
  },
} as const;
