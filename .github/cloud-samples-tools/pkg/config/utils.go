/*
 Copyright 2024 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

package config

import (
	"encoding/json"
	"errors"
	"os"
	"regexp"
)

var multiLineCommentsRegex = regexp.MustCompile(`(?s)\s*/\*.*?\*/`)
var singleLineCommentsRegex = regexp.MustCompile(`\s*//.*\s*`)

func ReadJsonc[a any](path string) (*a, error) {
	// Read the JSONC file.
	sourceJsonc, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// Strip the comments and load the JSON.
	sourceJson := multiLineCommentsRegex.ReplaceAll(sourceJsonc, []byte{})
	sourceJson = singleLineCommentsRegex.ReplaceAll(sourceJson, []byte{})

	var value a
	err = json.Unmarshal(sourceJson, &value)
	if err != nil {
		return nil, err
	}
	return &value, nil
}

// fileExists returns true if the file exists.
func fileExists(path string) bool {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return false
	}
	return true
}
