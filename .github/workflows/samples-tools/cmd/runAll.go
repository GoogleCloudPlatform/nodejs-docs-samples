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
	"sync/atomic"
)

// runAll runs all the commands in parallel.
func runAll(packages []string, script string, maxGoroutines int) int64 {
	var failures int64
	guard := make(chan struct{}, maxGoroutines)
	for _, pkg := range packages {
		guard <- struct{}{} // block if channel is filled
		go func() {
			output, err := exec.Command("bash", script, pkg).CombinedOutput()
			if err != nil {
				printError(os.Stderr, pkg, err, string(output))
				atomic.AddInt64(&failures, 1)
			} else {
				fmt.Printf("✅ %v\n", pkg)
			}
			<-guard
		}()
	}
	return failures
}

func printError(f *os.File, pkg string, err error, output string) {
	fmt.Fprintf(f, "%v\n❌ FAILED: %v\n%v\n%v\n%v\n\n",
		strings.Repeat("=", 80),
		pkg,
		strings.Repeat("-", 80),
		err,
		string(output),
	)
}
