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

import glob
import os
import re
import subprocess
from logging import Logger
from pathlib import Path

from synthtool import shell
from synthtool.log import logger

logger: Logger = logger

_TOOLS_DIRECTORY = "/synthtool"
_EXCLUDED_DIRS = [r"node_modules", r"^\."]
_TRIM_EXPRESSIONS = [
    "s/export {};$/\\n/",
]
_TYPELESS_EXPRESSION = r"Generated (.*)"
_NPM_CONFIG_CACHE = "/var/tmp/.npm"


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
                ["git", "fetch", "origin", "main:main", "--deepen=200"], check=False
            )
            output.check_returncode()
        except subprocess.CalledProcessError as error:
            if error.returncode == 128:
                logger.info(f"Error: ${error.output}; skipping fetching main")
            else:
                raise error
    for path_object in dir.glob("**/package.json"):
        object_dir = str(Path(path_object).parents[0])
        if (
            path_object.is_file()
            and object_dir != str(dir)
            and not re.search(
                "(?:% s)" % "|".join(packages_to_exclude), str(Path(path_object))
            )
        ):
            if search_for_changed_files:
                if (
                    subprocess.run(
                        ["git", "diff", "--quiet", "main...", object_dir], check=False
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


def typeless_samples_hermetic(targets: str, hide_output: bool = False) -> list[str]:
    """
    Converts TypeScript samples to JavaScript samples.

    Run this step before fix() and friends.
    Assumes that typeless-sample-bot is already installed in a well
    known location on disk (node_modules/.bin).
    This is currently an optional, opt-in part of an individual repo's
    OwlBot.py, and must be called from there before calling owlbot_main.

    Args:
        targets: A list of directories to convert
        hide_output: Flag specifying whether stdout should be hidden

    Returns:
        A list of JavaScript files that were generated
    """
    logger.debug("Run typeless sample bot")

    ## Do not run bot when there are no TypeScript files
    if not any(glob.glob(f"{targets}/**/*.ts", recursive=True)):
        logger.debug("No TypeScript files in path. Skipping typeless bot.")
        return []

    proc: subprocess.CompletedProcess[str] = shell.run(
        [
            f"{_TOOLS_DIRECTORY}/node_modules/.bin/typeless-sample-bot",
            "--targets",
            targets,
            "--recursive",
        ],
        check=True,
        hide_output=True,  # Capture stdout
    )
    if not proc.stdout:
        return []
    if not hide_output:
        logger.debug(proc.stdout)
    return re.findall(_TYPELESS_EXPRESSION, proc.stdout)


def trim(files: list[str], hide_output: bool = False) -> None:
    """
    Fixes the formatting of generated JS files
    """
    logger.debug("Trim generated files")
    for file in files:
        logger.debug(f"Updating {file}")
        for expr in _TRIM_EXPRESSIONS:
            shell.run(
                ["sed", "-i", "-e", expr, f"{file}"],
                check=True,
                hide_output=hide_output,
            )


def fix_hermetic(targets: str = ".", hide_output: bool = False) -> None:
    """
    Fixes the formatting in the current Node.js library. It assumes that gts
    is already installed in a well known location on disk (node_modules/.bin).
    """
    logger.debug("Copy eslint config")
    shell.run(
        ["cp", "-r", f"{_TOOLS_DIRECTORY}/node_modules", "."],
        check=True,
        hide_output=hide_output,
    )
    logger.debug("Running fix...")
    shell.run(
        [f"{_TOOLS_DIRECTORY}/node_modules/.bin/gts", "fix", f"{targets}"],
        check=True,
        hide_output=hide_output,
    )


# Update typeless-sample-bot
old_path = os.getcwd()
os.chdir("/synthtool")
logger.debug("Update typeless sample bot [1.3.2]")
shell.run(["npm", "i", "@google-cloud/typeless-sample-bot@1.3.2"])
os.chdir(old_path)

# Avoid "Your cache folder contains root-owned files" error
os.environ["npm_config_cache"] = _NPM_CONFIG_CACHE

# Retrieve list of directories
dirs: list[str] = walk_through_owlbot_dirs(Path.cwd(), search_for_changed_files=True)
for d in dirs:
    logger.debug(f"Directory: {d}")
    # Run typeless bot to convert from TS -> JS
    f = typeless_samples_hermetic(targets=d)
    # Remove extra characters
    trim(files=f)
