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

	matrix, err := affected(config, diffs)
	if err != nil {
		panic(err)
	}

	matrixJson, err := json.Marshal(matrix)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(matrixJson))
}

func affected(config utils.Config, diffs []string) ([]string, error) {
	uniquePackages := make(map[string]bool)
	for _, diff := range diffs {
		if !config.Matches(diff) {
			continue
		}
		pkg := config.FindPackage(diff)
		uniquePackages[pkg] = true
	}

	changed := make([]string, 0, len(uniquePackages))
	for pkg := range uniquePackages {
		changed = append(changed, pkg)
	}

	return changed, nil // TODO: REMOVE THIS
	if !slices.Contains(changed, ".") {
		return changed, nil
	}

	var packages []string
	err := filepath.WalkDir(".",
		func(path string, d os.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if path == "." {
				return nil
			}
			if d.IsDir() && config.Matches(path) && config.IsPackageDir(path) {
				packages = append(packages, path)
				return filepath.SkipDir
			}
			return nil
		})
	if err != nil {
		return []string{}, err
	}

	if len(packages) > 256 {
		return []string{}, fmt.Errorf("GitHub Actions only supports up to 256 packages, got %d packages", len(packages))
	}
	return packages, nil
}
