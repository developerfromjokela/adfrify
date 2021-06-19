build:
	NPM_CONFIG_ELECTRON_MIRROR="https://github.com/castlabs/electron-releases/releases/download/" electron-packager --overwrite --arch=x64 --platform=win32 . adfrify --out dist/
	NPM_CONFIG_ELECTRON_MIRROR="https://github.com/castlabs/electron-releases/releases/download/" electron-packager --overwrite --arch=x64 --platform=linux . adfrify --out dist/
	NPM_CONFIG_ELECTRON_MIRROR="https://github.com/castlabs/electron-releases/releases/download/" electron-packager --arch=x64 --platform=darwin . adfrify --out dist/

package:
	electron-installer-debian --src dist/adfrify-linux-x64 --config debcfg.json --arch amd64
