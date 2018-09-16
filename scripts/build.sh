#!/bin/bash

# Exit on error
set -e

sudo docker build -t "slothpixel/core" . && sudo docker run -i slothpixel/core