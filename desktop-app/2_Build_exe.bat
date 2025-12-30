cd ..
del MiniWarteschlangensimulator.exe

call neu.cmd build --release --embed-resources

move .\dist\MiniWarteschlangensimulator\MiniWarteschlangensimulator-win_x64.exe MiniWarteschlangensimulator.exe
rmdir /S /Q dist
cd desktop-app