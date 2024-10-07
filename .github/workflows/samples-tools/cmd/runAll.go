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

package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// runAll runs all the commands in parallel.
func runAll(packages []string, script string, maxGoroutines int) int {
	failures := mapParallel(maxGoroutines, packages, func(pkg string) string {
		// TODO(dcavazos): measure time spent on each test and print it along the results
		output, err := exec.Command("bash", script, pkg).CombinedOutput()
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n❌ FAILED: %v\n%v\n%v\n%v\n\n",
				strings.Repeat("=", 80),
				pkg,
				strings.Repeat("-", 80),
				err,
				string(output),
			)
			return pkg
		} else {
			fmt.Printf("✅ %v\n", pkg)
		}
		return ""
	})

	failed := 0
	for _, failure := range failures {
		if failure != "" {
			failed++
		}
	}
	return failed
}

// mapParallel applies a function in parallel to each item in a slice.
func mapParallel[a, b any](maxGoroutines int, items []a, fn func(a) b) []b {
	result := make([]b, len(items))
	guard := make(chan struct{}, maxGoroutines)
	for i, item := range items {
		guard <- struct{}{} // block if channel is filled
		go func(i int, item a) {
			result[i] = fn(item)
			<-guard
		}(i, item)
	}
	return result
}
