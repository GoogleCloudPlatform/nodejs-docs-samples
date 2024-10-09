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

package utils

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"regexp"
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

// SaveConfig saves the config to the given file.
func SaveConfig(config Config, file *os.File) error {
	bytes, err := json.MarshalIndent(config, "", "  ")
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
func LoadConfig(path string) (Config, error) {
	config := Config{}

	// Read the JSONC file.
	sourceJsonc, err := os.ReadFile(path)
	if err != nil {
		return config, err
	}

	// Strip the comments and load the JSON.
	sourceJson := StripComments(sourceJsonc)
	err = json.Unmarshal(sourceJson, &config)
	if err != nil {
		return config, err
	}

	// Set default values if they are not set.
	if config.PackageFile == nil {
		return config, errors.New("package-file is required")
	}
	if config.Match == nil {
		config.Match = []string{"*"}
	}

	return config, nil
}

// StripComments removes comments from the given source.
func StripComments(src []byte) []byte {
	src = multiLineCommentsRegex.ReplaceAll(src, []byte{})
	return singleLineCommentsRegex.ReplaceAll(src, []byte{})
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
func (c Config) Matches(path string) bool {
	return Match(c.Match, path) && !Match(c.Ignore, path)
}

// IsPackageDir returns true if the path is a package directory.
func (c Config) IsPackageDir(dir string) bool {
	for _, filename := range c.PackageFile {
		packageFile := filepath.Join(dir, filename)
		if fileExists(packageFile) {
			return true
		}
	}
	return false
}

// FindPackage returns the package name for the given path.
func (c Config) FindPackage(path string) string {
	dir := filepath.Dir(path)
	if dir == "." || c.IsPackageDir(dir) {
		return dir
	}
	return c.FindPackage(dir)
}

// fileExists returns true if the file exists.
func fileExists(path string) bool {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return false
	}
	return true
}
