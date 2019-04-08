#!/bin/bash

# Exit on error
set -e

sudo docker run -d --privileged --name redis --net=host redis:5
sudo docker run -d --privileged --name mongo --net=host mongo
sudo docker build -t "slothpixel/core" . && sudo docker run -i slothpixel/core sh -c 'npm run test'