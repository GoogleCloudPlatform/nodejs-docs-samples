const DLP = require('@google-cloud/dlp');
const sinon = require('sinon');

/**
  Mock data for unit test cases.
  This data is used to simulate API responses in place of actual API calls.
*/
const MOCK_DATA = {
  INSPECT_BIG_QUERY_WITH_SAMPLING: (
    projectId,
    dataProjectId,
    datasetId,
    tableId,
    topicId,
    jobName
  ) => ({
    REQUEST_CREATE_DLP_JOB: {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: [{name: 'PERSON_NAME'}],
          includeQuote: true,
        },
        storageConfig: {
          bigQueryOptions: {
            tableReference: {
              projectId: dataProjectId,
              datasetId: datasetId,
              tableId: tableId,
            },
            rowsLimit: 1000,
            sampleMethod:
              DLP.protos.google.privacy.dlp.v2.BigQueryOptions.SampleMethod
                .RANDOM_START,
            includedFields: [{name: 'name'}],
          },
        },
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    },
    RESPONSE_GET_DLP_JOB: [
      {
        name: jobName,
        inspectDetails: {
          result: {
            infoTypeStats: [
              {
                count: 1,
                infoType: {
                  name: 'PERSON_NAME',
                },
              },
            ],
          },
        },
      },
    ],
    MOCK_MESSAGE: {
      attributes: {
        DlpJobName: jobName,
      },
      ack: sinon.stub(),
      nack: sinon.stub(),
    },
  }),
};

module.exports = {MOCK_DATA};
