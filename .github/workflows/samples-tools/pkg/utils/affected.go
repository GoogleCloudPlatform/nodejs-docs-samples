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

package utils

import (
	"slices"
)

func Affected(config Config, diffs []string) ([]string, error) {
	changed := Changed(config, diffs)
	if slices.Contains(changed, ".") {
		return FindAllPackages(".", config)
	}
	return changed, nil
}

func Changed(config Config, diffs []string) []string {
	changedUnique := make(map[string]bool)
	for _, diff := range diffs {
		if !config.Matches(diff) {
			continue
		}
		pkg := config.FindPackage(diff)
		if slices.Contains(config.ExcludePackages, pkg) {
			continue
		}
		changedUnique[pkg] = true
	}

	if len(changedUnique) == 0 {
		return []string{"."}
	}

	changed := make([]string, 0, len(changedUnique))
	for pkg := range changedUnique {
		changed = append(changed, pkg)
	}
	return changed
}
