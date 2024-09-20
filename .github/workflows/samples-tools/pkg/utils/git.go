package utils

import (
	"os/exec"
	"strings"
)

func Diffs(head string, main string) ([]string, error) {
	cmd := exec.Command("git", "--no-pager", "diff", "--name-only", head, main)
	output, err := cmd.Output()
	if err != nil {
		return []string{}, err
	}
	return strings.Split(string(output), "\n"), nil
}
