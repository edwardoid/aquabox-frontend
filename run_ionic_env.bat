pushd %~dp0
set SCRIPT_DIR=%CD%
popd


rem docker run -p 8100:8100   -it -v %SCRIPT_DIR%:/ionicapp kusumoto/docker-ionic-android-sdk /bin/bash


set IMAGE=ionic4

docker image build -t %IMAGE% --build-arg="IONIC_VERSION=latest" - < %SCRIPT_DIR%\Docker\Dockerfile

docker run --privileged ^
--name ionic ^
-p 8100:8100 ^
-v %SCRIPT_DIR%:/workdir ^
-it --rm %IMAGE%:latest ^
/bin/bash