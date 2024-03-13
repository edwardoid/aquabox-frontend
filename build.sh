#!/bin/bash
export ANDROID_HOME=/usr/lib/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools

# install modules refered in package.json
npm install --force

# build www folder
npm run build

# Build debug
ionic capacitor copy android && cd android && ./gradlew assembleDebug && cd ..


