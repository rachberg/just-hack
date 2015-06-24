#!/bin/bash
rm -R preview
mkdir preview
cp -R css fonts images index.html js preview
mv preview ..
git checkout gh-pages
rm preview
mv ../preview .
