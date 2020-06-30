#!/bin/bash
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=$HOME/android-studio/jre
export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https://services.gradle.org/distributions/gradle-4.8.1-bin.zip
export PATH=$PATH:$JAVA_HOME/../gradle/gradle-5.1.1/bin

ionic cordova run android --device
