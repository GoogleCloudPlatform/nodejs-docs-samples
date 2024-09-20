package utils

import (
	"fmt"
	"os"
	"strings"
)

func ArgRequired(index int, errorMessage string) string {
	if len(os.Args) <= index {
		panic(errorMessage)
	}
	return os.Args[index]
}

func ArgWithDefault(index int, defaultValue string) string {
	if len(os.Args) <= index {
		return defaultValue
	}
	return os.Args[index]
}

func InterpolateArgs(args []string, values []string) []string {
	var result []string
	for _, arg := range args {
		for argIdx, value := range values {
			arg = strings.ReplaceAll(arg, fmt.Sprintf("$%d", argIdx+1), value)
		}
		if arg := strings.TrimSpace(strings.TrimSuffix(arg, "$@")); arg != "" {
			result = append(result, arg)
		}
		if strings.HasSuffix(arg, "$@") {
			result = append(result, values...)
		}
	}
	return result
}
