# A script for inspecting the source tree and generating test configs.
$packageJsons = Get-ChildItem -Recurse package.json
$testDirs = Get-ChildItem -Recurse *test | Where-Object { Test-Path -Path $_ -PathType Container}

function Collect-Names {
    # Use a dictionary to de-duplicate the directories.
    $names = @{}
    foreach ($item in $input) {
        $relPath = [string] (Resolve-Path -Relative (Split-Path -Parent $item))
        # replace slashes with hyphenes.
        $name = $relPath.Replace('/', '-')
        $name = $relPath.Replace('\', '-')
        # Remove the '.-' at the beginning of the string.
        $name = $name.Substring(2)
        $names[$name] = $true
    }
    return $names.Keys
}

$names = ($packageJsons + $testDirs | Collect-Names)

# Replace cloudtasks with "foo/bar"
$template = @'
# Format: //devtools/kokoro/config/proto/build.proto

# Set the folder in which the tests are run
env_vars: {
    key: "PROJECT"
    value: "cloudtasks"
}

# Tell the trampoline which build file to use.
env_vars: {
    key: "TRAMPOLINE_BUILD_FILE"
    value: "github/nodejs-docs-samples/.kokoro/build.sh"
}
'@

foreach ($name in $names) {
    $template.Replace('cloudtasks', $name) `
        | Out-File -FilePath ".kokoro/$name.cfg" -Encoding utf8 
}
