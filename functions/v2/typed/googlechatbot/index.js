// Copyright 2023 Google LLC
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

// [START functions_typed_googlechatbot]
const functions = require('@google-cloud/functions-framework');

functions.typed('chat', req => {
  const displayName = req.message.sender.displayName;
  const imageUrl = req.message.sender.avatarUrl;

  const cardHeader = {
    title: `Hello ${displayName}!`,
  };

  const avatarWidget = {
    textParagraph: {text: 'Your avatar picture: '},
  };

  const avatarImageWidget = {
    image: {imageUrl},
  };

  const avatarSection = {
    widgets: [avatarWidget, avatarImageWidget],
  };

  return {
    cardsV2: [
      {
        cardId: 'avatarCard',
        card: {
          name: 'Avatar Card',
          header: cardHeader,
          sections: [avatarSection],
        },
      },
    ],
  };
});
// [END functions_typed_googlechatbot]
