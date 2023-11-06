#!/bin/bash
# This sh file should be executed at the root path of this repo.
set -e

local_repo_path="$1"

if [ -z "$local_repo_path" ]; then
  local_repo_path="../omnipaxos"
fi

if [ ! -d "$local_repo_path" ]; then
  echo "Error: The provided path or default path does not exist."
  exit 1
fi

# 'omnidocs/': temporarily stores docs of OmniPaxos
rm -rf utils/omnidocs

# Copy the docs directory from the local repository
cp -r "$local_repo_path/docs" utils/omnidocs

## gen docs
npm install js-yaml fs
node utils/gen_doc.js

## push changes
if git diff --quiet; then
  echo "No changes in the working tree."
else
  echo "Changes found in the working tree."
fi
