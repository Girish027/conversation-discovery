const en = {

  // SERVER MESSAGES
  DUPLICATE_PROJECT_NAME: 'Duplicate transcript name. Please provide a unique name.',
  INVALID_FILE_COLUMNS: 'Columns are not in the right format. Please refer to the template.',
  INVALID_FILE_SIZE: 'File is too large. Please upload 300 MB or less',
  PROJECT_ALREADY_EXISTS: 'Transcript already exist. Please provide a unique name.',
  CAA_ALREADY_EXISTS: 'CAA_ALREADY_EXISTS',
  CAA_DOES_NOT_EXISTS: 'CAA_DOES_NOT_EXIST',
  BODY_PARAMETERS_MISSING: 'BODY_PARAMETERS_MISSING',
  RUN_ALREADY_EXISTS: 'Duplicate analysis name. Please provide a unique name.',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  SYSTEM_PROJECT_RENAME: 'You need to complete the already in review project first before starting to reviewing this one',

  // NOTIFICATIONS
  NOTIFICATIONS: {
    runCreated: (runName) => `Analysis ${runName} has been successfully created`,
    runDeleted: (runName) => `Analysis ${runName} has been successfully deleted`,
    runEdited: (runName) => `Analysis ${runName} has been successfully updated`,
    projectCreated: (projectName) => `Transcript ${projectName} has been successfully created`,
    projectDeleted: (projectName) => `Transcript ${projectName} has been successfully deleted`,
    projectEdited: (projectName) => `Transcript ${projectName} has been successfully updated`,
    clusterEdited: (clusterName) => `Cluster ${clusterName} has been successfully updated`,
    addedToFaq: (title) => `FAQ ${title} has been successfully assigned to the selected conversations`,
    addedToBotCreate: (nodeName) => `New Intent '${nodeName}' has been created and mapped to the chosen utterances.`,
    addedToBotUpdate: (nodeName) => `Intent '${nodeName}' has been updated with the chosen utterances`,
    projectSysEdited: (projectName) => `Transcript '${projectName}' has been moved to REVIEW state`,
  },

  ERROR_MESSAGES: {
    maxProjectNumberExceeded: (maxNum) => `You have exceeded the number of allowed limits of ${maxNum} transcripts! please remove existing transcripts to free up some space.`,
    maxRunNumberExceeded: (maxNum) => `You have exceeded the number of allowed limits of ${maxNum} analysis! please remove existing analysis to free up some space.`,
    clientInfoNotAvailable: 'The client configuration is not available.',
    internalServerError: 'Internal server error. Please try again later',
  },

  WARNING_MESSAGE: {
    deleteTranscript: 'This transcript will be deleted forever. Are you sure you want to delete this item?',
  },

  PROJECT: {
    cancelHeader: 'Cancel this transcript?',
    cancelMessage: 'All the information you have entered up until this point will be lost. Are you sure you want to cancel the transcript?',
  },

  RUN: {
    cancelHeader: 'Cancel this analysis?',
    cancelMessage: 'All the information you have entered up until this point will be lost. Are you sure you want to cancel the analysis?',
    TOOLTIP: {
      custers: 'The number of topic clusters to aim for – In case the default analysis lumps too many intents in each topic cluster, use a higher cluster count. On the other hand, if similar intents are repeatedly scattered in several topic clusters, reduce the cluster count.',
      turns: 'The Number of user-turns to use – User intents are not always obvious in the first user turns. Increase this turn count may improve the odds of finding useful intents in the transcripts. But bringing in too many user turns may add noise to the intent discovery process. We recommend that the number of user-turns stays between 2 and 3.',
      stopwords: 'Custom stop words to ignore – In natural language process, useless words (such as “the”, “of”) are referred to as stop words. Common stop words are already taken care of by the tool. But you can provide the list of client-specific stop words that you want the tool to ignore in the analysis. For example, brand names are good candidates to be added as stop words for better results. Clusters – the maximum number of transcript clusters to generate.',
      watch: 'In the natural language process, insignificant words (such as "of", "the" etc) are referred to as Stop Words. These stop words are generally ignored while creating an analysis. Keywords that need to be considered for clustering and have to be exempted from being treated as ’Stop Words’ are provided here.'
    },
  },
  MODAL_MESSAGES: {
    markAsComplete: 'Mark Analysis as Complete ?',
    deleteTranscriptOnComplete: 'This transcript results will be deleted forever, if all analysis are Marked As Complete for this SYSTEM project . Do you wish to proceed?',
    runComplete: 'This run is marked as complete',
  },
  ADD_TO_CONVERSATIONS: {
    noteTitle: 'Note: ',
    noteMessage: 'Please rebuild the bot in Conversation Builder for updated utterances to take into effect.'
  }
};

export default en;
