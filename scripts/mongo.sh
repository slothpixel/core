#!/bin/bash

curl -sSL https://get.docker.com/ | sh

sudo mkdir -p /var/lib/mongodb
sudo mount -o discard,defaults /dev/disk/by-id/google-persistent-disk-1 /var/lib/mongodb

sudo docker run --name mongo --restart=always --log-opt max-size=1g -d --net=host -v /var/lib/mongodb:/var/lib/mongodb -e mongo
sudo docker start mongo
