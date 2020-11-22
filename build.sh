#!/bin/bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin
export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
export PATH=$PATH:$ANDROID_SDK_ROOT/emulator

#export JAVA_HOME=/home/esargsyan/ionictests/android-studio/jre
#export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https://services.gradle.org/distributions/gradle-4.10.1-bin.zip
#export PATH=$PATH:$JAVA_HOME/../gradle/gradle-5.1.1/bin

ionic cordova run android -l --no-interactive --verbose  --port=8200
#ionic cordova app:ionic-cordova-build --platform=android
