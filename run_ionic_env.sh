#!/bin/bash

SOURCE="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

docker run -p 8100:8100   -it -v $SOURCE:/ionicapp kusumoto/docker-ionic-android-sdk /bin/bash
