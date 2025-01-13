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
	"regexp"
	"slices"
	"strings"
)

type Config struct {
	// Filename to look for the root of a package.
	PackageFile []string `json:"package-file"`

	// Pattern to match filenames or directories.
	Match []string `json:"match"`

	// Pattern to ignore filenames or directories.
	Ignore []string `json:"ignore"`

	// Packages to always exclude.
	ExcludePackages []string `json:"exclude-packages"`
}

var multiLineCommentsRegex = regexp.MustCompile(`(?s)\s*/\*.*?\*/`)
var singleLineCommentsRegex = regexp.MustCompile(`\s*//.*\s*`)

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
	// Read the JSONC file.
	sourceJsonc, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// Strip the comments and load the JSON.
	sourceJson := multiLineCommentsRegex.ReplaceAll(sourceJsonc, []byte{})
	sourceJson = singleLineCommentsRegex.ReplaceAll(sourceJson, []byte{})

	var config Config
	err = json.Unmarshal(sourceJson, &config)
	if err != nil {
		return nil, err
	}

	// Set default values if they are not set.
	if config.PackageFile == nil {
		return nil, errors.New("package-file is required")
	}
	if config.Match == nil {
		config.Match = []string{"*"}
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
		packageFile := filepath.Join(dir, filename)
		if fileExists(packageFile) {
			return true
		}
	}
	return false
}

// FindPackage returns the package name for the given path.
func (c *Config) FindPackage(path string) string {
	dir := filepath.Dir(path)
	if dir == "." || c.IsPackageDir(dir) {
		return dir
	}
	return c.FindPackage(dir)
}

// FindAllPackages finds all the packages in the given root directory.
func (c *Config) FindAllPackages(root string) ([]string, error) {
	var packages []string
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

// Affected returns the packages that have been affected from diffs.
// If there are diffs on at leat one global file affecting all packages,
// then this returns all packages matched by the config.
func (c *Config) Affected(log io.Writer, diffs []string) ([]string, error) {
	changed := c.Changed(log, diffs)
	if slices.Contains(changed, ".") {
		return c.FindAllPackages(".")
	}
	return changed, nil
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
		pkg := c.FindPackage(diff)
		changedUnique[pkg] = true
	}

	changed := make([]string, 0, len(changedUnique))
	for pkg := range changedUnique {
		if slices.Contains(c.ExcludePackages, pkg) {
			fmt.Fprintf(log, "ℹ️ Excluded package %q, skipping.\n", pkg)
			continue
		}
		changed = append(changed, pkg)
	}
	return changed
}
