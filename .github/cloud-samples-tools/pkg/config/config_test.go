package config_test

import (
	c "cloud-samples-tools/pkg/config"
	"os"
	"path/filepath"
	"reflect"
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
		if test.fails && err == nil {
			t.Fatal("expected failure\n", got)
		}
		if !test.fails && err != nil {
			t.Fatal("error loading config\n", err)
		}
		if !reflect.DeepEqual(test.config, got) {
			t.Fatal("expected equal\n", test.config, "\n", got)
		}
	}
}

func TestSaveLoadConfig(t *testing.T) {
	file, err := os.CreateTemp("", "config-*.json")
	if err != nil {
		t.Fatal("error creating temp file\n", err)
	}
	defer os.Remove(file.Name())

	config := c.Config{
		PackageFile:     []string{"package.json"},
		Ignore:          []string{"node_modules/", "*.md"},
		Match:           []string{"*.js"},
		ExcludePackages: []string{"excluded"},
	}
	err = config.Save(file)
	if err != nil {
		t.Fatal("error saving config\n", err)
	}

	err = file.Close()
	if err != nil {
		t.Fatal("error closing file\n", err)
	}

	loadedConfig, err := c.LoadConfig(file.Name())
	if err != nil {
		t.Fatal("error loading config\n", err)
	}

	if !reflect.DeepEqual(&config, loadedConfig) {
		t.Fatal("expected equal\n", &config, "\n", loadedConfig)
	}
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
		if got != test.expected {
			t.Fatal("expected equal\n", test.expected, "\n", got)
		}
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
		if test.expected != got {
			t.Fatal("expected equal\n", test.expected, "\n", got)
		}
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
		if test.expected != got {
			t.Fatal("expected equal\n", test.expected, "\n", got)
		}
	}
}

func TestChanged(t *testing.T) {
	config := c.Config{
		PackageFile:     []string{"package.json"},
		Match:           []string{"*"},
		Ignore:          []string{"ignored.txt"},
		ExcludePackages: []string{filepath.Join("testdata", "excluded")},
	}

	tests := []struct {
		diffs    []string
		expected []string
	}{
		{ // Global change, everything is affected.
			diffs:    []string{filepath.Join("testdata", "file.txt")},
			expected: []string{"."},
		},
		{ // Ignored files should not trigger tests.
			diffs:    []string{filepath.Join("testdata", "ignored.txt")},
			expected: []string{},
		},
		{ // Single affected package.
			diffs:    []string{filepath.Join("testdata", "my-package", "file.txt")},
			expected: []string{filepath.Join("testdata", "my-package")},
		},
		{ // Single affected nested package.
			diffs:    []string{filepath.Join("testdata", "my-package", "subpackage", "file.txt")},
			expected: []string{filepath.Join("testdata", "my-package", "subpackage")},
		},
		{ // Excluded package.
			diffs:    []string{filepath.Join("testdata", "excluded", "file.txt")},
			expected: []string{},
		},
	}

	for _, test := range tests {
		got := config.Changed(os.Stderr, test.diffs)
		if !reflect.DeepEqual(test.expected, got) {
			t.Fatal("expected equal\n", test.expected, "\n", got)
		}
	}
}

func TestFindSetupFiles(t *testing.T) {
	config := c.Config{
		PackageFile:     []string{"package.json"},
		CISetupFileName: "ci-setup.json",
		CISetupDefaults: c.CISetup{
			"my-number": 3.14,
			"my-string": "hello",
			"my-array":  []any{"a", "b", "c"},
		},
	}

	emptyPath := filepath.Join("testdata", "setup", "empty")
	defaultsPath := filepath.Join("testdata", "setup", "defaults")
	overridePath := filepath.Join("testdata", "setup", "override")
	paths := []string{emptyPath, defaultsPath, overridePath}
	expected := &map[string]c.CISetup{
		emptyPath: {
			"my-number": 3.14,
			"my-string": "hello",
			"my-array":  []any{"a", "b", "c"},
		},
		defaultsPath: {
			"my-number": 3.14,
			"my-string": "hello",
			"my-array":  []any{"a", "b", "c"},
		},
		overridePath: {
			"my-number": 3.14,
			"my-string": "custom-value",
			"my-array":  []any{"A", "B", "C"},
		},
	}

	got, err := config.FindSetupFiles(paths)
	if err != nil {
		t.Fatal("error finding setup files\n", err)
	}
	if !reflect.DeepEqual(expected, got) {
		t.Fatal("expected equal\n", expected, "\n", got)
	}
}
