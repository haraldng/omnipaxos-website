#!/bin/bash
# This sh file should be executed at the root/utils path

# Pull docs of OmniPaxos
# 'omnidocs/': temporarily stores docs of OmniPaxos
echo "ls -l"
ls -l

rm -rf omnidocs
mkdir -p omnidocs

sleep 3
# Fetch from the OmniPaxos repository
git clone https://github.com/haraldng/omnipaxos.git
mv omnipaxos/docs/ omnidocs/
# @temp
#git checkout doc_sync_to_website
rm -rf omnipaxos

echo "ls -l"
ls -l

echo "ls -l omnidocs/docs [before]"
ls -l omnidocs/docs

## gen docs
npm install js-yaml fs
node gen_doc.js

#git config user.name "TimXLHan"
#git config user.email "tim.han.0000@gmail.com"
## push changes
#if git diff --quiet; then
#  echo "No changes in the working tree."
#else
#  echo "Changes found in the working tree."
#  cd .. # move back to root directory
#  git add . -v
#  git commit -m "Doc updates"
#  git push
#fi
