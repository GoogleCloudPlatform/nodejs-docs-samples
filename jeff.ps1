$pj = gci -Recurse package.json
foreach ($json in $pj) {
     $package = $pj | ConvertFrom-Json
     if ($package.scripts.test ) { # -or test or system_test subdirectory is present.
         # Generate path/../.cfg  Replace /s with -s.
         # Example foo/bar/package.json => foo-bar.cfg
         # Add to .kokoro/.
    } else {
        # Look for subfolder test or tests...
        # Repeat above.
     }
}


# Replace cloudtasks with "foo/bar"
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
