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
	// Pattern to match filenames or directories.
	Match []string `json:"match"`

	// Pattern to ignore filenames or directories.
	Ignore []string `json:"ignore"`

	// Filename to look for the root of a package.
	Package []string `json:"package"`

	// Packages to always exclude.
	ExcludePackages []string `json:"exclude-packages"`
}

func LoadConfig(path string) (Config, error) {
	bytes, err := os.ReadFile(path)
	if err != nil {
		return Config{}, err
	}
	config, err := ParseConfig(bytes)
	if err != nil {
		return Config{}, err
	}
	return config, nil
}

func ParseConfig(source []byte) (Config, error) {
	var config Config
	err := json.Unmarshal(StripComments(source), &config)
	if err != nil {
		return Config{}, err
	}
	if config.Match == nil {
		config.Match = []string{"*"}
	}
	return config, nil
}

func StripComments(src []byte) []byte {
	re := regexp.MustCompile(`\s*// .*`)
	return re.ReplaceAll(src, []byte{})
}

func match(patterns []string, path string) bool {
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

func (c Config) Matches(path string) bool {
	return match(c.Match, path) && !match(c.Ignore, path)
}

func (c Config) IsPackageDir(dir string) bool {
	for _, filename := range c.Package {
		packageFile := filepath.Join(dir, filename)
		if fileExists(packageFile) {
			return true
		}
	}
	return false
}

func (c Config) FindPackage(path string) string {
	dir := filepath.Dir(path)
	if dir == "." || c.IsPackageDir(dir) {
		return dir
	}
	return c.FindPackage(dir)
}

func fileExists(path string) bool {
	if _, err := os.Stat(path); errors.Is(err, os.ErrNotExist) {
		return false
	}
	return true
}
