const GoogleGenAI_Mock = function () {
  let getCalled = false;

  return {
    batches: {
      create: async () => ({
        name: 'projects/mock/locations/mock/batchPredictionJobs/123',
        state: 'JOB_STATE_PENDING',
      }),

      get: async () => {
        // First call returns running, second call returns success
        if (!getCalled) {
          getCalled = true;
          return {
            name: 'projects/mock/locations/mock/batchPredictionJobs/123',
            state: 'JOB_STATE_RUNNING',
          };
        }

        return {
          name: 'projects/mock/locations/mock/batchPredictionJobs/123',
          state: 'JOB_STATE_SUCCEEDED',
        };
      },
    },
  };
};

module.exports = {
  GoogleGenAI_Mock,
};
