cd ..
del MiniWarteschlangensimulator.exe
del MiniWarteschlangensimulator_Linux_MacOS.zip
call neu.cmd build --release
cd desktop-app
"C:\Program Files (x86)\NSIS\makensis.exe" Launcher.nsi
move MiniWarteschlangensimulator.exe ..
cd ..
move .\dist\MiniWarteschlangensimulator-release.zip MiniWarteschlangensimulator_Linux_MacOS.zip
rmdir /S /Q dist
cd desktop-app