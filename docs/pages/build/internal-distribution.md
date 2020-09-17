---
title: Internal distribution
---

import TerminalBlock from '~/components/plugins/TerminalBlock';

Uploading your app to TestFlight and Google Play beta can be time consuming and can limiting (eg: TestFlight can only have one active build at a time). You can skip these services entirely by building binaries that can be downloaded and installed to physical devices directly from a web browser. EAS Build can help you with his by providing sharable URLs for your builds with instructions on how to get them running, so you can just share one URL with a teammate and it'll include all of the information they need to test the app.

> 😅 Installing an app on iOS is a bit trickier than on Android, but it's possible thanks to adhoc and enterprise provisioning profiles. We'll talk more about this later in this doc.

## Setting up internal distribution

### Configuring a build profile

Open up `eas.json` and add a new build profile for iOS and/or Android.

```json
{
  "builds": {
    "android": {
      "preview": {
        "workflow": "generic",
        /* @info valid values: store, internal. defaults to store */
        "distribution": "internal" /* @end */

      }
    },
    "ios": {
      "preview": {
        "workflow": "generic",
        /* @info valid values: store, internal. defaults to store */
        "distribution": "internal" /* @end */

      }
    }
  }
}
```

### Configuring app signing credentials for Android

This is no different from configuring app signing credentials for other types of builds.

### Configuring app signing credentials for iOS

**Using credentials.json?** If you are using local credentials, make sure you point your `credentials.json` to an ad-hoc or enterprise provisioning proifile that you generate through the Apple Developer portal.

We can configure our credentials by doing a dry run of our build:

<TerminalBlock cmd={['expo eas:build --profile preview --platform ios --dry-run']} />

When you reach the provisioning profile prompt, choose "Let Expo handle the process".

If your Apple Developer account has access to enteprise provisioning, you will be prompted to select between adhoc or enterprise provisioning.

#### Setting up enterprise provisioning

Enterprise provisioning is expensive and you probably don't have it, but if you do, this makes internal distribution much easier. Expo's credentials service will handle creating a provisioning profile and assigning to your app for future builds, no additional work is needed.

#### Setting up adhoc provisioning

Apps signed with an adhoc provisioning profile can be installed by any iOS device whose unique identifier (UDID) is registered with the profile.

When you select adhoc provisioning, we will create a new adhoc profile for you and include every device that is currently registered in your Apple Developer acccount in the profile. You will then be prompted to register a new device.

If the device you would like to distribute to is not currently registered, you can do it now. Scan the QR code that is presented in the terminal and follow the instructions on that page to register your device. When you're done, return to the terminal and press return to continue. You should see that your new device registration has been detected and added to the profile.

You can add another if you like, otherwise continue. The dry run will complete and exit, your app signing credentials are now created and linked to your app.

### Run a build with the internal build profile

Now that we have set up our build profile and app signing, running a build for internal distribution is just like any other build.

<TerminalBlock cmd={['# Create iOS and Android builds for internal distribution', 'expo eas:build --profile preview --platform all']} />

When the build completes, you will be given a URL that you can share with your team (provided that they have an Expo account and are part of your organization) to download and install the app.

When using iOS adhoc provisioning managed by Expo, if a teammate navigates to this URL on an iOS device that is not yet registered, they will be able to register their device and initiate a new build to include the updated profile that will run on their device. If the adhoc provisioning profile is not managed by Expo, the user will be asked to contact the organization admin in order to add their device UDID and create a new build compatible with their device.