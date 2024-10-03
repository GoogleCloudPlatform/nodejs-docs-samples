package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"samples-tools/pkg/utils"
	"strings"
)

func main() {
	configFile := flag.String("config", "", "path to the config file")
	flag.Parse()

	if *configFile == "" {
		fmt.Fprintf(os.Stderr, "config file is required, please pass -config=path/to/config.jsonc\n")
		os.Exit(1)
	}

	cmd := flag.Arg(0)
	if cmd == "" {
		fmt.Fprintf(os.Stderr, "command is required, use positional arguments with %%s for the package placeholder\n")
		os.Exit(1)
	}

	args := flag.Args()[1:]

	config, err := utils.LoadConfig(*configFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error loading the config file, make sure it exists and it's valid: %v\n", err)
		os.Exit(1)
	}

	packages, err := utils.FindAllPackages(".", config)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error finding packages: %v\n", err)
	}

	failed := runAll(packages, cmd, args)
	fmt.Printf("Total tests: %v\nFailed tests: %v\n", len(packages), failed)
	if failed > 0 {
		os.Exit(1)
	}
}

func runAll(packages []string, cmd string, args []string) int {
	failures := utils.Map(packages, func(pkg string) string {
		// TODO(dcavazos): measure time spent on each test and print it along the results
		cmdArgs := make([]string, len(args))
		for i, arg := range args {
			if strings.Contains(arg, "%s") {
				cmdArgs[i] = fmt.Sprintf(arg, pkg)
			} else {
				cmdArgs[i] = arg
			}
		}
		output, err := exec.Command(cmd, cmdArgs...).CombinedOutput()
		if err != nil {
			fmt.Fprintf(os.Stderr, "%v\n❌ FAILED: %v\n%v\n> %v %v\n%v\n%v\n%v\n\n",
				strings.Repeat("=", 80),
				pkg,
				strings.Repeat("-", 80),
				cmd, cmdArgs,
				err,
				string(output),
				strings.Repeat("-", 80),
			)
			return pkg
		} else {
			fmt.Printf("✅ %v\n", pkg)
		}
		return ""
	})

	failed := 0
	for _, failure := range failures {
		if failure != "" {
			failed++
		}
	}
	return failed
}
