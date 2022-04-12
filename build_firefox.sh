#!/bin/bash

# Builds glimpse-firefox
# Requires Node (version 16), npm (version 8), and npx

npm install
npx ng build --configuration production glimpse-firefox
