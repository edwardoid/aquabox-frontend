pushd %~dp0
set SOURCE=%CD%
popd

set IMAGE=aquabox-frontend

docker build --progress=plain -t %IMAGE% - < .\Dockerfile.base

docker run --privileged -i -t -p 8100:8100 -v %SOURCE%:/ionicapp --rm %IMAGE% /bin/bash
