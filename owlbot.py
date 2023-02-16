# Copyright 2023 Google LLC
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

import re
import subprocess
from pathlib import Path

from synthtool import shell
from synthtool.log import logger

_TOOLS_DIRECTORY = "/synthtool"
_EXCLUDED_DIRS = [r"node_modules", r"^\."]
_TYPELESS_EXPRESSION = "s/export {};$//"


def walk_through_owlbot_dirs(dir: Path, search_for_changed_files: bool) -> list[str]:
    """
    Walks through all sample directories
    Returns:
    A list of directories
    """
    owlbot_dirs: list[str] = []
    packages_to_exclude = _EXCLUDED_DIRS
    if search_for_changed_files:
        try:
            # Need to run this step first in the post processor since we only clone
            # the branch the PR is on in the Docker container
            output = subprocess.run(
                ["git", "fetch", "origin", "main:main", "--deepen=200"]
            )
            output.check_returncode()
        except subprocess.CalledProcessError as e:
            if e.returncode == 128:
                logger.info(f"Error: ${e.output}; skipping fetching main")
            else:
                raise e
    for path_object in dir.glob("**/package.json"):
        object_dir = str(Path(path_object).parents[0])
        if path_object.is_file() and object_dir != str(dir) and not re.search(
            "(?:% s)" % "|".join(packages_to_exclude), str(Path(path_object))
        ):
            if search_for_changed_files:
                if (
                    subprocess.run(
                        [
                            "git",
                            "diff",
                            "--quiet",
                            "main...",
                            object_dir
                        ]
                    ).returncode
                    == 1
                ):
                    owlbot_dirs.append(object_dir)
            else:
                owlbot_dirs.append(object_dir)
    for path_object in dir.glob("owl-bot-staging/*"):
        owlbot_dirs.append(
            f"{Path(path_object).parents[1]}/packages/{Path(path_object).name}"
        )
    return owlbot_dirs


def typeless_samples_hermetic(output_path: str, targets: str, hide_output: bool=False) -> None:
    """
    Converts TypeScript samples in the current Node.js library
    to JavaScript samples. Run this step before fix() and friends.
    Assumes that typeless-sample-bot is already installed in a well
    known location on disk (node_modules/.bin).
    This is currently an optional, opt-in part of an individual repo's
    OwlBot.py, and must be called from there before calling owlbot_main.
    """
    logger.debug("Run typeless sample bot")
    shell.run(
        [
            f"{_TOOLS_DIRECTORY}/node_modules/.bin/typeless-sample-bot",
            "--outputpath",
            output_path,
            "--targets",
            targets,
            "--recursive",
        ],
        check=False,
        hide_output=hide_output,
    )
    shell.run(
        [
            "sed",
            "-e",
            _TYPELESS_EXPRESSION,
            f"{targets}/*.js"
        ],
        check=False,
        hide_output=hide_output,
    )



# Retrieve list of directories
dirs: list[str] = walk_through_owlbot_dirs(Path.cwd(), search_for_changed_files=True)
for d in dirs:
    logger.debug(f"Directory: {d}")
    # Run typeless bot to convert from TS -> JS
    typeless_samples_hermetic(output_path=d, targets=d)
