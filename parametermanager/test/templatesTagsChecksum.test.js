// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {v4: uuidv4} = require('uuid');
const crc32c = require('fast-crc32c');

const {ParameterManagerClient} = require('@google-cloud/parametermanager');
const {TagBindingsClient} = require('@google-cloud/resource-manager');

const locationId = process.env.GCLOUD_LOCATION || 'us-central1';
const tagKey = process.env.PARAMETER_MANAGER_TAG_KEY;
const tagValue = process.env.PARAMETER_MANAGER_TAG_VALUE;

const NOT_FOUND = 5;

// Runs the same scenarios against the global and the regional location.
[false, true].forEach(regional => {
  describe(`Parameter Manager templates, tags and checksum samples (${regional ? 'regional' : 'global'})`, () => {
    const options = regional
      ? {apiEndpoint: `parametermanager.${locationId}.rep.googleapis.com`}
      : {};
    const client = new ParameterManagerClient(options);
    const tagBindingsClient = new TagBindingsClient(
      regional
        ? {apiEndpoint: `${locationId}-cloudresourcemanager.googleapis.com`}
        : {}
    );

    const location = regional ? locationId : 'global';
    const suffix = uuidv4().slice(0, 8);
    const templateId = `test-template-${suffix}`;
    const parameterId = `test-parameter-${suffix}`;
    const parameterVersionId = 'v1';
    const templatePayload = '{"username":"{{.username}}","host":"{{.host}}"}';
    const values = {username: 'test-user', host: 'localhost'};

    let projectId;
    let template;
    let templateVersion;
    let parameter;

    const templatesToDelete = [];
    const templateVersionsToDelete = [];
    const parametersToDelete = [];
    const parameterVersionsToDelete = [];

    // Loads a sample and calls it, adding the location argument for regional
    // samples.
    const run = (name, ...args) => {
      const sample = regional
        ? require(
            `../regional_samples/${
              name === 'templateQuickstart'
                ? 'regionalTemplateQuickstart'
                : name.replace('Param', 'RegionalParam')
            }`
          )
        : require(`../${name}`);
      return regional
        ? sample.main(projectId, locationId, ...args)
        : sample.main(projectId, ...args);
    };

    const newTemplate = async id => {
      const [created] = await client.createTemplate({
        parent: client.locationPath(projectId, location),
        templateId: id,
        template: {format: 'TEMPLATE_FORMAT_JSON'},
      });
      templatesToDelete.push(created.name);
      return created;
    };

    const newTemplateVersion = async (templateName, id) => {
      const [created] = await client.createTemplateVersion({
        parent: templateName,
        templateVersionId: id,
        templateVersion: {
          payload: {data: Buffer.from(templatePayload, 'utf8')},
        },
      });
      templateVersionsToDelete.push(created.name);
      return created;
    };

    const newParameter = async (id, format = 'JSON') => {
      const [created] = await client.createParameter({
        parent: client.locationPath(projectId, location),
        parameterId: id,
        parameter: {format: format},
      });
      parametersToDelete.push(created.name);
      return created;
    };

    const newParameterVersion = async (parameterName, id) => {
      const [created] = await client.createParameterVersion({
        parent: parameterName,
        parameterVersionId: id,
        parameterVersion: {
          payload: {data: Buffer.from(JSON.stringify(values), 'utf8')},
        },
      });
      parameterVersionsToDelete.push(created.name);
      return created;
    };

    const ignoreNotFound = async promise => {
      try {
        await promise;
      } catch (err) {
        if (err.code !== NOT_FOUND) {
          throw err;
        }
      }
    };

    before(async () => {
      projectId = await client.getProjectId();

      template = await newTemplate(templateId);
      templateVersion = await newTemplateVersion(template.name, 'v1');
      parameter = await newParameter(parameterId);
      await newParameterVersion(parameter.name, parameterVersionId);
    });

    after(async () => {
      for (const name of templateVersionsToDelete) {
        await ignoreNotFound(client.deleteTemplateVersion({name}));
      }
      for (const name of templatesToDelete) {
        await ignoreNotFound(client.deleteTemplate({name}));
      }
      for (const name of parameterVersionsToDelete) {
        await ignoreNotFound(client.deleteParameterVersion({name}));
      }
      for (const name of parametersToDelete) {
        await ignoreNotFound(client.deleteParameter({name}));
      }
    });

    describe('templates', () => {
      it('should create a template', async () => {
        const id = `${templateId}-create`;
        const created = await run(
          'createParamTemplate',
          id,
          'TEMPLATE_FORMAT_JSON'
        );
        templatesToDelete.push(created.name);
        assert.include(created.name, id);
        assert.equal(created.format, 'TEMPLATE_FORMAT_JSON');
      });

      it('should create a template version with placeholders', async () => {
        const created = await run(
          'createParamTemplateVersion',
          templateId,
          'v-create'
        );
        templateVersionsToDelete.push(created.name);
        assert.include(created.name, `${templateId}/versions/v-create`);
        const [got] = await client.getTemplateVersion({name: created.name});
        assert.include(got.payload.data.toString('utf-8'), '{{.username}}');
      });

      it('should list templates', async () => {
        const templates = await run('listParamTemplates');
        assert.isTrue(templates.some(t => t.name === template.name));
      });

      it('should get a template', async () => {
        const got = await run('getParamTemplate', templateId);
        assert.equal(got.name, template.name);
      });

      it('should list template versions', async () => {
        const versions = await run('listParamTemplateVersions', templateId);
        assert.isTrue(versions.some(v => v.name === templateVersion.name));
      });

      it('should get a template version', async () => {
        const got = await run('getParamTemplateVersion', templateId, 'v1');
        assert.equal(got.name, templateVersion.name);
        assert.equal(got.payload.data.toString('utf-8'), templatePayload);
      });

      it('should update template labels', async () => {
        const updated = await run(
          'updateParamTemplateLabels',
          templateId,
          'environment',
          'test'
        );
        assert.equal(updated.name, template.name);
        assert.equal(updated.labels.environment, 'test');
      });

      it('should disable and enable a template version', async () => {
        const created = await newTemplateVersion(template.name, 'v-toggle');
        const disabled = await run(
          'disableParamTemplateVersion',
          templateId,
          'v-toggle'
        );
        assert.equal(disabled.name, created.name);
        assert.isTrue(disabled.disabled);

        const enabled = await run(
          'enableParamTemplateVersion',
          templateId,
          'v-toggle'
        );
        assert.equal(enabled.name, created.name);
        assert.isNotTrue(enabled.disabled);
      });

      it('should delete a template version', async () => {
        const created = await newTemplateVersion(template.name, 'v-delete');
        await run('deleteParamTemplateVersion', templateId, 'v-delete');
        try {
          await client.getTemplateVersion({name: created.name});
          assert.fail('template version still exists');
        } catch (err) {
          assert.equal(err.code, NOT_FOUND);
        }
      });

      it('should delete a template', async () => {
        const created = await newTemplate(`${templateId}-delete`);
        await run('deleteParamTemplate', `${templateId}-delete`);
        try {
          await client.getTemplate({name: created.name});
          assert.fail('template still exists');
        } catch (err) {
          assert.equal(err.code, NOT_FOUND);
        }
      });

      it('should render a template version', async () => {
        const rendered = await run(
          'renderParamTemplateVersion',
          templateId,
          'v1',
          parameterId,
          parameterVersionId
        );
        assert.equal(rendered.payload.data.toString('utf-8'), templatePayload);
        assert.deepEqual(
          JSON.parse(rendered.renderedPayload.toString('utf-8')),
          values
        );
      });

      it('should run the template quickstart', async () => {
        const id = `${templateId}-qs`;
        const parameterQsId = `${parameterId}-qs`;
        const rendered = await run(
          'templateQuickstart',
          id,
          parameterQsId,
          'v1'
        );
        templateVersionsToDelete.push(rendered.templateVersion);
        templatesToDelete.push(rendered.templateVersion.split('/versions/')[0]);
        parameterVersionsToDelete.push(rendered.parameterVersion);
        parametersToDelete.push(
          rendered.parameterVersion.split('/versions/')[0]
        );
        assert.deepEqual(
          JSON.parse(rendered.renderedPayload.toString('utf-8')),
          values
        );
      });
    });

    describe('tags', () => {
      before(function () {
        if (!tagKey || !tagValue) {
          this.skip();
        }
      });

      it('should create a parameter with a tag', async () => {
        const id = `${parameterId}-tagged`;
        const created = await run('createParamWithTags', id, tagKey, tagValue);
        parametersToDelete.push(created.name);
        assert.include(created.name, id);

        // Tags are input-only, so read them back from Resource Manager.
        const [bindings] = await tagBindingsClient.listTagBindings({
          parent: `//parametermanager.googleapis.com/${created.name}`,
        });
        assert.isTrue(bindings.some(b => b.tagValue === tagValue));
      });

      it('should bind a tag to a parameter', async () => {
        const id = `${parameterId}-bound`;
        const binding = await run('bindTagsToParam', id, tagValue);
        parametersToDelete.push(client.parameterPath(projectId, location, id));
        assert.equal(binding.tagValue, tagValue);
        assert.include(binding.parent, id);
      });

      it('should get the tags of a parameter', async () => {
        const id = `${parameterId}-gettags`;
        await run('bindTagsToParam', id, tagValue);
        parametersToDelete.push(client.parameterPath(projectId, location, id));
        const bindings = await run('getParamTags', id);
        assert.isTrue(bindings.some(b => b.tagValue === tagValue));
      });
    });

    describe('checksum', () => {
      const payload = 'hello world!';
      const checksumParameterId = `${parameterId}-checksum`;
      let checksumParameter;
      let checksumParameterVersion;

      before(async () => {
        checksumParameter = await newParameter(
          checksumParameterId,
          'UNFORMATTED'
        );
        [checksumParameterVersion] = await client.createParameterVersion({
          parent: checksumParameter.name,
          parameterVersionId: parameterVersionId,
          parameterVersion: {
            payload: {data: Buffer.from(payload, 'utf8')},
          },
        });
        parameterVersionsToDelete.push(checksumParameterVersion.name);
      });

      it('should create a parameter version with a checksum', async () => {
        const created = await run(
          'createParamVersionWithChecksum',
          checksumParameterId,
          'v-checksum'
        );
        parameterVersionsToDelete.push(created.name);
        assert.include(
          created.name,
          `${checksumParameterId}/versions/v-checksum`
        );
        assert.equal(created.checksumSource, 'USER_SPECIFIED');

        const [got] = await client.getParameterVersion({
          name: created.name,
          view: 'FULL',
        });
        assert.equal(got.payload.data.toString('utf-8'), payload);
        assert.equal(
          Number(got.payload.dataCrc32c),
          crc32c.calculate(Buffer.from(payload, 'utf8'))
        );
      });

      it('should get a parameter version and verify the checksum', async () => {
        const verified = await run(
          'getParamVersionVerifyChecksum',
          checksumParameterId,
          parameterVersionId
        );
        assert.equal(verified.name, checksumParameterVersion.name);
        assert.equal(verified.checksumSource, 'SERVER_GENERATED');
      });

      it('should reject a mismatched checksum', async () => {
        const data = Buffer.from(payload, 'utf8');
        try {
          await client.createParameterVersion({
            parent: checksumParameter.name,
            parameterVersionId: 'v-mismatch',
            parameterVersion: {
              payload: {
                data: data,
                dataCrc32c: (crc32c.calculate(data) + 1) % 2 ** 32,
              },
            },
          });
          assert.fail('expected the checksum mismatch to be rejected');
        } catch (err) {
          assert.equal(err.code, 3);
          assert.equal(err.reason, 'CHECKSUM_MISMATCH');
        }
      });
    });
  });
});
