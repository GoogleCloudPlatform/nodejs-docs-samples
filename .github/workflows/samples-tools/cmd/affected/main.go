package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"slices"

	"samples-tools/pkg/utils"
)

func main() {
	usage := "usage: affected path/to/config.json [head-commit] [main-commit]"
	configPath := utils.ArgRequired(1, usage)
	headCommit := utils.ArgWithDefault(2, "HEAD")
	mainCommit := utils.ArgWithDefault(3, "origin/main")

	config, err := utils.LoadConfig(configPath)
	if err != nil {
		panic(err)
	}

	diffs, err := utils.Diffs(headCommit, mainCommit)
	if err != nil {
		panic(err)
	}

	packages, err := affected(config, diffs)
	if err != nil {
		panic(err)
	}
	if len(packages) > 256 {
		panic(fmt.Errorf("GitHub Actions only supports up to 256 packages, got %d packages", len(packages)))
	}

	matrix, err := json.Marshal(packages)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(matrix))
}

func affected(config utils.Config, diffs []string) ([]string, error) {
	uniquePackages := make(map[string]bool)
	for _, diff := range diffs {
		if !config.Matches(diff) {
			continue
		}
		pkg := config.FindPackage(diff)
		if slices.Contains(config.ExcludePackages, pkg) {
			continue
		}
		uniquePackages[pkg] = true
	}

	changed := make([]string, 0, len(uniquePackages))
	for pkg := range uniquePackages {
		changed = append(changed, pkg)
	}

	if slices.Contains(changed, ".") {
		return findAllPackages(config)
	}
	return changed, nil
}

func findAllPackages(config utils.Config) ([]string, error) {
	var packages []string
	err := filepath.WalkDir(".",
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
