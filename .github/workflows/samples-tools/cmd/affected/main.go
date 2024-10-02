package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/fs"
	"os"
	"slices"

	"samples-tools/pkg/utils"
)

func main() {
	configPath := flag.String("config", "", "path to the config file")
	headCommit := flag.String("head", "HEAD", "commit with the changes")
	mainCommit := flag.String("main", "origin/main", "commit of the main branch")
	flag.Parse()

	if *configPath == "" {
		fmt.Fprintf(os.Stderr, "config path is required, please pass -config=path/to/config.jsonc")
		os.Exit(1)
	}

	config, err := utils.LoadConfig(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error loading the config file, make sure it exists and it's valid: %v\n", err)
		os.Exit(1)
	}

	diffs, err := utils.Diffs(*headCommit, *mainCommit)
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
		return findAllPackages(".", config)
	}
	return changed, nil
}

func findAllPackages(root string, config utils.Config) ([]string, error) {
	var packages []string
	err := fs.WalkDir(os.DirFS(root), ".",
		func(path string, d os.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if path == "." {
				return nil
			}
			if slices.Contains(config.ExcludePackages, path) {
				return nil
			}
			if d.IsDir() && config.Matches(path) && config.IsPackageDir(path) {
				packages = append(packages, path)
				return nil
			}
			return nil
		})
	if err != nil {
		return []string{}, err
	}
	return packages, nil
}
