/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function numericalRiskAnalysis(projectId, datasetId, tableId, columnName) {
  // [START numerical_risk]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // (Optional) The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the column to compute risk metrics for, e.g. 'age'
  // Note that this column must be a numeric data type
  // const columnName = 'firstName';

  const sourceTable = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    privacyMetric: {
      numericalStatsConfig: {
        field: {
          columnName: columnName,
        },
      },
    },
    sourceTable: sourceTable,
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
  dlp
    .analyzeDataSourceRisk(request)
    .then(response => {
      const operation = response[0];
      return operation.promise();
    })
    .then(completedJobResponse => {
      const results = completedJobResponse[0].numericalStatsResult;

      console.log(
        `Value Range: [${getValue(results.minValue)}, ${getValue(
          results.maxValue
        )}]`
      );

      // Print unique quantile values
      let tempValue = null;
      results.quantileValues.forEach((result, percent) => {
        const value = getValue(result);

        // Only print new values
        if (
          tempValue !== value &&
          !(tempValue && tempValue.equals && tempValue.equals(value))
        ) {
          console.log(`Value at ${percent}% quantile: ${value}`);
          tempValue = value;
        }
      });
    })
    .catch(err => {
      console.log(`Error in numericalRiskAnalysis: ${err.message || err}`);
    });
  // [END numerical_risk]
}

function categoricalRiskAnalysis(projectId, datasetId, tableId, columnName) {
  // [START categorical_risk]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // (Optional) The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The name of the column to compute risk metrics for, e.g. 'firstName'
  // const columnName = 'firstName';

  const sourceTable = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    privacyMetric: {
      categoricalStatsConfig: {
        field: {
          columnName: columnName,
        },
      },
    },
    sourceTable: sourceTable,
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
  dlp
    .analyzeDataSourceRisk(request)
    .then(response => {
      const operation = response[0];
      return operation.promise();
    })
    .then(completedJobResponse => {
      const results =
        completedJobResponse[0].categoricalStatsResult
          .valueFrequencyHistogramBuckets[0];
      console.log(
        `Most common value occurs ${results.valueFrequencyUpperBound} time(s)`
      );
      console.log(
        `Least common value occurs ${results.valueFrequencyLowerBound} time(s)`
      );
      console.log(`${results.bucketSize} unique values total.`);
      results.bucketValues.forEach(bucket => {
        console.log(
          `Value ${getValue(bucket.value)} occurs ${bucket.count} time(s).`
        );
      });
    })
    .catch(err => {
      console.log(`Error in categoricalRiskAnalysis: ${err.message || err}`);
    });
  // [END categorical_risk]
}

function kAnonymityAnalysis(projectId, datasetId, tableId, quasiIds) {
  // [START k_anonymity]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // (Optional) The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // A set of columns that form a composite key ('quasi-identifiers')
  // const quasiIds = [{ columnName: 'age' }, { columnName: 'city' }];

  const sourceTable = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    privacyMetric: {
      kAnonymityConfig: {
        quasiIds: quasiIds,
      },
    },
    sourceTable: sourceTable,
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
  dlp
    .analyzeDataSourceRisk(request)
    .then(response => {
      const operation = response[0];
      return operation.promise();
    })
    .then(completedJobResponse => {
      const results =
        completedJobResponse[0].kAnonymityResult
          .equivalenceClassHistogramBuckets[0];
      console.log(
        `Bucket size range: [${results.equivalenceClassSizeLowerBound}, ${
          results.equivalenceClassSizeUpperBound
        }]`
      );

      results.bucketValues.forEach(bucket => {
        const quasiIdValues = bucket.quasiIdsValues.map(getValue).join(', ');
        console.log(`  Quasi-ID values: {${quasiIdValues}}`);
        console.log(`  Class size: ${bucket.equivalenceClassSize}`);
      });
    })
    .catch(err => {
      console.log(`Error in kAnonymityAnalysis: ${err.message || err}`);
    });
  // [END k_anonymity]
}

function lDiversityAnalysis(
  projectId,
  datasetId,
  tableId,
  sensitiveAttribute,
  quasiIds
) {
  // [START l_diversity]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // (Optional) The project ID to run the API call under
  // const projectId = process.env.GCLOUD_PROJECT;

  // The ID of the dataset to inspect, e.g. 'my_dataset'
  // const datasetId = 'my_dataset';

  // The ID of the table to inspect, e.g. 'my_table'
  // const tableId = 'my_table';

  // The column to measure l-diversity relative to, e.g. 'firstName'
  // const sensitiveAttribute = 'name';

  // A set of columns that form a composite key ('quasi-identifiers')
  // const quasiIds = [{ columnName: 'age' }, { columnName: 'city' }];

  const sourceTable = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Construct request for creating a risk analysis job
  const request = {
    privacyMetric: {
      lDiversityConfig: {
        quasiIds: quasiIds,
        sensitiveAttribute: {
          columnName: sensitiveAttribute,
        },
      },
    },
    sourceTable: sourceTable,
  };

  // Create helper function for unpacking values
  const getValue = obj => obj[Object.keys(obj)[0]];

  // Run risk analysis job
  dlp
    .analyzeDataSourceRisk(request)
    .then(response => {
      const operation = response[0];
      return operation.promise();
    })
    .then(completedJobResponse => {
      const results =
        completedJobResponse[0].lDiversityResult
          .sensitiveValueFrequencyHistogramBuckets[0];

      console.log(
        `Bucket size range: [${results.sensitiveValueFrequencyLowerBound}, ${
          results.sensitiveValueFrequencyUpperBound
        }]`
      );
      results.bucketValues.forEach(bucket => {
        const quasiIdValues = bucket.quasiIdsValues.map(getValue).join(', ');
        console.log(`  Quasi-ID values: {${quasiIdValues}}`);
        console.log(`  Class size: ${bucket.equivalenceClassSize}`);
        bucket.topSensitiveValues.forEach(valueObj => {
          console.log(
            `    Sensitive value ${getValue(valueObj.value)} occurs ${
              valueObj.count
            } time(s).`
          );
        });
      });
    })
    .catch(err => {
      console.log(`Error in lDiversityAnalysis: ${err.message || err}`);
    });
  // [END l_diversity]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `numerical <datasetId> <tableId> <columnName>`,
    `Computes risk metrics of a column of numbers in a Google BigQuery table.`,
    {},
    opts =>
      numericalRiskAnalysis(
        opts.projectId,
        opts.datasetId,
        opts.tableId,
        opts.columnName
      )
  )
  .command(
    `categorical <datasetId> <tableId> <columnName>`,
    `Computes risk metrics of a column of data in a Google BigQuery table.`,
    {},
    opts =>
      categoricalRiskAnalysis(
        opts.projectId,
        opts.datasetId,
        opts.tableId,
        opts.columnName
      )
  )
  .command(
    `kAnonymity <datasetId> <tableId> [quasiIdColumnNames..]`,
    `Computes the k-anonymity of a column set in a Google BigQuery table.`,
    {},
    opts =>
      kAnonymityAnalysis(
        opts.projectId,
        opts.datasetId,
        opts.tableId,
        opts.quasiIdColumnNames.map(f => {
          return {columnName: f};
        })
      )
  )
  .command(
    `lDiversity <datasetId> <tableId> <sensitiveAttribute> [quasiIdColumnNames..]`,
    `Computes the l-diversity of a column set in a Google BigQuery table.`,
    {},
    opts =>
      lDiversityAnalysis(
        opts.projectId,
        opts.datasetId,
        opts.tableId,
        opts.sensitiveAttribute,
        opts.quasiIdColumnNames.map(f => {
          return {columnName: f};
        })
      )
  )
  .option('p', {
    type: 'string',
    alias: 'projectId',
    default: process.env.GCLOUD_PROJECT,
    global: true,
  })
  .example(
    `node $0 numerical nhtsa_traffic_fatalities accident_2015 state_number -p bigquery-public-data`
  )
  .example(
    `node $0 categorical nhtsa_traffic_fatalities accident_2015 state_name -p bigquery-public-data`
  )
  .example(
    `node $0 kAnonymity nhtsa_traffic_fatalities accident_2015 state_number county -p bigquery-public-data`
  )
  .example(
    `node $0 lDiversity nhtsa_traffic_fatalities accident_2015 city state_number county -p bigquery-public-data`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
