# A powershell script for inspecting the source tree and generating test configs.

# Given something like 'a\b\c', return ['a', 'b', 'c']
function Explode-Path([string] $Path) {
    return $Path.Replace('\', '/').Split('/')
}

# Given a list of files, converts their paths into names of config files.
# Example: foo/bar/package.json => foo-bar.cfg.
function Collect-Names {
    # Use a dictionary to de-duplicate the directories.
    $names = @{}
    foreach ($item in $input) {
        $relPath = [string] (Resolve-Path -Relative (Split-Path -Parent $item))
        # Remove the '.\' at the beginning of the string.
        $dir = $relPath.Substring(2)
        # replace slashes with hyphenes.
        $name = $dir.Replace('/', '-').Replace('\', '-')
        $names[$name] = Explode-Path($dir)
    }
    return $names
}

Push-Location
try {
    Set-Location ..
    $packageJsons = Get-ChildItem -Recurse package.json
    $testDirs = Get-ChildItem -Recurse *test | Where-Object { Test-Path -Path $_ -PathType Container}
    $names = ($packageJsons + $testDirs | Collect-Names)
} finally {
    Pop-Location
}

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

foreach ($name in $names.Keys) {
    $pathFragments = $names[$name]
    if (-not $pathFragments[0]) { continue }
    # For some directories like appengine and functions, we put the configs
    # in subdirectories.  For others, we do not.
    $pathFragments -join '/'
    $configPath = if (Test-Path $pathFragments[0]) {
        $dir = $pathFragments[0]
        $n = $pathFragments.Count - 1
        $name = $pathFragments[1..$n] -join '-'
        "$dir/$name.cfg"
    } else {
        "$name.cfg"
    }
    $srcDir = $pathFragments -join '/'
    $template.Replace('cloudtasks', $srcDir) `
        | Out-File -FilePath $configPath -Encoding utf8 
}
