package main

import (
	"encoding/json"
	"fmt"

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

	matrix := affected(config, diffs)
	matrixJson, err := json.Marshal(matrix)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(matrixJson))
}

func affected(config utils.Config, diffs []string) []string {
	uniquePackages := make(map[string]bool)
	for _, diff := range diffs {
		if !config.Matches(diff) {
			continue
		}
		pkg := config.FindPackage(diff)
		uniquePackages[pkg] = true
	}

	packages := make([]string, 0, len(uniquePackages))
	for pkg := range uniquePackages {
		packages = append(packages, pkg)
	}
	return packages
}
