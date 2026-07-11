# Chewie on Android (Google Play internal testing)

Chewie is a web app wrapped in a native Android shell with **Capacitor** (the whole app is
bundled inside the APK/AAB, so there is no dependency on the hosted site). This guide gets a
signed **AAB** into your **Play Console → internal testing** track.

> You need your own **Google Play Developer account** (one-time ~$25). The steps below are
> yours to run in your Console — the build itself is automated here.

There are two ways to produce the AAB. **Path 1 (CI)** needs no local tools. **Path 2
(Android Studio)** is the classic click-through.

---

## Path 1 — Build the signed AAB in GitHub Actions (recommended)

### 1. Create an upload keystore (once)

On any machine with a JDK, run:

```bash
keytool -genkey -v -keystore chewie-upload.jks \
  -alias chewie -keyalg RSA -keysize 2048 -validity 10000
```

Pick a store password and a key password (they can be the same). **Keep this file and the
passwords safe** — you must reuse the same upload key for every future update.

### 2. Add four repository secrets

In GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Secret | Value |
|--------|-------|
| `CHEWIE_KEYSTORE_BASE64` | output of `base64 -w0 chewie-upload.jks` (a long one-line string) |
| `CHEWIE_STORE_PASSWORD` | your store password |
| `CHEWIE_KEY_ALIAS` | `chewie` |
| `CHEWIE_KEY_PASSWORD` | your key password |

### 3. Run the build

**Actions tab → “Build Android app (AAB + APK)” → Run workflow.** When it finishes, open the
run and download the **`chewie-android`** artifact. Inside:

- `app-release.aab` → upload to Play
- `app-debug.apk` → optional: copy to your phone and install to try it without Play

(If you skip the secrets, the workflow still runs but the AAB is **unsigned** and Play will
reject it — add the secrets to get a signed one.)

---

## Path 2 — Build in Android Studio

1. Install [Android Studio](https://developer.android.com/studio).
2. `npm ci && npm run build:app && npx cap sync android`
3. `npx cap open android` (opens the `android/` project).
4. **Build → Generate Signed App Bundle / APK → Android App Bundle.** Create/choose your upload
   keystore when prompted, then build the **release** bundle. The `.aab` lands in
   `android/app/release/`.

---

## Upload to Play internal testing

1. [Play Console](https://play.google.com/console) → **Create app** (name: *Chewie*, app, free).
2. Complete the minimal setup tasks Play asks for (privacy policy URL, content rating,
   data-safety form, target audience). Chewie stores everything **on the device** and needs no
   account — reflect that in the data-safety form.
3. Leave **Play App Signing** enabled (default). You upload with your *upload* key; Google
   manages the *app signing* key.
4. **Testing → Internal testing → Create new release → upload `app-release.aab`.**
5. **Testers:** add your own Google account (create an email list), save, and copy the
   **join link**. Open that link on your phone, accept, then install Chewie from Play.

Updates later: bump `versionCode` (and `versionName`) in
`android/app/build.gradle`, rebuild, and upload a new release.

---

## Notes

- App id: `nl.chewie.app` (change in `capacitor.config.ts` **before** the first upload if you
  want a different package name — it is permanent once uploaded).
- The app icon/splash use Capacitor defaults for now; a branded icon set is an easy follow-up.
- This wraps the same code as the installable PWA, so features stay in sync.
