cd ..
del MiniWarteschlangensimulator.exe
call neu.cmd build --release
cd desktop-app
"C:\Program Files (x86)\NSIS\makensis.exe" Launcher.nsi
move MiniWarteschlangensimulator.exe ..
cd ..
rmdir /S /Q dist