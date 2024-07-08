# app

## Developing

1. `moon run dev`.
2. Scan the QR code on your phone.

## iOS Device Enrolment

Add the iPhone (https://docs.expo.dev/build/internal-distribution/#configure-app-signing):

```sh
npx -y eas-cli device:create
npx -y eas-cli device:rename
```

Add the device to the provisioning profile:

```
npx -y eas-cli build --profile=preview --platform=ios
```
