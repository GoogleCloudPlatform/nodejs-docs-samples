/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {expect} = require('chai');
const {afterEach, describe, it} = require('mocha');
const sinon = require('sinon');
const gemma2PredictGpu = require('../gemma2PredictGpu.js');
const gemma2PredictTpu = require('../gemma2PredictTpu.js');

const gpuResponse = `The sky appears blue due to a phenomenon called **Rayleigh scattering**.
**Here's how it works:**
1. **Sunlight:** Sunlight is composed of all the colors of the rainbow.
2. **Earth's Atmosphere:** When sunlight enters the Earth's atmosphere, it collides with tiny particles like nitrogen and oxygen molecules.
3. **Scattering:** These particles scatter the sunlight in all directions. However, blue light (which has a shorter wavelength) is scattered more effectively than other colors.
4. **Our Perception:** As a result, we see a blue sky because the scattered blue light reaches our eyes from all directions.
**Why not other colors?**
* **Violet light** has an even shorter wavelength than blue and is scattered even more. However, our eyes are less sensitive to violet light, so we perceive the sky as blue.
* **Longer wavelengths** like red, orange, and yellow are scattered less and travel more directly through the atmosphere. This is why we see these colors during sunrise and sunset, when sunlight has to travel through more of the atmosphere.
`;

const tpuResponse =
  'The sky appears blue due to a phenomenon called **Rayleigh scattering**.';

describe('Gemma2 predictions', async () => {
  const gemma2Endpoint =
    'projects/your-project-id/locations/your-vertex-endpoint-region/endpoints/your-vertex-endpoint-id';
  const configValues = {
    maxOutputTokens: {kind: 'numberValue', numberValue: 1024},
    temperature: {kind: 'numberValue', numberValue: 0.9},
    topP: {kind: 'numberValue', numberValue: 1},
    topK: {kind: 'numberValue', numberValue: 1},
  };
  const prompt = 'Why is the sky blue?';
  const predictionServiceClientMock = {
    predict: sinon.stub().resolves([]),
  };

  afterEach(() => {
    sinon.reset();
  });

  it('should run inference with GPU', async () => {
    const expectedGpuRequest = {
      endpoint: gemma2Endpoint,
      instances: [
        {
          kind: 'structValue',
          structValue: {
            fields: {
              inputs: {
                kind: 'stringValue',
                stringValue: prompt,
              },
              parameters: {
                kind: 'structValue',
                structValue: {
                  fields: configValues,
                },
              },
            },
          },
        },
      ],
    };

    predictionServiceClientMock.predict.resolves([
      {
        predictions: [
          {
            stringValue: gpuResponse,
          },
        ],
      },
    ]);

    const output = await gemma2PredictGpu(predictionServiceClientMock);

    expect(output).include('Rayleigh scattering');
    expect(predictionServiceClientMock.predict.calledOnce).to.be.true;
    expect(predictionServiceClientMock.predict.calledWith(expectedGpuRequest))
      .to.be.true;
  });

  it('should run inference with TPU', async () => {
    const expectedTpuRequest = {
      endpoint: gemma2Endpoint,
      instances: [
        {
          kind: 'structValue',
          structValue: {
            fields: {
              ...configValues,
              prompt: {
                kind: 'stringValue',
                stringValue: prompt,
              },
            },
          },
        },
      ],
    };

    predictionServiceClientMock.predict.resolves([
      {
        predictions: [
          {
            stringValue: tpuResponse,
          },
        ],
      },
    ]);

    const output = await gemma2PredictTpu(predictionServiceClientMock);

    expect(output).include('Rayleigh scattering');
    expect(predictionServiceClientMock.predict.calledOnce).to.be.true;
    expect(predictionServiceClientMock.predict.calledWith(expectedTpuRequest))
      .to.be.true;
  });
});
