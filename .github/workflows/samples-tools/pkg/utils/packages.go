package utils

import (
	"io/fs"
	"os"
	"slices"
)

func FindAllPackages(root string, config Config) ([]string, error) {
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
