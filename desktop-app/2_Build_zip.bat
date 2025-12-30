cd ..
rem del MiniWarteschlangensimulator.exe
del MiniWarteschlangensimulator_Linux_MacOS.zip
call neu.cmd build --release
cd desktop-app
rem "C:\Program Files (x86)\NSIS\makensis.exe" Launcher.nsi
rem move MiniWarteschlangensimulator.exe ..
cd ..
move .\dist\MiniWarteschlangensimulator-release.zip MiniWarteschlangensimulator_Linux_MacOS.zip
rmdir /S /Q dist
cd desktop-app