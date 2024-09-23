package utils

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	// Filenames to ignore, can include wildcard `*` stars.
	Match []string `json:"match"`

	// Filenames to ignore, can include wildcard `*` stars.
	Ignore []string `json:"ignore"`

	// Filename to look for the root of a package.
	Package []string `json:"package"`

	// Actions to run including the given commands.
	Actions map[string][]struct {
		Command string   `json:"command"`
		Args    []string `json:"args"`
	} `json:"actions"`
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

func ParseConfig(configFile []byte) (Config, error) {
	var config Config
	err := json.Unmarshal(configFile, &config)
	if err != nil {
		return Config{}, err
	}
	if config.Match == nil {
		config.Match = []string{"*"}
	}
	return config, nil
}

func match(patterns []string, path string) bool {
	for _, pattern := range patterns {
		if match, _ := filepath.Match(pattern, path); match {
			return true
		}
		if strings.Contains(path, pattern) {
			return true
		}
	}
	return false
}

func (c Config) Matches(path string) bool {
	filename := filepath.Base(path)
	return match(c.Match, filename) && !match(c.Ignore, filename)
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
