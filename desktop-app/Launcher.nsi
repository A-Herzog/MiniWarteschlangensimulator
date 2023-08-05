!define PrgName "MiniWarteschlangensimulator"
!define PrgFileName "MiniWarteschlangensimulator"
!define PrgIcon "..\docs\favicon.ico"
!define Copyright "Alexander Herzog"

Name "${PrgName}"
Caption "${PrgName}"
Icon "${PrgIcon}"
OutFile "${PrgFileName}.exe"

VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PrgName}"
VIAddVersionKey "FileDescription" "${PrgName}"
VIAddVersionKey "LegalCopyright" "${Copyright}"
VIAddVersionKey "CompanyName" "${Copyright}"
VIAddVersionKey "FileVersion" "1.0"
VIAddVersionKey "InternalName" "${PrgName}"

ManifestDPIAware true
 
SilentInstall silent
AutoCloseWindow true
ShowInstDetails nevershow
;ShowInstDetails show

RequestExecutionLevel user

Section ""
  SetOutPath "$TEMP\${PrgName}"
  
  File "..\dist\MiniWarteschlangensimulator\MiniWarteschlangensimulator-win_x64.exe"
  File "..\dist\MiniWarteschlangensimulator\resources.neu"
  ; File "..\dist\MiniWarteschlangensimulator\WebView2Loader.dll"
  
  ExecWait "$TEMP\${PrgName}\MiniWarteschlangensimulator-win_x64.exe"
  
  RmDir /r "$TEMP\${PrgName}"
SectionEnd