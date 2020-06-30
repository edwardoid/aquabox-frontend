#!/bin/bash
export ANDROID_HOME=/home/esargsyan/Android/Sdk
export JAVA_HOME=/home/esargsyan/android-studio/jre
export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=file:///home/esargsyan/gradle-4.8.1-bin.zip
export PATH=$PATH:/home/esargsyan/gradle-4.8.1/bin

ionic cordova $1 android --device
