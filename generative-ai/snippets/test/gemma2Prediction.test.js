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

const text = `The sky appears blue due to a phenomenon called **Rayleigh scattering**.
**Here's how it works:**
1. **Sunlight:** Sunlight is composed of all the colors of the rainbow.
2. **Earth's Atmosphere:** When sunlight enters the Earth's atmosphere, it collides with tiny particles like nitrogen and oxygen molecules.
3. **Scattering:** These particles scatter the sunlight in all directions. However, blue light (which has a shorter wavelength) is scattered more effectively than other colors.
4. **Our Perception:** As a result, we see a blue sky because the scattered blue light reaches our eyes from all directions.
**Why not other colors?**
* **Violet light** has an even shorter wavelength than blue and is scattered even more. However, our eyes are less sensitive to violet light, so we perceive the sky as blue.
* **Longer wavelengths** like red, orange, and yellow are scattered less and travel more directly through the atmosphere. This is why we see these colors during sunrise and sunset, when sunlight has to travel through more of the atmosphere.
`;

describe('Gemma2 predictions', async () => {
  const predictionServiceClientMock = {
    predict: sinon.stub().resolves([
      {
        predictions: [
          {
            stringValue: text,
          },
        ],
      },
    ]),
  };

  afterEach(() => {
    sinon.restore();
  });

  it('should run interference with GPU', async () => {
    const output = await gemma2PredictGpu(predictionServiceClientMock);

    expect(output).include('Rayleigh scattering');
  });
});
