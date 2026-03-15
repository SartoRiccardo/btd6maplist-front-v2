/**
 * Permission string constants.
 *
 * Access pattern: `permissions.<resource>.<action>`
 * e.g. `permissions.completionSubmission.create`
 */

export const permissions = {
  user: {
    editSelf: 'edit:self',
    ban: 'ban:user',
    create: 'create:user',
  },
  map: {
    create: 'create:map',
    edit: 'edit:map',
    delete: 'delete:map',
  },
  mapSubmission: {
    create: 'create:map_submission',
    edit: 'edit:map_submission',
    delete: 'delete:map_submission',
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
  config: {
    edit: 'edit:config',
  },
  formatPresentation: {
    edit: 'edit:format_presentation',
  },
  achievementRoles: {
    edit: 'edit:achievement_roles',
  },
  retroMap: {
    create: 'create:retro_map',
    edit: 'edit:retro_map',
    delete: 'delete:retro_map',
  },
} as const;
