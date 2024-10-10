package test

import (
	c "cloud-samples-tools/pkg/config"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadConfigEmpty(t *testing.T) {
	path := filepath.Join("testdata", "config", "empty.json")
	_, err := c.LoadConfig(path)
	expectError(t, err)
}

func TestLoadConfigDefaultValues(t *testing.T) {
	path := filepath.Join("testdata", "config", "default-values.json")
	config, err := c.LoadConfig(path)
	ok(t, err)
	expected := c.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}
	equals(t, expected, config)
}

func TestLoadConfigComments(t *testing.T) {
	path := filepath.Join("testdata", "config", "comments.jsonc")
	config, err := c.LoadConfig(path)
	ok(t, err)
	expected := c.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}
	equals(t, expected, config)
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

	equals(t, config, loadedConfig)
}

func TestMatchNoPatterns(t *testing.T) {
	patterns := []string{}
	path := "path/to/file.js"
	assert(t, !c.Match(patterns, path), "match(%v, %v) = false")
}

func TestMatchFilePattern(t *testing.T) {
	patterns := []string{"*.js"}
	path := "path/to/file.js"
	assert(t, c.Match(patterns, path), "match(%v, %v) = true")
}

func TestMatchFilePath(t *testing.T) {
	patterns := []string{"path/to/"}
	path := "path/to/file.js"
	assert(t, c.Match(patterns, path), "match(%v, %v) = true")
}

func TestIsPackageDirNotExists(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	dir := "path-does-not-exist"
	assert(t, !config.IsPackageDir(dir), "config.IsPackageDir(%v) = false")
}

func TestIsPackageDirExists(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	dir := filepath.Join("testdata", "my-package")
	assert(t, config.IsPackageDir(dir), "config.IsPackageDir(%v) = true")
}

func TestFindPackageRoot(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	path := filepath.Join("testdata", "my-file.txt")
	equals(t, ".", config.FindPackage(path))
}

func TestFindPackageSubpackage(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	path := filepath.Join("testdata", "my-package", "subpackage", "my-file.txt")
	equals(t, "testdata/my-package/subpackage", config.FindPackage(path))
}

func TestChangedRoot(t *testing.T) {
	config := c.Config{PackageFile: []string{"package.json"}}
	diffs := []string{
		filepath.Join("testdata", "file.txt"),
	}
	got := config.Changed(diffs)
	expected := []string{"."}
	equals(t, expected, got)
}

func TestChangedPackage(t *testing.T) {
	config := c.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}
	diffs := []string{
		filepath.Join("testdata", "my-package", "file.txt"),
	}
	got := config.Changed(diffs)
	expected := []string{"testdata/my-package"}
	equals(t, expected, got)
}

func TestChangedSubpackage(t *testing.T) {
	config := c.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}
	diffs := []string{
		filepath.Join("testdata", "my-package", "subpackage", "file.txt"),
	}
	got := config.Changed(diffs)
	expected := []string{"testdata/my-package/subpackage"}
	equals(t, expected, got)
}
