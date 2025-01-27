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
	c "cloud-samples-tools/pkg/config"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
)

var usage = `usage: tools <command> ...

commands:
  affected path/to/config.jsonc diffs.txt paths.txt
  setups path/to/config.jsonc paths.txt
`

// Entry point to validate command line arguments.
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
		pathsFile := flag.Arg(3)
		if pathsFile == "" {
			log.Fatalln("❌ no paths file specified\n", usage)
		}
		affectedCmd(configFile, diffsFile, pathsFile)

	case "setups":
		configFile := flag.Arg(1)
		if configFile == "" {
			log.Fatalln("❌ no config file specified\n", usage)
		}
		pathsFile := flag.Arg(2)
		if pathsFile == "" {
			log.Fatalln("❌ no paths file specified\n", usage)
		}
		setupsCmd(configFile, pathsFile)

	default:
		log.Fatalln("❌ unknown command: ", command, "\n", usage)
	}
}

// affected command entry point to validate inputs.
func affectedCmd(configFile string, diffsFile string, pathsFile string) {
	config, err := c.LoadConfig(configFile)
	if err != nil {
		log.Fatalln("❌ error loading the config file: ", configFile, "\n", err)
	}

	diffsBytes, err := os.ReadFile(diffsFile)
	if err != nil {
		log.Fatalln("❌ error getting the diffs: ", diffsFile, "\n", err)
	}
	// Trim whitespace to remove extra newline from diff output.
	diffs := strings.Split(strings.TrimSpace(string(diffsBytes)), "\n")

	// Log to stderr since GitHub Actions expects the output on stdout.
	paths, err := config.Affected(os.Stderr, diffs)
	if err != nil {
		log.Fatalln("❌ error finding the affected packages.\n", err)
	}
	if len(paths) > 256 {
		log.Fatalln(
			"❌ Error: GitHub Actions only supports up to 256 packages, got ",
			len(paths),
			" packages, for more details see:\n",
			"https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow",
		)
	}

	if pathsFile != "" {
		file, err := os.Create(pathsFile)
		if err != nil {
			log.Fatalln("❌ eror creating output file.\n", err)
		}
		for _, path := range paths {
			fmt.Fprintf(file, "%v\n", path)
		}
	}

	output, err := json.Marshal(paths)
	if err != nil {
		log.Fatalln("❌ error marshaling paths to JSON.\n", err)
	}
	fmt.Println(string(output))
}

// setups command entry point to validate inputs.
func setupsCmd(configFile string, pathsFile string) {
	config, err := c.LoadConfig(configFile)
	if err != nil {
		log.Fatalln("❌ error loading the config file: ", configFile, "\n", err)
	}

	pathsBytes, err := os.ReadFile(pathsFile)
	if err != nil {
		log.Fatalln("❌ error getting the diffs: ", pathsFile, "\n", err)
	}
	// Trim whitespace to remove extra newline from diff output.
	paths := strings.Split(strings.TrimSpace(string(pathsBytes)), "\n")

	setups, err := config.FindSetupFiles(paths)
	if err != nil {
		log.Fatalln("❌ error finding setup files.\n", err)
	}

	output, err := json.Marshal(setups)
	if err != nil {
		log.Fatalln("❌ error marshaling setups to JSON.\n", err)
	}
	fmt.Println(string(output))
}
