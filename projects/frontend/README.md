# frontend

## Developing

1. `moon run dev`.
2. Scan the QR code on your phone.

## iOS Device Enrolment

Add the iPhone (https://docs.expo.dev/build/internal-distribution/#configure-app-signing):

```sh
moon run frontend:eas -- device:create
moon run frontend:eas -- device:rename
```

Add the device to the provisioning profile:

```
moon run frontend:eas -- build --profile=preview --platform=ios
```
