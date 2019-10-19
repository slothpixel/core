#!/bin/bash

if [ -n "$DOCKER_USERNAME" ]; then
  echo $DOCKER_PASSWORD | docker login --username "$DOCKER_USERNAME" --password-stdin
  docker tag slothpixel/core:latest slothpixel/core:${TRAVIS_COMMIT}
  docker push slothpixel/core:${TRAVIS_COMMIT}
  docker push slothpixel/core:latest
fi