import appLogger from 'utils/appLogger';

const devlog = appLogger({ tag: 'roleHelper' });

export const roles = {
  unauthorized: 'unauthorized',
  viewer: 'viewer',
  tester: 'tester',
  developer: 'developer',
  operator: 'operator',
  admin: 'admin',
  internaladmin: 'internaladmin'
};

export const adminRoleConfig = {
  uploadNewTranscript: true,
  runNewAnalysis: true,
  deleteTranscripts: true,
  updateTranscripts: true,
  deleteAnalysis: true,
  updateAnalysis: true,
  markAsComplete: true,
  addToConversations: true,
  addToAnswers: true,
  markAsReviewed: true,
  editPotentialIntentsNames: true,
};

export const viewerRoleConfig = {
  uploadNewTranscript: false,
  runNewAnalysis: false,
  deleteTranscripts: false,
  updateTranscripts: false,
  deleteAnalysis: false,
  updateAnalysis: false,
  markAsComplete: false,
  addToConversations: false,
  addToAnswers: false,
  markAsReviewed: false,
  editPotentialIntentsNames: false,
};
export const updateRoleConfig = (role) => {
  try {
    let roleConfig;
    switch (role) {
      case roles.unauthorized:
      case roles.viewer:
        roleConfig = viewerRoleConfig;
        break;
      case roles.tester:
      case roles.developer:
      case roles.operator:
      case roles.admin:
      case roles.internaladmin:
        roleConfig = adminRoleConfig;
        break;
      default:
        roleConfig = viewerRoleConfig;
    }
    return roleConfig;
  } catch (err) {
    devlog.warn(err);
  }
  return viewerRoleConfig;
};
