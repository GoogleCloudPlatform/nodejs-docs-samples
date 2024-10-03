package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"slices"
	"strings"

	"samples-tools/pkg/utils"
)

func main() {
	configFile := flag.String("config", "", "path to the config file")
	diffsFile := flag.String("diffs", "", "path to the diffs file")
	flag.Parse()

	if *configFile == "" {
		fmt.Fprintf(os.Stderr, "config file is required, please pass -config=path/to/config.jsonc\n")
		os.Exit(1)
	}

	if *diffsFile == "" {
		fmt.Fprintf(os.Stderr, "diffs file is required, please pass -diffs=path/to/diffs.txt\n")
		os.Exit(1)
	}

	config, err := utils.LoadConfig(*configFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error loading the config file, make sure it exists and it's valid: %v\n", err)
		os.Exit(1)
	}

	diffs, err := readDiffs(*diffsFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error getting the diffs: %v\n", err)
		os.Exit(1)
	}

	packages, err := affected(config, diffs)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error finding the affected packages: %v\n", err)
		os.Exit(1)
	}
	if len(packages) > 256 {
		fmt.Fprintf(os.Stderr,
			"GitHub Actions only supports up to 256 packages, got %v packages, for more details see:\n%v\n",
			len(packages),
			"https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow",
		)
		os.Exit(1)
	}

	matrix, err := json.Marshal(packages)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error marshaling to JSON: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(string(matrix))
}

func readDiffs(path string) ([]string, error) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return []string{}, err
	}
	return strings.Split(string(bytes), "\n"), nil
}

func affected(config utils.Config, diffs []string) ([]string, error) {
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

	changed := make([]string, 0, len(changedUnique))
	for pkg := range changedUnique {
		changed = append(changed, pkg)
	}

	if slices.Contains(changed, ".") {
		return utils.FindAllPackages(".", config)
	}
	return changed, nil
}
