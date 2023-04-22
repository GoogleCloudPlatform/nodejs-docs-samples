# Copyright 2023 Google LLC.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import subprocess
import re

DEP_CHECK_COMMAND = "depcheck"
DEPENDENCY_REGEX = r"\* (.*)\n"
UNUSED_DEP_HEADER_STR = "Unused dependencies"
UNUSED_DEV_DEP_HEADER_STR = "Unused devDependencies"
MISSING_HEADER_STR = "Missing dependencies"
BLOCK_DEP_LIST = ["c8", "pug"]
BLOCK_DIR = "node_modules"

def print_dependency(root, output):
    print(root)
    print(output)
    print("")
    # if UNUSED_HEADER_STR in output:
    #     split_str = output.split(MISSING_HEADER_STR)
    #     unused_substr = split_str[0]
    #     dependencies = re.findall(DEPENDENCY_REGEX, unused_substr)
    #     filtered_dependencies = [
    #         x for x in dependencies if not any(block in x for block in BLOCK_DEP_LIST)
    #     ]
    #     if filtered_dependencies:
    #         print(f'"{root}",{""",""".join(filtered_dependencies)}')


def find_dependencies():
    for root, _, files in os.walk("."):
        if BLOCK_DIR in root:
            continue
        if "package.json" in files:
            completedProcess = subprocess.run(
                DEP_CHECK_COMMAND,
                check=False,
                cwd=root,
                capture_output=True,
                shell=True,
            )
            output = completedProcess.stdout.decode("utf-8")
            print_dependency(root, output)


def main():
    find_dependencies()


if __name__ == "__main__":
    main()
