#!/bin/bash

# Exit on error
set -e

sudo docker-compose up -d && sleep 30 && sudo docker exec -it slothpixel-core sh -c 'npm run test'
