// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(projectId, entryGroupId, entryId, tagTemplateId) {
  // [START data_catalog_create_custom_entry]
  // Import the Google Cloud client library.
  const {DataCatalogClient} = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  async function createCustomEntry() {
    // Create a custom entry within an entry group.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my_project';
    // const entryGroupId = 'my_entry_group';
    // const entryId =  'my_entry';
    // const tagTemplateId = 'my_tag_template';

    // Currently, Data Catalog stores metadata in the us-central1 region.
    const location = 'us-central1';

    // Delete any pre-existing Entry with the same name
    // that will be used to create the new Entry.
    try {
      const entryName = datacatalog.entryPath(
        projectId,
        location,
        entryGroupId,
        entryId
      );
      await datacatalog.deleteEntry({name: entryName});
      console.log(`Deleted Entry: ${entryName}`);
    } catch (err) {
      console.log('Entry does not exist.');
    }

    // Delete any pre-existing Entry Group with the same name
    // that will be used to construct the new EntryGroup.
    try {
      const entryGroupName = datacatalog.entryGroupPath(
        projectId,
        location,
        entryGroupId
      );
      await datacatalog.deleteEntryGroup({name: entryGroupName});
      console.log(`Deleted Entry Group: ${entryGroupName}`);
    } catch (err) {
      console.log('Entry Group does not exist.');
    }

    // Delete any pre-existing Template with the same name
    // that will be used to create a new Template.
    const tagTemplateName = datacatalog.tagTemplatePath(
      projectId,
      location,
      tagTemplateId
    );

    let tagTemplateRequest = {
      name: tagTemplateName,
      force: true,
    };

    try {
      await datacatalog.deleteTagTemplate(tagTemplateRequest);
      console.log(`Deleted template: ${tagTemplateName}`);
    } catch (error) {
      console.log(`Cannot delete template: ${tagTemplateName}`);
    }

    // Construct the EntryGroup for the EntryGroup request.
    const entryGroup = {
      displayName: 'My awesome Entry Group',
      description: 'This Entry Group represents an external system',
    };

    // Construct the EntryGroup request to be sent by the client.
    const entryGroupRequest = {
      parent: datacatalog.locationPath(projectId, location),
      entryGroupId: entryGroupId,
      entryGroup: entryGroup,
    };

    // Use the client to send the API request.
    const [createdEntryGroup] =
      await datacatalog.createEntryGroup(entryGroupRequest);
    console.log(`Created entry group: ${createdEntryGroup.name}`);

    // Construct the Entry for the Entry request.
    const entry = {
      userSpecifiedSystem: 'onprem_data_system',
      userSpecifiedType: 'onprem_data_asset',
      displayName: 'My awesome data asset',
      description: 'This data asset is managed by an external system.',
      linkedResource: '//my-onprem-server.com/dataAssets/my-awesome-data-asset',
      schema: {
        columns: [
          {
            column: 'first_column',
            description: 'This columns consists of ....',
            mode: 'NULLABLE',
            type: 'STRING',
          },
          {
            column: 'second_column',
            description: 'This columns consists of ....',
            mode: 'NULLABLE',
            type: 'DOUBLE',
          },
        ],
      },
    };

    // Construct the Entry request to be sent by the client.
    const entryRequest = {
      parent: datacatalog.entryGroupPath(projectId, location, entryGroupId),
      entryId: entryId,
      entry: entry,
    };

    // Use the client to send the API request.
    const [createdEntry] = await datacatalog.createEntry(entryRequest);
    console.log(`Created entry: ${createdEntry.name}`);

    // Create a Tag Template.
    // For more field types, including ENUM, please refer to
    // https://cloud.google.com/data-catalog/docs/quickstarts/quickstart-search-tag#data-catalog-quickstart-nodejs.
    const fieldSource = {
      displayName: 'Source of data asset',
      type: {
        primitiveType: 'STRING',
      },
    };

    const tagTemplate = {
      displayName: 'Demo Tag Template',
      fields: {
        source: fieldSource,
      },
    };

    tagTemplateRequest = {
      parent: datacatalog.locationPath(projectId, location),
      tagTemplateId: tagTemplateId,
      tagTemplate: tagTemplate,
    };

    // Use the client to send the API request.
    const [createdTagTemplate] =
      await datacatalog.createTagTemplate(tagTemplateRequest);
    console.log(`Created template: ${createdTagTemplate.name}`);

    // Attach a Tag to the custom Entry.
    const tag = {
      template: createdTagTemplate.name,
      fields: {
        source: {
          stringValue: 'On-premises system name',
        },
      },
    };

    const tagRequest = {
      parent: createdEntry.name,
      tag: tag,
    };

    // Use the client to send the API request.
    const [createdTag] = await datacatalog.createTag(tagRequest);
    console.log(`Created tag: ${createdTag.name}`);
  }
  createCustomEntry();
  // [END data_catalog_create_custom_entry]
}
main(...process.argv.slice(2));
