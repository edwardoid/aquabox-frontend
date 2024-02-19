pushd %~dp0
set SCRIPT_DIR=%CD%
popd


docker run -p 8100:8100 -it -v %SCRIPT_DIR%:/ionicapp kusumoto/docker-ionic-android-sdk /bin/bash
