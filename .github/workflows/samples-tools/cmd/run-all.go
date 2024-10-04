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
	"samples-tools/pkg/utils"
	"strings"
)

// func main() {
// 	configFile := flag.String("config", "", "path to the config file")
// 	parallel := flag.Bool("parallel", false, "set to true to run tests in parallel")
// 	flag.Parse()

// 	if *configFile == "" {
// 		fmt.Fprintf(os.Stderr, "config file is required, please pass -config=path/to/config.jsonc\n")
// 		os.Exit(1)
// 	}

// 	cmd := flag.Arg(0)
// 	if cmd == "" {
// 		fmt.Fprintf(os.Stderr, "command is required, use positional arguments with %%s for the package placeholder\n")
// 		os.Exit(1)
// 	}

// 	args := flag.Args()[1:]

// 	config, err := utils.LoadConfig(*configFile)
// 	if err != nil {
// 		fmt.Fprintf(os.Stderr, "error loading the config file, make sure it exists and it's valid: %v\n", err)
// 		os.Exit(1)
// 	}

// 	packages, err := utils.FindAllPackages(".", config)
// 	if err != nil {
// 		fmt.Fprintf(os.Stderr, "error finding packages: %v\n", err)
// 	}

// 	failed := runAll(packages, cmd, args, *parallel)
// 	fmt.Printf("Total tests: %v\nFailed tests: %v\n", len(packages), failed)
// 	if failed > 0 {
// 		os.Exit(1)
// 	}
// }

func runAll(packages []string, cmd string, args []string, parallel bool) int {
	failures := utils.Map(parallel, packages, func(pkg string) string {
		return runOne(pkg, cmd, args)
	})

	failed := 0
	for _, failure := range failures {
		if failure != "" {
			failed++
		}
	}
	return failed
}

func runOne(pkg string, cmd string, args []string) string {
	// TODO(dcavazos): measure time spent on each test and print it along the results
	cmdArgs := make([]string, len(args))
	for i, arg := range args {
		if strings.Contains(arg, "%s") {
			cmdArgs[i] = fmt.Sprintf(arg, pkg)
		} else {
			cmdArgs[i] = arg
		}
	}
	output, err := exec.Command(cmd, cmdArgs...).CombinedOutput()
	if err != nil {
		fmt.Fprintf(os.Stderr, "%v\n❌ FAILED: %v\n%v\n> %v %v\n%v\n%v\n%v\n\n",
			strings.Repeat("=", 80),
			pkg,
			strings.Repeat("-", 80),
			cmd, cmdArgs,
			err,
			string(output),
			strings.Repeat("-", 80),
		)
		return pkg
	} else {
		fmt.Printf("✅ %v\n", pkg)
	}
	return ""
}
