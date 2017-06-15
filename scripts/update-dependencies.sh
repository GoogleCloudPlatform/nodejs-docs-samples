# For all directories containing a package.json file that aren't in a "node_modules" folder:
#   Update dependencies in package.json (ncu -u)
#   If no files in that directory have changed, skip it (! git diff --quiet --exit-code .)
#   Update dependencies in node_modules (yarn upgrade)
#   Run tests, and skip that directory if they fail (yarn test -- --fail-fast)
#   If the directory has not been skipped, add 'yarn.lock' and 'package.json' to the current commit
find . -name "package.json" -not -path "*/node_modules/*" -execdir sh -c "ncu -u && ! git diff --quiet --exit-code . && yarn upgrade && yarn test -- --fail-fast && git add package.json yarn.lock" \;

# Note: this script deliberately avoids including broken dependencies.