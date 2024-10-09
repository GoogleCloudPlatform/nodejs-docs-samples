package test

import (
	"path/filepath"
	"samples-tools/pkg/utils"
	"testing"
)

func TestChangedRoot(t *testing.T) {
	config := utils.Config{PackageFile: []string{"package.json"}}
	diffs := []string{
		filepath.Join("testdata", "file.txt"),
	}
	got := utils.Changed(config, diffs)
	expected := []string{"."}
	equals(t, expected, got)
}

func TestChangedPackage(t *testing.T) {
	config := utils.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}
	diffs := []string{
		filepath.Join("testdata", "my-package", "file.txt"),
	}
	got := utils.Changed(config, diffs)
	expected := []string{"testdata/my-package"}
	equals(t, expected, got)
}

func TestChangedSubpackage(t *testing.T) {
	config := utils.Config{
		PackageFile: []string{"package.json"},
		Match:       []string{"*"},
	}
	diffs := []string{
		filepath.Join("testdata", "my-package", "subpackage", "file.txt"),
	}
	got := utils.Changed(config, diffs)
	expected := []string{"testdata/my-package/subpackage"}
	equals(t, expected, got)
}
