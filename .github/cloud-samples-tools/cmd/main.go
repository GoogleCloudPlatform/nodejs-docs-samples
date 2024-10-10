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
	"cloud-samples-tools/pkg/utils"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
)

var usage = `usage: tools <command> ...

commands:
  affected path/to/config.jsonc path/to/diffs.txt
  run-all path/to/config.jsonc path/to/script.sh
`

func main() {
	flag.Parse()

	command := flag.Arg(0)
	if command == "" {
		log.Fatalln("❌ no command specified\n", usage)
	}

	switch command {
	case "affected":
		configFile := flag.Arg(1)
		if configFile == "" {
			log.Fatalln("❌ no config file specified\n", usage)
		}

		diffsFile := flag.Arg(2)
		if diffsFile == "" {
			log.Fatalln("❌ no diffs file specified\n", usage)
		}

		affectedCmd(configFile, diffsFile)

	case "run-all":
		configFile := flag.Arg(1)
		if configFile == "" {
			log.Fatalln("❌ no config file specified\n", usage)
		}

		script := flag.Arg(2)
		if script == "" {
			log.Fatalln("❌ no script file specified\n", usage)
		}

		runAllCmd(configFile, script)

	default:
		log.Fatalln("❌ unknown command: ", command, "\n", usage)
	}
}

func affectedCmd(configFile string, diffsFile string) {
	config, err := utils.LoadConfig(configFile)
	if err != nil {
		log.Fatalln("❌ error loading the config file: ", configFile, "\n", err)
	}

	diffsBytes, err := os.ReadFile(diffsFile)
	if err != nil {
		log.Fatalln("❌ error getting the diffs: ", diffsFile, "\n", err)
	}
	diffs := strings.Split(string(diffsBytes), "\n")

	packages, err := utils.Affected(config, diffs)
	if err != nil {
		log.Fatalln("❌ error finding the affected packages.\n", err)
	}
	if len(packages) > 256 {
		log.Fatalln(
			"❌ Error: GitHub Actions only supports up to 256 packages, got ",
			len(packages),
			" packages, for more details see:\n",
			"https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow",
		)
	}

	packagesJson, err := json.Marshal(packages)
	if err != nil {
		log.Fatalln("❌ error marshaling packages to JSON.\n", err)
	}

	fmt.Println(string(packagesJson))
}

func runAllCmd(configFile string, script string) {
	config, err := utils.LoadConfig(configFile)
	if err != nil {
		log.Fatalln("❌ error loading the config file: ", configFile, "\n", err)
	}

	packages, err := utils.FindAllPackages(".", config)
	if err != nil {
		log.Fatalln("❌ error finding packages.\n", err)
	}

	maxGoroutines := 16
	failed := utils.RunAll(packages, script, maxGoroutines)

	fmt.Printf(strings.Repeat("-", 80) + "\n")
	fmt.Printf("Total tests: %v\n", len(packages))
	fmt.Printf("Failed tests: %v\n", failed)

	if failed > 0 {
		log.Fatalln("❌ some tests failed, exit with code 1.")
	}
}
