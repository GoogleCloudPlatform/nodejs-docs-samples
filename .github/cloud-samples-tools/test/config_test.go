package test

import (
	c "cloud-samples-tools/pkg/config"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	tests := []struct {
		filename string
		config   *c.Config
		fails    bool
	}{
		{
			filename: "empty.json",
			fails:    true,
		},
		{
			filename: "default-values.json",
			config: &c.Config{
				PackageFile: []string{"package.json"},
				Match:       []string{"*"},
			},
		},
		{
			filename: "comments.jsonc",
			config: &c.Config{
				PackageFile: []string{"package.json"},
				Match:       []string{"*"},
			},
		},
	}

	for _, test := range tests {
		path := filepath.Join("testdata", "config", test.filename)
		got, err := c.LoadConfig(path)
		if test.fails {
			expectError(t, err)
			continue
		}
		ok(t, err)
		equals(t, test.config, got)
	}
}

func TestSaveLoadConfig(t *testing.T) {
	file, err := os.CreateTemp("", "config-*.json")
	ok(t, err)
	defer os.Remove(file.Name())

	config := c.Config{
		PackageFile:     []string{"package.json"},
		Ignore:          []string{"node_modules/", "*.md"},
		Match:           []string{"*.js"},
		ExcludePackages: []string{"excluded"},
	}
	err = config.Save(file)
	ok(t, err)

	loadedConfig, err := c.LoadConfig(file.Name())
	ok(t, err)

	equals(t, &config, loadedConfig)
}

func TestMatch(t *testing.T) {
	tests := []struct {
		patterns []string
		path     string
		expected bool
	}{
		{
			patterns: []string{},
			path:     "path/to/file.js",
			expected: false,
		},
		{
			patterns: []string{"*.js"},
			path:     "path/to/file.js",
			expected: true,
		},
		{
			patterns: []string{"path/to/"},
			path:     "path/to/file.js",
			expected: true,
		},
	}

	for _, test := range tests {
		got := c.Match(test.patterns, test.path)
		equals(t, test.expected, got)
	}
}

func TestIsPackage(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	tests := []struct {
		path     string
		expected bool
	}{
		{
			path:     filepath.Join("testdata", "path-does-not-exist"),
			expected: false,
		},
		{
			path:     filepath.Join("testdata", "my-package"),
			expected: true,
		},
	}

	for _, test := range tests {
		got := config.IsPackageDir(test.path)
		equals(t, test.expected, got)
	}
}

func TestFindPackage(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	tests := []struct {
		path     string
		expected string
	}{
		{
			path:     filepath.Join("testdata", "my-file.txt"),
			expected: ".",
		},
		{
			path:     filepath.Join("testdata", "my-package", "my-file.txt"),
			expected: filepath.Join("testdata", "my-package"),
		},
		{
			path:     filepath.Join("testdata", "my-package", "subpackage", "my-file.txt"),
			expected: filepath.Join("testdata", "my-package", "subpackage"),
		},
	}

	for _, test := range tests {
		got := config.FindPackage(test.path)
		equals(t, test.expected, got)
	}
}

func TestChanged(t *testing.T) {
	config := c.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}

	tests := []struct {
		diffs    []string
		expected []string
	}{
		{
			diffs:    []string{filepath.Join("testdata", "file.txt")},
			expected: []string{"."},
		},
		{
			diffs:    []string{filepath.Join("testdata", "my-package", "file.txt")},
			expected: []string{filepath.Join("testdata", "my-package")},
		},
		{
			diffs:    []string{filepath.Join("testdata", "my-package", "subpackage", "file.txt")},
			expected: []string{filepath.Join("testdata", "my-package", "subpackage")},
		},
	}

	for _, test := range tests {
		got := config.Changed(test.diffs)
		equals(t, test.expected, got)
	}
}
