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

var multiLine = regexp.MustCompile(`(?s)\s*/\*.*?\*/`)
var singleLine = regexp.MustCompile(`\s*//.*\s*`)

func readJsonc[a any](path string, ref *a) error {
	// Read the JSONC file.
	sourceJsonc, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	// Strip the comments and load the JSON.
	sourceJson := multiLine.ReplaceAll(sourceJsonc, []byte{})
	sourceJson = singleLine.ReplaceAll(sourceJson, []byte{})
	return json.Unmarshal(sourceJson, ref)
}

// fileExists returns true if the file exists.
func fileExists(path string) bool {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return false
	}
	return true
}
