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
	"encoding/json"
	"fmt"
	"log"
	"os"
	"samples-tools/pkg/utils"
	"strings"
)

func main() {
	command := ""
	if len(os.Args) > 1 {
		command = os.Args[1]
	} else {
		fmt.Fprintf(os.Stderr, "❌ no command specified\n")
		printUsage(os.Stderr)
		os.Exit(1)
	}

	switch command {
	case "affected":
		configFile := ""
		if len(os.Args) > 2 {
			configFile = os.Args[2]
		} else {
			fmt.Fprintf(os.Stderr, "❌ no config file specified\n")
			printUsage(os.Stderr)
			os.Exit(1)
		}

		diffsFile := ""
		if len(os.Args) > 3 {
			diffsFile = os.Args[3]
		} else {
			fmt.Fprintf(os.Stderr, "❌ no diffs file specified\n")
			printUsage(os.Stderr)
			os.Exit(1)
		}

		affectedCmd(configFile, diffsFile)

	case "run-all":
		configFile := ""
		if len(os.Args) > 2 {
			configFile = os.Args[2]
		} else {
			fmt.Fprintf(os.Stderr, "❌ no config file specified\n")
			printUsage(os.Stderr)
			os.Exit(1)
		}

		script := ""
		if len(os.Args) > 3 {
			script = os.Args[3]
		} else {
			fmt.Fprintf(os.Stderr, "❌ no script file specified\n")
			printUsage(os.Stderr)
			os.Exit(1)
		}

		runAllCmd(configFile, script)

	default:
		fmt.Fprintf(os.Stderr, "❌ unknown command: %s\n", command)
		printUsage(os.Stderr)
		os.Exit(1)
	}
}

func printUsage(f *os.File) {
	fmt.Fprintf(f, "usage: tools <command> ...\n")
	fmt.Fprintf(f, "\n")
	fmt.Fprintf(f, "commands:\n")
	fmt.Fprintf(f, "  affected path/to/config.jsonc path/to/diffs.txt\n")
	fmt.Fprintf(f, "  run-all path/to/config.jsonc path/to/script.sh\n")
}

func affectedCmd(configFile string, diffsFile string) {
	config, err := utils.LoadConfig(configFile)
	if err != nil {
		log.Fatalf("❌ error loading the config file: %v\n%v\n", configFile, err)
	}

	diffs, err := readDiffs(diffsFile)
	if err != nil {
		log.Fatalf("❌ error getting the diffs: %v\n%v\n", diffsFile, err)
	}

	packages, err := affected(config, diffs)
	if err != nil {
		log.Fatalf("❌ error finding the affected packages.\n%v\n", err)
	}
	if len(packages) > 256 {
		log.Fatalf(
			"❌ Error: GitHub Actions only supports up to 256 packages, got %v packages, for more details see:\n%v\n",
			len(packages),
			"https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow",
		)
	}

	packagesJson, err := json.Marshal(packages)
	if err != nil {
		log.Fatalf("❌ error marshaling packages to JSON.\n%v\n", err)
	}

	fmt.Println(string(packagesJson))
}

func runAllCmd(configFile string, script string) {
	config, err := utils.LoadConfig(configFile)
	if err != nil {
		log.Fatalf("❌ error loading the config file: %v\n%v\n", configFile, err)
	}

	packages, err := utils.FindAllPackages(".", config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ error finding packages.\n%v\n", err)
	}

	maxGoroutines := 16
	failed := runAll(packages, script, maxGoroutines)

	fmt.Printf(strings.Repeat("-", 80) + "\n")
	fmt.Printf("Total tests: %v\n", len(packages))
	fmt.Printf("Failed tests: %v\n", failed)

	if failed > 0 {
		log.Fatalf("❌ some tests failed, exit with code 1.")
	}
}
