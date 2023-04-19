#!/bin/bash
# This sh file should be executed at the root path of this repo.

# Pull docs of OmniPaxos
# 'omnidocs/': temporarily stores docs of OmniPaxos
rm -rf utils/omnidocs
# Fetch from the OmniPaxos repository
git clone https://github.com/haraldng/omnipaxos.git
cd omnipaxos
# @temp
#git checkout doc_sync_to_website
mv docs/ ../utils/omnidocs/
cd ..
rm -rf omnipaxos

# gen docs
npm install js-yaml fs
node utils/gen_doc.js

git config user.name "TimXLHan"
git config user.email "tim.han.0000@gmail.com"
# push changes
if git diff --quiet; then
  echo "No changes in the working tree."
else
  echo "Changes found in the working tree."
  git add . -v
  git commit -m "Doc updates"
  git push
fi
