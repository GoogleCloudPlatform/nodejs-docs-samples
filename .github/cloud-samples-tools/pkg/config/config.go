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

package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

type Config struct {
	// Filename to look for the root of a package.
	PackageFile []string `json:"package-file"`

	// CI setup file, must be located in the same directory as the package file.
	CISetupFileName string `json:"ci-setup-filename"`

	// CI setup defaults, used when no setup file or field is not sepcified in file.
	CISetupDefaults CISetup `json:"ci-setup-defaults"`

	// Pattern to match filenames or directories.
	Match []string `json:"match"`

	// Pattern to ignore filenames or directories.
	Ignore []string `json:"ignore"`

	// Packages to always exclude.
	ExcludePackages []string `json:"exclude-packages"`
}

type CISetup = map[string]any

// Saves the config to the given file.
func (c *Config) Save(file *os.File) error {
	bytes, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}
	_, err = file.Write(bytes)
	if err != nil {
		return err
	}
	return nil
}

// LoadConfig loads the config from the given path.
func LoadConfig(path string) (*Config, error) {
	// Set the config default values.
	config := Config{
		Match: []string{"*"},
	}

	// This mutates `config` so there's no need to reassign it.
	// It keeps the default values if they're not in the JSON file.
	err := readJsonc(path, &config)
	if err != nil {
		return nil, err
	}

	// Validate for required values.
	if config.PackageFile == nil {
		return nil, errors.New("package-file is required")
	}
	return &config, nil
}

// Match returns true if the path matches any of the patterns.
func Match(patterns []string, path string) bool {
	filename := filepath.Base(path)
	for _, pattern := range patterns {
		if match, _ := filepath.Match(pattern, filename); match {
			return true
		}
		if strings.Contains(path, pattern) {
			return true
		}
	}
	return false
}

// Matches returns true if the path matches the config.
func (c *Config) Matches(path string) bool {
	return Match(c.Match, path) && !Match(c.Ignore, path)
}

// IsPackageDir returns true if the path is a package directory.
func (c *Config) IsPackageDir(dir string) bool {
	for _, filename := range c.PackageFile {
		if fileExists(filepath.Join(dir, filename)) {
			return true
		}
	}
	return false
}

// FindPackage returns the most specific package path for the given filename.
func (c *Config) FindPackage(path string) string {
	dir := filepath.Dir(path)
	if dir == "." || c.IsPackageDir(dir) {
		return dir
	}
	return c.FindPackage(dir)
}

// FindAllPackages finds all the package paths in the given root directory.
func (c *Config) FindAllPackages(root string) ([]string, error) {
	var paths []string
	err := fs.WalkDir(os.DirFS(root), ".",
		func(path string, d os.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if path == "." {
				return nil
			}
			if slices.Contains(c.ExcludePackages, path) {
				return nil
			}
			if d.IsDir() && c.Matches(path) && c.IsPackageDir(path) {
				paths = append(paths, path)
				return nil
			}
			return nil
		})
	if err != nil {
		return []string{}, err
	}
	return paths, nil
}

// Changed returns the packages that have changed.
// It only returns packages that are matched by the config,
// and are not excluded by the config.
func (c *Config) Changed(log io.Writer, diffs []string) []string {
	changedUnique := make(map[string]bool)
	for _, diff := range diffs {
		if !c.Matches(diff) {
			continue
		}
		path := c.FindPackage(diff)
		if path == "." {
			fmt.Fprintf(log, "ℹ️ Global file changed: %q\n", diff)
		}
		changedUnique[path] = true
	}

	changed := make([]string, 0, len(changedUnique))
	for path := range changedUnique {
		if slices.Contains(c.ExcludePackages, path) {
			fmt.Fprintf(log, "ℹ️ Excluded package %q, skipping.\n", path)
			continue
		}
		changed = append(changed, path)
	}
	return changed
}

// Affected returns the packages that have been affected from diffs.
// If there are diffs on at leat one global file affecting all packages,
// then this returns all packages matched by the config.
func (c *Config) Affected(log io.Writer, diffs []string) ([]string, error) {
	paths := c.Changed(log, diffs)
	if slices.Contains(paths, ".") {
		fmt.Fprintf(log, "One or more global files were affected, all packages marked as affected.\n")
		allPackages, err := c.FindAllPackages(".")
		if err != nil {
			return nil, err
		}
		paths = allPackages
	}
	return paths, nil
}

func (c *Config) FindSetupFiles(paths []string) (*map[string]CISetup, error) {
	setups := make(map[string]CISetup, len(paths))
	for _, path := range paths {
		setup := make(CISetup, len(c.CISetupDefaults))
		for k, v := range c.CISetupDefaults {
			setup[k] = v
		}
		setupFile := filepath.Join(path, c.CISetupFileName)
		if c.CISetupFileName != "" && fileExists(setupFile) {
			// This mutates `setup` so there's no need to reassign it.
			// It keeps the default values if they're not in the JSON file.
			err := readJsonc(setupFile, &setup)
			if err != nil {
				return nil, err
			}
		}
		setups[path] = setup
	}
	return &setups, nil
}
