# Play Store Upload Checklist — My Reminders

Reference document for the Google Play Store release of `com.myreminderapp`.
This file lives in git; **never put passwords or the keystore file in this repo.**

---

## 1. Release pipeline — what is set up

| Item | Location | Notes |
|---|---|---|
| Release keystore | `android/app/release.keystore` | Gitignored. Do not commit. |
| Signing config | `android/app/build.gradle` → `signingConfigs.release` | Reads `MYAPP_RELEASE_*` from Gradle properties. |
| Release credentials | `C:\Users\HP Pavlion\.gradle\gradle.properties` | User-level, outside repo. Plaintext is OK because the file never enters git. |
| ABIs built | `android/gradle.properties` → `reactNativeArchitectures` | `armeabi-v7a, arm64-v8a, x86, x86_64` |
| Minify / shrink | `android/app/build.gradle` | `minifyEnabled true` + `shrinkResources true` on release. |
| CI workflow | `.github/workflows/android-build.yml` | Builds both APK and AAB. Requires four GitHub Secrets to actually sign in CI (see section 6). |
| Privacy policy URL | https://gist.github.com/rahul9890/2fea4b88f278125f24ba02ac7d288f80 | Public gist. Paste into Play Console. |
| On-device app name | `android/app/src/main/res/values/strings.xml` → `app_name` | Currently `My Reminders`. |

---

## 2. Keystore details (public values only — passwords are NOT here)

| Field | Value |
|---|---|
| File | `android/app/release.keystore` |
| Format | PKCS12 |
| Alias | `myreminderapp` |
| Key algorithm | RSA 2048-bit |
| Signature algorithm | SHA256withRSA |
| Validity | Until 2 Oct 2053 (10,000 days from issue) |
| Distinguished Name | `CN=MyReminderApp, OU=Mobile, O=MyReminderApp, L=Unknown, ST=Unknown, C=IN` |
| SHA-1 fingerprint | `4B:CD:3A:FD:13:CC:5C:51:F0:D3:F8:54:C0:43:1F:16:53:4B:47:6E` |
| SHA-256 fingerprint | `B1:93:E9:F7:8F:08:4A:6F:25:A8:8C:66:94:93:15:A6:A7:7E:87:A1:DF:6C:5B:D0:CF:0A:FA:9E:27:70:A6:22` |

**The store password unlocks both the keystore file and the alias** (PKCS12 limitation — only one password supported). Store the password in a password manager, not here.

**Losing this keystore = permanent loss of the ability to update this app on Play Store.** No recovery possible from Google.

---

## 3. Build commands

From `G:\React\MyReminderApp\android`:

```powershell
# Production AAB — upload this to Play Console
.\gradlew bundleRelease
# Output: app\build\outputs\bundle\release\app-release.aab

# Release APK — for sideloading test builds onto a device, not for upload
.\gradlew assembleRelease
# Output: app\build\outputs\apk\release\app-release.apk
```

Verify the AAB is correctly signed:

```powershell
jarsigner -verify -verbose:summary app\build\outputs\bundle\release\app-release.aab
# Should print: jar verified.
```

---

## 4. Sensitive permission declarations — Play Console form text

Paste these into Play Console when prompted. Reviewers also expect a 20–30 second demo video for `SYSTEM_ALERT_WINDOW`.

### SCHEDULE_EXACT_ALARM
Category: Calendar / Task management / Alarm

> This app is a personal reminder/task scheduler. The user sets an exact interval (e.g., every 30 minutes) at which they want to be reminded of their tasks. Exact alarms are required because inexact alarms can drift by 10+ minutes on modern Android, which defeats the purpose of a precise reminder. Reminders are scheduled only when the user enters an interval; the app does no background work outside this user-initiated schedule.

### SYSTEM_ALERT_WINDOW (Display over other apps)

> When a reminder fires, the app displays a small floating card containing the user's task list over whatever app is currently in the foreground. This lets the user see and dismiss the reminder without leaving their current task. The overlay is dismissible by the user, is only shown briefly when a reminder fires, and is never used for advertising or to obscure other apps' UI.

Demo: 20–30 sec MP4 showing tap "remind me every 1 minute" → minimize app → overlay appears → dismiss.

### FOREGROUND_SERVICE_SPECIAL_USE
Declared subtype (must match AndroidManifest):
> Displays a task reminder floating window over other apps

Justification:
> The foreground service exists solely to host the reminder overlay window for the short duration it is visible to the user. It is started when a user-scheduled alarm fires and stops as soon as the user dismisses the overlay or it auto-dismisses. It does not perform background data sync, location tracking, audio playback, or any other long-running task. None of the standard FOREGROUND_SERVICE_TYPE values describe this use case, which is why specialUse is appropriate.

### USE_FULL_SCREEN_INTENT
Category: Alarm / Reminder

> If a reminder fires while the device is locked, the app surfaces the reminder via a full-screen intent, mirroring the behavior of alarm-clock and timer apps. This ensures the user does not miss a time-sensitive reminder simply because their screen was off. The full-screen intent is triggered only by a user-set reminder at a user-chosen time, never by background processes or third parties.

---

## 5. Data Safety form

| Section | Answer |
|---|---|
| Personal info collected | None |
| Personal info shared | None |
| Data encrypted in transit | N/A — no data leaves the device |
| Data deletion mechanism | User can clear data from Android Settings → Apps → My Reminders → Storage. Uninstall also removes all data. |
| User content stored (reminder text) | Yes, on-device only, never transmitted |
| Directed at children | No |
| Uses ads / analytics / third-party SDKs | No |

---

## 6. Store listing copy

**Title (≤30 chars):** `Reminder — Tasks & Pop-Ups`
**Short description (≤80 chars):** `Repeating task reminders that pop up over any app, on time, every time.`
**Full description:** see section 3 of the previous prep notes / paste from saved draft.
**App category:** Productivity
**Tags:** reminder, productivity, todo, alarm, tasks
**Contact email:** rkumbhar911@gmail.com
**Privacy policy URL:** https://gist.github.com/rahul9890/2fea4b88f278125f24ba02ac7d288f80

---

## 7. Required store listing assets

| Asset | Spec | Status |
|---|---|---|
| App icon | 512×512 PNG, ≤1 MB | TODO |
| Feature graphic | 1024×500 JPG or PNG (no alpha) | TODO |
| Phone screenshots (min 2, max 8) | 16:9 or 9:16, 320–3840 px per side | TODO |
| 7-inch tablet screenshots | optional | optional |
| 10-inch tablet screenshots | optional | optional |
| Demo video for overlay permission | 20–30 sec MP4 on real device | TODO |

---

## 8. GitHub Secrets (only needed if you use the CI workflow)

To make `.github/workflows/android-build.yml` actually sign builds in CI, add these to repo Settings → Secrets and variables → Actions:

| Secret name | Value source |
|---|---|
| `RELEASE_KEYSTORE_BASE64` | Base64 of `android/app/release.keystore`. Generate on Windows: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("G:\React\MyReminderApp\android\app\release.keystore")) \| Set-Clipboard` |
| `RELEASE_KEY_ALIAS` | `myreminderapp` |
| `RELEASE_STORE_PASSWORD` | (the store password) |
| `RELEASE_KEY_PASSWORD` | (same as store password — PKCS12) |

---

## 9. Pre-upload TODO (current state)

- [ ] Rebuild AAB after `strings.xml` change (`.\gradlew bundleRelease`)
- [ ] Record 20–30 sec demo video of the floating overlay firing
- [ ] Capture 2+ phone screenshots (main list view, overlay firing, time picker)
- [ ] Design 512×512 app icon
- [ ] Design 1024×500 feature graphic
- [ ] Sideload release APK on real device and smoke-test (Notifee + overlay + boot receiver paths) — R8 minify is on
- [ ] Back up `release.keystore` to at least one location outside this machine
- [ ] Complete IARC content rating questionnaire in Play Console
- [ ] Upload AAB to internal testing track first, validate, then promote to production

---

## 10. Versioning

Current: `versionCode 1`, `versionName "1.0"` in `android/app/build.gradle`.

For each subsequent Play upload, **manually increment** `versionCode` (e.g., 1 → 2 → 3). `versionCode` must strictly increase. `versionName` is the user-visible string and can be anything (e.g., `1.0.1`, `1.1`, `2.0`).
