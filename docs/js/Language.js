/*
Copyright 2023 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export {language, setLanguage, getCharacteristicsInfo}

/**
 * Object containing the language strings for the GUI in the selected language.
 */
let lang;

/* German */

const languageDE={};

lang=languageDE;

lang.dialog={};
lang.dialog.Ok="Ok";
lang.dialog.Cancel="Abbrechen";
lang.dialog.Yes="Ja";
lang.dialog.No="Nein";
lang.dialog.Error="Fehler";
lang.dialog.CloseWindow="Fenster schließen";

lang.restore={};
lang.restore.title="Modell wiederherstellen";
lang.restore.question="Soll das zuletzt bearbeitete Modell jetzt wiederhergestellt werden?";

lang.tabFile={};
lang.tabFile.title="Datei";
lang.tabFile.button="Datei";
lang.tabFile.buttonHint="Bietet Funktionen zum Laden und Speichern von Modellen an.";
lang.tabFile.modelFiles="Modelldateien";
lang.tabFile.modelNew="Neues leeres Modell";
lang.tabFile.modelLoad="Modell laden";
lang.tabFile.modelLoadDragDrop="Dateien hierhin ziehen";
lang.tabFile.modelSave="Modell speichern";
lang.tabFile.modelDiscardTitle="Aktuelles Modell verwerfen";
lang.tabFile.modelDiscardText="Soll das aktuelle Modell wirklich verworfen werden?";
lang.tabFile.examples="Beispiele laden";
lang.tabFile.exampleSimple="Einfaches Beispielmodell";
lang.tabFile.exampleControl="Steuerungsstrategien";
lang.tabFile.exampleImpatienceRetry="Ungeduld &amp; Wiederholer";
lang.tabFile.examplePolicy="Bedienreihenfolge";
lang.tabFile.examplePushPull="Push und Pull";
lang.tabFile.exampleBusStopp="Bus-Stopp-Paradoxon";
lang.tabFile.exampleGalton="Galtonbrett";
lang.tabFile.extended="Erweiterte Funktionen";
lang.tabFile.extendedParameterSeries="Parameterstudie";
lang.tabFile.extendedParameterSeriesPlotInfo="Per Klick auf die Einträge in der <b>Legende</b> können die Graphen der einzelnen Datenreihen ein- und ausgeblendet werden.";
lang.tabFile.extendedDownloadAppExe="App herunterladen (exe)";
lang.tabFile.extendedDownloadAppZip="App herunterladen (zip)";
lang.tabFile.extendedDownloadAppInfo="Mini Warteschlangensimulator als Anwendung zur Offline-Nutzung herunterladen";
lang.tabFile.help="Hilfe &amp; Info";
lang.tabFile.helpTutorial="Tutorial";
lang.tabFile.helpQueueingTheory="Warteschlangentheorie";
lang.tabFile.helpGlossary="Glossar";
lang.tabFile.helpInfo="Info &amp; Mehr";
lang.tabFile.helpInfoText1="Diese WebApp ist auf die Animation einfacher Warteschlangenmodelle beschränkt.";
lang.tabFile.helpInfoText2="Für die Simulation komplexerer Modelle inkl. einer detaillierten Statistikerfassung steht das Opensource Desktopprogramm <a href=\"https://a-herzog.github.io/Warteschlangensimulator\" target=\"_blank\" style=\"color: white; font-weight: bold;\">Warteschlangensimulator</a> zur Verfügung. <a href=\"https://a-herzog.github.io/Warteschlangensimulator\" target=\"_blank\"><img src=\"./images/Screenshot_QS_de.png\" title=\"Screenshot Warteschlangensimulator\" alt=\"Screenshot Warteschlangensimulator\" title=\"Screenshot Warteschlangensimulator\" alt=\"Screenshot Warteschlangensimulator\" loading=\"lazy\" width=\"200\" style=\"margin: 10px 0px;\"></a> Der Warteschlangensimulator kann die Modelle, die mit dieser Webapp erstellt wurden, zur Weiterverwendung importieren.";
lang.tabFile.helpInfoText3="Alle Simulationen laufen vollständig im Browser ab.<br>Diese WebApp führt nach dem Laden des HTML- und Skriptcodes keine weitere Kommunikation mit dem Server durch.";
lang.tabFile.helpHome="warteschlangensimulation.de";
lang.tabFile.helpHomeURL="https://warteschlangensimulation.de";
lang.tabFile.helpGitHub="GitHub";
lang.tabFile.helpGitHubURL="https://github.com/A-Herzog/MiniWarteschlangensimulator";
lang.tabFile.helpGitHubImprint="GitHub Impressum";
lang.tabFile.helpGitHubImprintURL="https://aka.ms/impressum";
lang.tabFile.helpGitHubPrivacy="GitHub Datenschutz";
lang.tabFile.helpGitHubPrivacyURL="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement";

lang.tabStation={};
lang.tabStation.title="Stationen hinzufügen";
lang.tabStation.button="<span class=\"menuButtonTitleLong\">Stationen hinzufügen</span><span class=\"menuButtonTitleShort\">Stationen</span>";
lang.tabStation.buttonHint="Zeigt die Seitenleiste zum Hinzufügen von Stationen an.";
lang.tabStation.info="Stationen können per Drag&amp;Drop aus der Seitenleiste gezogen werden.";
lang.tabStation.infoTouch="Beim Hinzufügen von Elementen per Touch erscheinen die Stationen erst beim Loslassen.";

lang.tabEdge={};
lang.tabEdge.title="Kanten hinzufügen";
lang.tabEdge.titleEdit="Kante";
lang.tabEdge.button="<span class=\"menuButtonTitleLong\">Kanten hinzufügen</span><span class=\"menuButtonTitleShort\">Kanten</span>";
lang.tabEdge.buttonHint="Aktiviert oder deaktiviert die Funktion zum Hinzufügen von Verbindungskanten.";
lang.tabEdge.info="Klicken Sie nacheinander das Start- und das Zielelement der neuen Kante an.";
lang.tabEdge.stop="Hinzufügen beenden";
lang.tabEdge.step1="Klicken Sie jetzt die <b>Startstation</b> für die Kante an.";
lang.tabEdge.step2="Klicken Sie jetzt die <b>Zielstation</b> für die Kante an.";
lang.tabEdge.delete="Kante löschen";
lang.tabEdge.editInfo1="Die gewählte Kante verbindet die Stationen";
lang.tabEdge.editInfo2="und";
lang.tabEdge.errorCircle="Eine Kante muss von einer Station zu einer anderen führen, nicht zurück zu sich selbst.";
lang.tabEdge.errorSource="Von dem <b>Startelement</b> aus kann keine Kante hinzugefügt werden.";
lang.tabEdge.errorDestination="Zu dem <b>Zielelement</b> kann keine Kante hinzugefügt werden.";

lang.tabAnimation={};
lang.tabAnimation.title="Animation";
lang.tabAnimation.button="Animation";
lang.tabAnimation.buttonHint="Startet oder beendet die Animation des Modell.";
lang.tabAnimation.buttonHintZoomIn="Vergrößert die Darstellung auf der Zeichenfläche.";
lang.tabAnimation.buttonHintZoomOut="Verkleinert die Darstellung auf der Zeichenfläche.";
lang.tabAnimation.speed="Geschwindigkeit";
lang.tabAnimation.playPauseInfo="Start/Pause";
lang.tabAnimation.StepInfo="Einzelschritt";
lang.tabAnimation.simulation="Simulation";
lang.tabAnimation.simulationTitle="Modell ohne Animation simulieren";
lang.tabAnimation.simulationText="Soll die Animation abgebrochen und stattdessen eine schnelle Simulation zur Generierung von Statistikdaten durchgeführt werden?";
lang.tabAnimation.simulationProgress1="Die Simulation läuft.";
lang.tabAnimation.simulationProgress2a="Es werden ";
lang.tabAnimation.simulationProgress2b=" Mio. Kundenankünfte simuliert.";
lang.tabAnimation.simulationProgress3a="Es werden ";
lang.tabAnimation.simulationProgress3b=" Modelle mit je ";
lang.tabAnimation.simulationProgress3c=" Mio. Kundenankünften simuliert.";
lang.tabAnimation.simulationCancel="Simulation abbrechen";
lang.tabAnimation.simulationWebWorkerError="Die Simulation konnte nicht ausgeführt werden, da kein WebWorker angelegt werden konnte.<br>Der Simulator kann nicht lokal ausgeführt werden, sondern muss über einen Webserver ausgeliefert werden.";
lang.tabAnimation.simulationResults="Simulationsergebnisse";
lang.tabAnimation.simulationDropDown="Anzahl an zu simulierenden Ankünften";
lang.tabAnimation.simulationDropDown1Mio="Wenige (1 Mio.)";
lang.tabAnimation.simulationDropDown5Mio="Mehr (5 Mio.)";
lang.tabAnimation.simulationDropDown10Mio="Viele (10 Mio.)";
lang.tabAnimation.simulationDropDown25Mio="Sehr viele (25 Mio.)";
lang.tabAnimation.simulationDropDown100Mio="Extrem viele (100 Mio.)";
lang.tabAnimation.allData="Details anzeigen";
lang.tabAnimation.time="Simulierte Zeit";
lang.tabAnimation.timePlain="Zeit";
lang.tabAnimation.events="Simulierte Ereignisse";
lang.tabAnimation.eventsPerThreadPerSecond="Simulierte Ereignisse pro Thread pro Sekunde";
lang.tabAnimation.count="Anzahl";
lang.tabAnimation.threads="Genutzte Anzahl an Threads";
lang.tabAnimation.runTime="Laufzeit";
lang.tabAnimation.copy="In Zwischenablage kopieren";
lang.tabAnimation.resultsFile="Ergebnisse.txt";

lang.canvasInfoLang="An <a href=\"index.html\" onclick=\"localStorage.setItem('selectedLanguage','default')\" style=\"color: blue;\">English version</a> of this simulator is also available.";
lang.canvasInfo=`
Das Modell ist momentan leer.<br><br><small>
<u>Möglichkeit 1:</u><br>
Ziehen Sie Stationen aus der Seitenleiste links auf diese Zeichenfläche.<br>
Beginnen Sie mit einer <b style='color: green;'>Quelle</b>, einer <b style='color: blue;'>Bedienstation</b> und einem <b style='color: #C00;'>Ausgang</b>.<br>
Dann verknüpfen Sie diese über <b><i class='bi bi-share-fill' role='img' aria-hidden='true'></i> Kanten</b>.<br><br>
<u>Möglichkeit 2:</u><br>
Klicken Sie auf <b><i class='bi bi-house-door' role='img' aria-hidden='true'></i> Datei</b> und wählen Sie dort ein Beispielmodell aus.<br><br>
Nach dem Erstellen oder Laden eines Modells kann dieses über<br>die <b><i class='bi bi-play-circle' role='img' aria-hidden='true'></i> Animation</b>-Schaltfläche simuliert werden.
<br><br><br>
<u>Hilfe und Unterstützung:</u><br>
<ul>
  <li><button class="btn btn-link btn-sm" style="color: blue; padding: 0;" onclick="tabHomeHelpTutorial.click();">Einführung zum Mini Warteschlangensimulator</button></li>
  <li><button class="btn btn-link btn-sm" style="color: blue; padding: 0;" onclick="tabHomeHelpQT.click();">Grundkonzepte der Warteschlangentheorie</button></li>
  <li><button class="btn btn-link btn-sm" style="color: blue; padding: 0;" onclick="tabHomeHelpGlossary.click();">Glossar der Warteschlangentheorie</button></li>
</ul>
</small>`;

lang.templates={};
lang.templates.source="Quelle";
lang.templates.sourceHint="Generiert eintreffende Kunden und stellt damit den Startpunkt für jedes Modell dar.";
lang.templates.delay="Verzögerung";
lang.templates.delayHint="Verzögert an der Station eintreffende Kunden für eine einstellbare Zeitdauer."
lang.templates.process="Bedienstation";
lang.templates.processHint="An dieser Station werden Kunden durch ein einstellbare Anzahl an Bedienern bedient. Steht kein Bediener zur Verfügung, wenn ein Kunde eintrifft, so entsteht eine Warteschlange.";
lang.templates.decide="Verzweigen";
lang.templates.decideHint="Diese Station kann mehrere auslaufende Kanten besitzen. Eintreffende Kunden werden gemäß einstellbarer Regeln in die verschiedenen Richtungen aufgeteilt."
lang.templates.duplicate="Duplizieren";
lang.templates.duplicateHint="Diese Station kann mehrere auslaufende Kanten besitzen. Jeder eintreffende Kunde wird inkl. seiner Eigenschaften vervielfältigt und entlang jeder Ausgangskante weitergeleitet.";
lang.templates.counter="Zähler";
lang.templates.counterHint="Zählt alle Kunden, die diese Station passieren."
lang.templates.throughput="Durchsatz";
lang.templates.throughputHint="Erfasst den Durchsatz in Kunden pro Zeiteinheit an der Station."
lang.templates.dispose="Ausgang";
lang.templates.disposeHint="Endpunkt der Kunden in einem Modell. Alle Kunden müssen am Ende zu einer Ausgangsstation geleitet werden.";
lang.templates.batch="Batch";
lang.templates.batchHint="Fasst Kunden zu Gruppen einer einstellbaren Größe zusammen. Diese Gruppen bewegen sich danach, bis sie an einer \"Trennen\"-Station wieder aufgelöst werden, wie ein einziger Kunde durch das System.";
lang.templates.separate="Trennen";
lang.templates.separateHint="Löst Kundengruppen, die an einer \"Batch\"-Station gebildet wurden, wieder auf.";
lang.templates.signal="Signal";
lang.templates.signalHint="Passiert ein Kunde diese Station, so wird ein Signal ausgelöst auf dessen Basis Kunden, die an einer \"Schranke\"-Station warten, freigegeben werden können.";
lang.templates.barrier="Schranke";
lang.templates.barrierHint="Verzögert eintreffende Kunden so lange, bis an einer verknüpften \"Signal\"-Station ein Signal zur Freigabe der wartenden Kunden ausgelöst wird.";
lang.templates.signalSource="Signalquelle";
lang.templates.signalSourceHint="Generiert auf ein Signal hin eintreffende Kunden.";
lang.templates.text="Text";
lang.templates.diagram="Diagramm";
lang.templates.diagramSource="Datenquelle";
lang.templates.diagramSourceClients="aktuelle Anzahl an Kunden an der Station";

lang.editor={};
lang.editor.EI="Mittlere Zwichenankunftszeit";
lang.editor.CVI="Variationskoeffizient";
lang.editor.ES="Mittlere Bediendauer";
lang.editor.CVS="Variationskoeffizient";
lang.editor.EWT="Mittlere Wartezeittoleranz";
lang.editor.CVWT="Variationskoeffizient";
lang.editor.c="Anzahl an Bedienern";
lang.editor.b="Batch-Größe";
lang.editor.mode="Verzweigungsmodus";
lang.editor.modeLabel="Modus";
lang.editor.modeRandom="Zufällig";
lang.editor.modeMinNQ="Min NQ";
lang.editor.modeMinN="Min N";
lang.editor.modeMaxNQ="Max NQ";
lang.editor.modeMaxN="Max N";
lang.editor.modeCondition="Bedingung";
lang.editor.modeInfo="<b>Min/Max NQ</b>=Kunde wird zu der Folgestation mit der kürzesten/längsten Warteschlangenlänge geleitet.<br><b>Min/Max N</b>=Kunde wird der zu Folgestation, an der sich die wengisten/meisten Kunden befinden, geleitet.";
lang.editor.policy="Bedienreihenfolge";
lang.editor.policyLabel="Modus";
lang.editor.policyFIFO="FIFO";
lang.editor.policyRandom="Zufällig";
lang.editor.policyLIFO="LIFO";
lang.editor.policySJF="Shortest job first";
lang.editor.policyLJF="Longest job first";
lang.editor.rates="Im Modus \"zufällig\": Raten (durch \";\" getrennte Werte)"; // <br>Im Modus \"Bedingung\": Bedingungen (durch \";\" getrennte Werte)";
lang.editor.ratesLabel="Reihenfolge";
lang.editor.text="Anzuzeigender Text";
lang.editor.textInfo="Per <b>\\n</b> können Zeilenumbrüche erzeugt werden.";
lang.editor.fontSize="Schriftgröße (in pt)";
lang.editor.fontSizeLabel="Größe";
lang.editor.SuccessNextBox="Folgestation für erfolgreiche Kunden";
lang.editor.release="Initial freigeben";
lang.editor.releaseLabel="Anzahl";
lang.editor.signal="Auf Signal reagieren";
lang.editor.signalLabel=""; /* soll leer sein */
lang.editor.storeSignals="Wenn Station leer";
lang.editor.storeSignalsLabel=""; /* soll leer sein */
lang.editor.storeSignalsLabel2="Signal speichern";
lang.editor.source="Datenquelle";
lang.editor.sourceLabel=""; /* soll leer sein */
lang.editor.noSettings="Die Station besitzt keine Einstellungen.";
lang.editor.deleteStation="Station löschen";
lang.editor.xrange="Darzustellender Zeitbereich (in Stunden)";
lang.editor.xrangeLabel=""; /* soll leer sein */

lang.builder={};
lang.builder.unknownStationType="Unbekannter Stationstyp";
lang.builder.noSource="Das Modell besitzt keine Kundenquelle.<br>Ziehen Sie eine <b style='color: green;'>Quelle</b> auf die Zeichenfläche.";
lang.builder.stationError="Fehler an Station";
lang.builder.invalidModelTitle="Modell fehlerhaft";
lang.builder.invalidModelText="Das Modell ist fehlerhaft und kann daher nicht simuliert werden.<br><br><u>Fehlerbeschreibung:</u>";

lang.builderSource={};
lang.builderSource.edge="Die Quelle muss eine auslaufende Kante besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Quelle mit einer weiteren Station zu verbinden.";
lang.builderSource.EI="Die angegebene mittlere Zwischenankunftszeit <b>E[I]</b> ist ungültig.<br>Es muss eine <b>positive Zahl</b> angegeben werden.";
lang.builderSource.CVI="Der angegebene Variationskoeffizient der Zwischenankunftszeiten <b>CV[I]</b> ist ungültig.<br>Es muss eine <b>nichtnegative Zahl</b> angegeben werden.";
lang.builderSource.b="Die angegebene Batch-Größe <b>b</b> ist ungültig.<br>Es muss eine <b>positive Ganzzahl</b> angegeben werden.";

lang.builderDelay={};
lang.builderDelay.edge="Die Verzögerung-Station muss eine oder zwei auslaufende Kanten besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Station mit einer weiteren Station zu verbinden.";
lang.builderDelay.ES="Die angegebene mittlere Verzögerungsdauer <b>E[S]</b> ist ungültig.<br>Es muss eine <b>positive Zahl</b> angegeben werden.";
lang.builderDelay.CVS="Der angegebene Variationskoeffizient der Verzögerungsdauern <b>CV[S]</b> ist ungültig.<br>Es muss eine <b>nichtnegative Zahl</b> angegeben werden.";

lang.builderProcess={};
lang.builderProcess.edge="Die Bedienstation muss eine oder zwei auslaufende Kanten besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Station mit einer weiteren Station zu verbinden.";
lang.builderProcess.ES="Die angegebene mittlere Bediendauer <b>E[S]</b> ist ungültig.<br>Es muss eine <b>positive Zahl</b> angegeben werden.";
lang.builderProcess.CVS="Der angegebene Variationskoeffizient der Bediendauern <b>CV[S]</b> ist ungültig.<br>Es muss eine <b>nichtnegative Zahl</b> angegeben werden.";
lang.builderProcess.b="Die angegebene Batch-Größe <b>b</b> ist ungültig.<br>Es muss eine <b>positive Ganzzahl</b> angegeben werden.";
lang.builderProcess.c="Die angegebene Anzahl an Bedienern <b>c</b> ist ungültig.<br>Es muss eine <b>positive Ganzzahl</b> angegeben werden.";
lang.builderProcess.EWT="Die angegebene mittlere Wartezeittolerant <b>E[WT]</b> ist ungültig.<br>Es muss eine <b>positive Zahl</b> angegeben werden.";
lang.builderProcess.CVWT="Der angegebene Variationskoeffizient der Wartezeittoleranzen <b>CV[WT]</b> ist ungültig.<br>Es muss eine <b>nichtnegative Zahl</b> angegeben werden.";
lang.builderProcess.release="Die Anzahl an initial freizugebenden Kunden ist ungültig.<br>Es muss eine <b>nichtnegative Ganzzahl</b> angegeben werden.";
lang.builderProcess.signal="Das angegebene Signal, welches Freigaben auslösen soll, existiert nicht.";
lang.builderProcess.ServiceTimePriorityAndBatch="Priorisierung nach Bediendauer und Batch-Bedienungen können nicht gemeinsam verwendet werden.";

lang.builderDecide={};
lang.builderDecide.edge="Die Verzweigen-Station muss eine oder mehrere auslaufende Kanten besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Station mit einer weiteren Station zu verbinden.";
lang.builderDecide.mode="Der angegebene Verzweigungsmodus ist ungültig.";
lang.builderDecide.nextMin1="In den Modi \"Min NQ\", \"Min N\", \"Max NQ\" und \"Max N\" müssen auf die Verzweigen-Station jeweils <b>überall Bedienstationen</b> folgen. Die Folgestation <b>";
lang.builderDecide.nextMin2="</b> ist jedoch keine Bedienstation.";
lang.builderDecide.nextRandom1="Die angegebene Rate für Ausgang";
lang.builderDecide.nextRandom2="zu Station";
lang.builderDecide.nextRandom3="ist ungültig.<br>Es muss eine nichtnegative Zahl angegeben werden.";
lang.builderDecide.tooManyConditions="Zu viele Bedingungen. (Es muss genau eine Bedingung weniger angegeben werden als es Ausgänge gibt.)";

lang.builderDuplicate={};
lang.builderDuplicate.edge="Die Duplizieren-Station muss eine oder mehrere auslaufende Kanten besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Station mit einer weiteren Station zu verbinden.";

lang.builderBatch={};
lang.builderBatch.edge="Die Batch-Station muss eine oder zwei auslaufende Kanten besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Station mit einer weiteren Station zu verbinden.";
lang.builderBatch.b="Die angegebene Batch-Größe <b>b</b> ist ungültig.<br>Es muss eine <b>positive Ganzzahl</b> angegeben werden.";

lang.builderSeparate={};
lang.builderSeparate.edge="Die Trennen-Station muss eine oder zwei auslaufende Kanten besitzen.<br>Klicken Sie auf <b><i class='bi bi-share-fill'></i> Kanten hinzufügen</b>, um die Station mit einer weiteren Station zu verbinden.";

lang.examples={};
lang.examples.exampleSimple="Erlang-C-Beispielmodell";
lang.examples.exampleSimpleInfo="Dies ist ein einfaches Beispielmodell, welches analytisch exakt durch die Erlang-C-Formel beschrieben werden kann.";
lang.examples.exampleSimpleIndicators="Als Kenngrößen ergeben sich";
lang.examples.exampleSimpleEW="Mittlere Wartezeit";
lang.examples.exampleSimpleEV="Mittlere Verweilzeit";
lang.examples.exampleSimpleENQ="Mittlere Warteschlangenlänge";
lang.examples.exampleSimpleEN="Mittlere Anzahl an Kunden im System";
lang.examples.exampleControl="Vergleich verschiedener Steuerungsstrategien";
lang.examples.exampleControlRandom="Zufällige Auswahl der Schlange";
lang.examples.exampleControlFewestCustomers="Wenigste Kunden an der Station";
lang.examples.exampleControlBatchService="Batch-Bedienung";
lang.examples.exampleControlFastOperator="Doppelt so schneller Bediener";
lang.examples.exampleControlCombinedQueue="2 Bediener mit gemeinsamer Warteschlange";
lang.examples.exampleImpatienceRetry="Warteschlangenmodell mit Ungeduld und Wiederholern";
lang.examples.examplePolicy="Vergleich verschiedener Bedienreihenfolgen";
lang.examples.examplePolicyFIFO="FIFO";
lang.examples.examplePolicyRandom="Zufällig";
lang.examples.examplePolicyLIFO="LIFO";
lang.examples.examplePolicySJF="Shortest job first";
lang.examples.examplePolicyLJF="Longest job first";
lang.examples.examplePolicyInfo1="Sofern die Bedienzeiten nicht in die";
lang.examples.examplePolicyInfo2="Bestimmung der Bedienreihenfolge";
lang.examples.examplePolicyInfo3="einfließen (FIFO, LIFO, Zufall), besitzt";
lang.examples.examplePolicyInfo4="diese keinen Einfluss auf die mittleren";
lang.examples.examplePolicyInfo5="Wartezeiten, aber die Streuung der";
lang.examples.examplePolicyInfo6="Wartezeiten variiert sehr deutlich.";
lang.examples.examplePolicyInfo7="SJF und LJF hingegen führen auch zu";
lang.examples.examplePolicyInfo8="kürzeren bzw. längeren mittleren Wartezeiten.";
lang.examples.examplePushPull="Push- und Pull-Produktion";
lang.examples.examplePushPullInfo1="In dem oberen Strang werden die Kunden ohne Restriktionen zu den beiden Bedienstationen geleitet (Push-Produktion).";
lang.examples.examplePushPullInfo2="In dem unteren Strang sorgt die Schranke dafür, dass sich stets nur maximal drei Kunden an den beiden Bedienstationen befinden (Pull-Produktion).";
lang.examples.exampleBusStopp="Bus-Stopp-Paradoxon";
lang.examples.exampleBusStoppInfoPassengers="Passagiere";
lang.examples.exampleBusStoppInfoBusses="Busse";
lang.examples.exampleBusStoppInfoBusStopp="Haltestelle";
lang.examples.exampleBusStoppInfo1="Im Mittel trifft alle 5 Minuten ein Bus an der Haltestelle ein."
lang.examples.exampleBusStoppInfo2="(Die Abstände zwischen den Busankünften sind exponentiell verteilt.)"
lang.examples.exampleBusStoppInfo3="Wie lange muss ein Passagier, der zu einer zufälligen Zeit an der";
lang.examples.exampleBusStoppInfo4="Haltestelle eintrifft im Mittel warten?"
lang.examples.exampleGalton="Galtonbrett";
lang.examples.exampleGaltonInfo1="Ein Galtonbrett ist ein Modell zur Veranschaulichung der Binomialverteilung.";
lang.examples.exampleGaltonInfo2="Kugeln werden von oben in das Modell gefüllt. Auf jeder Ebene ist eine Verzweigung nach links oder";
lang.examples.exampleGaltonInfo3="rechts möglich. Am unteren Ende des Modells stellt sich näherungsweise eine Binomialverteilung ein.";

lang.series={};
lang.series.noParameter="Das Modell enthält keine Stationen mit variierbaren Parametern.";
lang.series.parameter="Zu variierender Parameter";
lang.series.parameterCurrentValue="Aktueller Wert";
lang.series.parameterIsInteger="Der Parameter ist <b>ganzzahlig</b>.";
lang.series.rangeStation="Gewählte Station";
lang.series.rangeProperty="Gewählte Eigenschaft an der Station";
lang.series.rangePropertyValue="Aktueller Wert der Eigenschaft";
lang.series.rangeStart="Startwert";
lang.series.rangeEnd="Endwert";
lang.series.rangeStep="Schrittweite";
lang.series.rangeStartError="Der <b>Startwert</b> ist ungültig.";
lang.series.rangeEndError="Der <b>Endwert</b> ist ungültig.";
lang.series.rangeStepError="Die <b>Schrittweite</b> ist ungültig.";
lang.series.rangeIntError="Es muss eine <b>positive Ganzzahl</b> angegeben werden.";
lang.series.rangeFloatError="Es muss eine <b>positive Zahl</b> angegeben werden.";
lang.series.rangeFloat0Error="Es muss eine <b>nichtnegative Zahl</b> angegeben werden.";
lang.series.rangeStartEndError="Der <b>Endwert</b> muss größer als der <b>Startwert</b> sein.";
lang.series.arrivalCountLabel="Ankünfte pro Schritt";
lang.series.arrivalCount1M="Wenige (1 Mio.)";
lang.series.arrivalCount5M="Mehr (5 Mio.)";
lang.series.arrivalCount10M="Viele (10 Mio.)";
lang.series.arrivalCount25M="Sehr viele (25 Mio.)";
lang.series.arrivalCountInfo="Je mehr Kundenankünfte pro Schritt simuliert werden, desto weniger schwanken am Ende die Ergebnisse, aber auch desto länger dauert die gesamte Simulation.";
lang.series.copyDiagram="Kopieren";
lang.series.saveDiagram="Speichern";
lang.series.copyDiagramTable="Diagrammdaten als Tabelle kopieren";
lang.series.saveDiagramTable="Diagrammdaten als Tabelle speichern";
lang.series.copyDiagramImage="Diagramm als Bild kopieren";
lang.series.copyDiagramImageError="Ihr Browser unterstützt das Kopieren von Bildern leider nicht.";
lang.series.saveDiagramImage="Diagramm als Bild speichern";

lang.statisticsInfo={};
lang.statisticsInfo.EW='Mittlere Wartezeit';
lang.statisticsInfo.ES='Mittlere Bediendauer';
lang.statisticsInfo.EV='Mittlere Verweilzeit';
lang.statisticsInfo.EN='Mittlere Anzahl an Kunden an der Station';
lang.statisticsInfo.ENQ='Mittlere Anzahl an Kunden in der Warteschlange an der Station';
lang.statisticsInfo.EcBusy='Mittlere Anzahl an belegten Bedienern';
lang.statisticsInfo.rho="Mittlere Auslastung der Bediener";
lang.statisticsInfo.SDW='Standardabweichung der Wartezeiten';
lang.statisticsInfo.SDS='Standardabweichung der Bediendauern';
lang.statisticsInfo.SDV='Standardabweichung der Verweilzeiten';
lang.statisticsInfo.SDN='Standardabweichung der Anzahl an Kunden an der Station';
lang.statisticsInfo.SDNQ='Standardabweichung der Anzahl an Kunden in der Warteschlange an der Station';
lang.statisticsInfo.SDcBusy='Standardabweichung der Anzahlen an belegten Bedienern';
lang.statisticsInfo.CVW='Variationskoeffizient der Wartezeiten';
lang.statisticsInfo.CVS='Variationskoeffizient der Bediendauern';
lang.statisticsInfo.CVV='Variationskoeffizient der Verweilzeiten';
lang.statisticsInfo.CVN='Variationskoeffizient der Anzahl an Kunden an der Station';
lang.statisticsInfo.CVNQ='Variationskoeffizient der Anzahl an Kunden in der Warteschlange an der Station';
lang.statisticsInfo.CVcBusy='Variationskoeffizient der Anzahlen an belegten Bedienern';
lang.statisticsInfo.MinW='Minimale Wartezeit';
lang.statisticsInfo.MinS='Minimale Bediendauer';
lang.statisticsInfo.MinV='Minimale Verweilzeit';
lang.statisticsInfo.MinN='Minimale Anzahl an Kunden an der Station';
lang.statisticsInfo.MinNQ='Minimale Anzahl an Kunden in der Warteschlange an der Station';
lang.statisticsInfo.MincBusy='Minimale Anzahl an belegten Bedienern';
lang.statisticsInfo.MaxW='Maximale Wartezeit';
lang.statisticsInfo.MaxS='Maximale Bediendauer';
lang.statisticsInfo.MaxV='Maximale Verweilzeit';
lang.statisticsInfo.MaxN='Maximale Anzahl an Kunden an der Station';
lang.statisticsInfo.MaxNQ='Maximale Anzahl an Kunden in der Warteschlange an der Station';
lang.statisticsInfo.MaxcBusy='Maximale Anzahl an belegten Bedienern';
lang.statisticsInfo.N='Aktuelle Anzahl an Kunden an der Station';
lang.statisticsInfo.NQ='Aktuelle Anzahl an Kunden in der Warteschlange an der Station';
lang.statisticsInfo.cBusy='Aktuelle Anzahl an belegten Bedienern';
lang.statisticsInfo.n='Anzahl an Ankünften an der Station';
lang.statisticsInfo.throughput='Durchsatz in Kunden pro Zeiteinheit an der Station';
lang.statisticsInfo.throughputName='Durchsatz';
lang.statisticsInfo.throughputPerSecond='Kunden/Sekunde';
lang.statisticsInfo.throughputPerMinute='Kunden/Minute';
lang.statisticsInfo.throughputPerHour='Kunden/Stunde';

/* English */

const languageEN={};

lang=languageEN;

lang.dialog={};
lang.dialog.Ok="Ok";
lang.dialog.Cancel="Cancel";
lang.dialog.Yes="Yes";
lang.dialog.No="No";
lang.dialog.Error="Error";
lang.dialog.CloseWindow="Close window";

lang.restore={};
lang.restore.title="Restore model";
lang.restore.question="Do you want to restore the last edited model now?";

lang.tabFile={};
lang.tabFile.title="File";
lang.tabFile.button="File";
lang.tabFile.buttonHint="Offers functions for loading and saving models.";
lang.tabFile.modelFiles="Model files";
lang.tabFile.modelNew="New empty model";
lang.tabFile.modelLoad="Load model";
lang.tabFile.modelLoadDragDrop="Drop files here";
lang.tabFile.modelSave="Save model";
lang.tabFile.modelDiscardTitle="Discard current model";
lang.tabFile.modelDiscardText="Do you really want to discard the current model?";
lang.tabFile.examples="Load example";
lang.tabFile.exampleSimple="Simple example model";
lang.tabFile.exampleControl="Control strategies";
lang.tabFile.exampleImpatienceRetry="Impatience &amp; Retry";
lang.tabFile.examplePolicy="Operating sequence";
lang.tabFile.examplePushPull="Push and pull";
lang.tabFile.exampleBusStopp="Hitchhiker’s paradox";
lang.tabFile.exampleGalton="Galton board";
lang.tabFile.extended="Extended features";
lang.tabFile.extendedParameterSeries="Parameter studies";
lang.tabFile.extendedParameterSeriesPlotInfo="By clicking on the entries in the <b>legend</b> the graphs of individual data series can be shown or hidden.";
lang.tabFile.extendedDownloadAppExe="Download app (exe)";
lang.tabFile.extendedDownloadAppZip="Download app (zip)";
lang.tabFile.extendedDownloadAppInfo="Download Mini Warteschlangensimulator as application for offline usage";
lang.tabFile.help="Help &amp; info";
lang.tabFile.helpTutorial="Tutorial";
lang.tabFile.helpQueueingTheory="Queueing theory";
lang.tabFile.helpGlossary="Glossary";
lang.tabFile.helpInfo="Info &amp; more";
lang.tabFile.helpInfoText1="This WebApp is limited to animating simple queueing models.";
lang.tabFile.helpInfoText2="For the simulation of more complex models including a detailed statistics recording the open source desktop program <a href=\"https://a-herzog.github.io/Warteschlangensimulator\" target=\"_blank\" style=\"color: white; font-weight: bold;\">Warteschlangensimulator</a> is available. <a href=\"https://a-herzog.github.io/Warteschlangensimulator\" target=\"_blank\"><img src=\"./images/Screenshot_QS_en.png\" loading=\"lazy\" width=\"200\" style=\"margin: 10px 0px;\"></a> Warteschlangensimulator can import the models created with this WebApp for further use.";
lang.tabFile.helpInfoText3="All simulations are performed entirely in the browser.<br>This WebApp does not perform any further communication with the server after loading the HTML and script code.";
lang.tabFile.helpHome="queueingsimulation.de";
lang.tabFile.helpHomeURL="https://queueingsimulation.de";
lang.tabFile.helpGitHub="GitHub";
lang.tabFile.helpGitHubURL="https://github.com/A-Herzog/MiniWarteschlangensimulator";
lang.tabFile.helpGitHubImprint="GitHub imprint";
lang.tabFile.helpGitHubImprintURL="https://aka.ms/impressum";
lang.tabFile.helpGitHubPrivacy="GitHub privacy";
lang.tabFile.helpGitHubPrivacyURL="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement";

lang.tabStation={};
lang.tabStation.title="Add stations";
lang.tabStation.button="<span class=\"menuButtonTitleLong\">Add stations</span><span class=\"menuButtonTitleShort\">Stations</span>";
lang.tabStation.buttonHint="Shows the sidebar for adding stations.";
lang.tabStation.info="Stations can be dragged and dropped from the sidebar.";
lang.tabStation.infoTouch="When adding elements via touch, the stations will appear on the drawing area on release.";

lang.tabEdge={};
lang.tabEdge.title="Add edges";
lang.tabEdge.titleEdit="Edge";
lang.tabEdge.button="<span class=\"menuButtonTitleLong\">Add edges</span><span class=\"menuButtonTitleShort\">Edges</span>";
lang.tabEdge.buttonHint="Activates or deactivates the function for adding connecting edges.";
lang.tabEdge.info="Click the start element and the target element of the new edge one after the other.";
lang.tabEdge.stop="Stop adding";
lang.tabEdge.step1="Now click the <b>origin station</b> for the edge.";
lang.tabEdge.step2="Now click the <b>destination station</b> for the edge.";
lang.tabEdge.delete="Delete edge";
lang.tabEdge.editInfo1="The selected edge connects the stations";
lang.tabEdge.editInfo2="and";
lang.tabEdge.errorCircle="An edge has to lead from one station to another, not back to itself.";
lang.tabEdge.errorSource="No edge can be added from the <b>origin element</b>.";
lang.tabEdge.errorDestination="No edge can be added to the <b>destination element</b>.";

lang.tabAnimation={};
lang.tabAnimation.title="Animation";
lang.tabAnimation.button="Animation";
lang.tabAnimation.buttonHint="Starts or stops the animation of the model.";
lang.tabAnimation.buttonHintZoomIn="Increases the size of the elements on the drawing surface.";
lang.tabAnimation.buttonHintZoomOut="Decreases the size of the elements on the drawing surface.";
lang.tabAnimation.speed="Speed";
lang.tabAnimation.playPauseInfo="Play/Pause";
lang.tabAnimation.StepInfo="Step";
lang.tabAnimation.simulation="Simulation";
lang.tabAnimation.simulationTitle="Simulate model without animation";
lang.tabAnimation.simulationText="Do you want to cancel the animation and run a fast simulation to generate statistical data instead?";
lang.tabAnimation.simulationProgress1="Simulation is running.";
lang.tabAnimation.simulationProgress2a="";
lang.tabAnimation.simulationProgress2b=" mio. client arrivals will be simulated.";
lang.tabAnimation.simulationProgress3a="";
lang.tabAnimation.simulationProgress3b=" models with ";
lang.tabAnimation.simulationProgress3c=" mio. client arrivals each will be simulated.";
lang.tabAnimation.simulationCancel="Cancel simulation";
lang.tabAnimation.simulationWebWorkerError="Failed to run the simulation because no WebWorker could be created.<br>The simulator cannot be run locally, but must be delivered via a web server.";
lang.tabAnimation.simulationResults="Simulation results";
lang.tabAnimation.simulationDropDown="Number of arrivals to be simulated";
lang.tabAnimation.simulationDropDown1Mio="Few (1 mio.)";
lang.tabAnimation.simulationDropDown5Mio="More (5 mio.)";
lang.tabAnimation.simulationDropDown10Mio="Many (10 mio.)";
lang.tabAnimation.simulationDropDown25Mio="Very many (25 mio.)";
lang.tabAnimation.simulationDropDown100Mio="Extremly many (100 mio.)";
lang.tabAnimation.allData="Show details";
lang.tabAnimation.time="Simulated time";
lang.tabAnimation.timePlain="Time";
lang.tabAnimation.events="Simulated events";
lang.tabAnimation.eventsPerThreadPerSecond="Simulated events per thread per second";
lang.tabAnimation.count="Count";
lang.tabAnimation.threads="Used number of threads";
lang.tabAnimation.runTime="Runtime";
lang.tabAnimation.copy="Copy to clipboard";
lang.tabAnimation.resultsFile="Results.txt";

lang.canvasInfoLang="Eine <a href=\"index_de.html\" onclick=\"localStorage.setItem('selectedLanguage','de')\" style=\"color: blue;\">deutsche Version</a> dieses Simulators stehen ebenfalls zur Verfügung.";
lang.canvasInfo=`
The model is currently empty.<br><br><small>
<u>Option 1:</u><br>
Drag stations from the sidebar on the left to this drawing surface.<br>
Start with a <b style='color: green;'>Source</b>, a <b style='color: blue;'>Process</b> station and an <b style='color: #C00;'>Exit</b>.<br>
Then link them using <b><i class='bi bi-share-fill' role='img' aria-hidden='true'></i> Edges</b>.<br><br>
<u>Option 2:</u><br>
Click on <b><i class='bi bi-house-door' role='img' aria-hidden='true'></i> File</b> and select an example model there.<br><br>
After creating or loading a model, it can be simulated using the<br><b><i class='bi bi-play-circle' role='img' aria-hidden='true'></i> Animation</b> button.
<br><br><br>
<u>Help and support:</u><br>
<ul>
  <li><button class="btn btn-link btn-sm" style="color: blue; padding: 0;" onclick="tabHomeHelpTutorial.click();">Introduction to Mini Warteschlangensimulator</button></li>
  <li><button class="btn btn-link btn-sm" style="color: blue; padding: 0;" onclick="tabHomeHelpQT.click();">Basic concepts of queueing theory</button></li>
  <li><button class="btn btn-link btn-sm" style="color: blue; padding: 0;" onclick="tabHomeHelpGlossary.click();">Glossary of queueing theory</button></li>
</ul>
</small>`;

lang.templates={};
lang.templates.source="Source";
lang.templates.sourceHint="Generates arriving customers and thus represents the starting point for each model.";
lang.templates.delay="Delay";
lang.templates.delayHint="Delays customers arriving at the station for an adjustable period of time."
lang.templates.process="Process";
lang.templates.processHint="At this station, customers are served by an adjustable number of operators. If no operator is available when a customer arrives, a queue is created.";
lang.templates.decide="Decide";
lang.templates.decideHint="This station can have several outgoing edges. Incoming customers are divided into the different directions according to adjustable rules."
lang.templates.duplicate="Duplicate";
lang.templates.duplicateHint="This station can have several outgoing edges. Each incoming customer is duplicated, including its properties, and forwarded along each outgoing edge.";
lang.templates.counter="Counter";
lang.templates.counterHint="Counts all customers passing this station."
lang.templates.throughput="Throughtput";
lang.templates.throughputHint="Records the throughput of customers per unit of time at the station."
lang.templates.dispose="Exit";
lang.templates.disposeHint="End point of the customers in a model. All customers must be routed to an exit station at the end.";
lang.templates.batch="Batch";
lang.templates.batchHint="Combines customers into groups of an adjustable size. These groups then move through the system as a single customer until they are dissolved again at a \Separate\” station.";
lang.templates.separate="Separate";
lang.templates.separateHint="Dissolves customer groups that were formed at a \“Batch\” station.";
lang.templates.signal="Signal";
lang.templates.signalHint="If a customer passes this station, a signal is triggered on the basis of which customers waiting at a \“barrier\” station can be released.";
lang.templates.barrier="Barrier";
lang.templates.barrierHint="Delays incoming customers until a signal is triggered at a linked \“Signal\” station to release the waiting customers.";
lang.templates.signalSource="Signal source";
lang.templates.signalSourceHint="Generates arriving customers on signals.";
lang.templates.text="Text";
lang.templates.diagram="Diagram";
lang.templates.diagramSource="data source";
lang.templates.diagramSourceClients="current number of customers at the station";

lang.editor={};
lang.editor.EI="Average inter-arrival time";
lang.editor.CVI="Coefficient of variation";
lang.editor.ES="Average service time";
lang.editor.CVS="Coefficient of variation";
lang.editor.EWT="Average waiting time tolerance";
lang.editor.CVWT="Coefficient of variationt";
lang.editor.c="Number of operators";
lang.editor.b="Batch size";
lang.editor.mode="Decide mode";
lang.editor.modeLabel="Mode";
lang.editor.modeRandom="Random";
lang.editor.modeMinNQ="Min NQ";
lang.editor.modeMinN="Min N";
lang.editor.modeMaxNQ="Max NQ";
lang.editor.modeMaxN="Max N";
lang.editor.modeCondition="Condition";
lang.editor.modeInfo="<b>Min/Max NQ</b>=Client is directed to the next station with the shortest/longest queue length.<br><b>Min/Max N</b>=Client is directed to the next station, where the fewest/most clients are located.";
lang.editor.policy="Operating sequence";
lang.editor.policyLabel="Mode";
lang.editor.policyFIFO="FIFO";
lang.editor.policyRandom="Random";
lang.editor.policyLIFO="LIFO";
lang.editor.policySJF="Shortest job first";
lang.editor.policyLJF="Longest job first";
lang.editor.rates="In mode \"random\": Rates (values divied by \";\")"; // <br>In mode \"condition\": conditions (values divied by \";\")";
lang.editor.ratesLabel="Sequence";
lang.editor.text="Text to be displayed";
lang.editor.textInfo="By writing <b>\\n</b> line-breaks can be generated.";
lang.editor.fontSize="Font size (in pt)";
lang.editor.fontSizeLabel="Size";
lang.editor.SuccessNextBox="Next station for successful clients";
lang.editor.release="Release initial";
lang.editor.releaseLabel="Count";
lang.editor.signal="Respond to signal";
lang.editor.signalLabel=""; /* soll leer sein */
lang.editor.storeSignals="If station is empty";
lang.editor.storeSignalsLabel=""; /* soll leer sein */
lang.editor.storeSignalsLabel2="Store signals";
lang.editor.source="Data source";
lang.editor.sourceLabel=""; /* soll leer sein */
lang.editor.noSettings="The station does not have any settings.";
lang.editor.deleteStation="Delete station";
lang.editor.xrange="Time range to be displayed (in hours)";
lang.editor.xrangeLabel=""; /* soll leer sein */

lang.builder={};
lang.builder.unknownStationType="Unknown station type";
lang.builder.noSource="The model has no client source station.<br>Drag a <b style='color: green;'>Source</b> to the drawing area.";
lang.builder.stationError="Error at station";
lang.builder.invalidModelTitle="Invalid model";
lang.builder.invalidModelText="The model is invalid and therefore cannot be simulated.<br><br><u>Error description:</u>";

lang.builderSource={};
lang.builderSource.edge="The source has to have an outgoing edge.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the source to another station.";
lang.builderSource.EI="The specified average inter-arrival time <b>E[I]</b> is invalid.<br>A <b>positive number</b> has to be entered.";
lang.builderSource.CVI="The specified coefficient of variation of the inter-arrival times <b>CV[I]</b> is invalid.<br>A <b>non-negative number</b> has to be entered.";
lang.builderSource.b="The specified batch size <b>b</b> is invalid.<br>A <b>positive integer number</b> has to be entered.";

lang.builderDelay={};
lang.builderDelay.edge="The delay station has to have an outgoing edge.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the station to another station.";
lang.builderDelay.ES="The specified average delay time <b>E[S]</b> is invalid.<br>A <b>positive number</b> has to be entered.";
lang.builderDelay.CVS="The specified coefficient of variation of the delay times <b>CV[S]</b> is invalid.<br>A <b>non-negative number</b> has to be entered.";

lang.builderProcess={};
lang.builderProcess.edge="The process station has to have one or two outgoing edges.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the station to another station.";
lang.builderProcess.ES="The specified average process time <b>E[S]</b> is invalid.<br>A <b>positive number</b> has to be entered.";
lang.builderProcess.CVS="The specified coefficient of variation of the process times <b>CV[S]</b> is invalid.<br>A <b>non-negative number</b> has to be entered.";
lang.builderProcess.b="The specified batch size <b>b</b> is invalid.<br>A <b>positive integer number</b> has to be entered.";
lang.builderProcess.c="The specified number of operators <b>c</b> is invalid.<br>A <b>positive integer number</b> has to be entered.";
lang.builderProcess.EWT="The specified average waiting time tolerance <b>E[WT]</b> is invalid.<br>A <b>positive number</b> has to be entered.";
lang.builderProcess.CVWT="The specified coefficient of variation of the waiting time tolerances <b>CV[WT]</b> is invalid.<br>A <b>non-negative number</b> has to be entered.";
lang.builderProcess.release="The number of clients to be released initially is invalid.<br>A <b>non-negative integer number</b> has to be entered.";
lang.builderProcess.signal="The specified signal, which should trigger releases, does not exist.";
lang.builderProcess.ServiceTimePriorityAndBatch="Prioritization by service time and batch service cannot be used together.";

lang.builderDecide={};
lang.builderDecide.edge="The decide station has to have one or more outgoing edges.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the station to another station.";
lang.builderDecide.mode="The specified decide mode is invalid.";
lang.builderDecide.nextMin1="In mode \"Min NQ\", \"Min N\", \"Max NQ\" and \"Max N\" <b>only process stations</b> are allowed to follow the decide station. The connected station <b>";
lang.builderDecide.nextMin2="</b> is not a process station.";
lang.builderDecide.nextRandom1="The rate specified for outgoing edge";
lang.builderDecide.nextRandom2="to station";
lang.builderDecide.nextRandom3="is invalid.<br>A <b>non-negative number</b> has to be entered.";
lang.builderDecide.tooManyConditions="To many conditions. (Exactly one condition less than the number of outputs have to be specified.)";

lang.builderDuplicate={};
lang.builderDuplicate.edge="The duplicate station has to have one or more outgoing edges.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the station to another station.";

lang.builderBatch={};
lang.builderBatch.edge="The batch station has to have an outgoing edge.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the station to another station.";
lang.builderBatch.b="The specified batch size <b>b</b> is invalid.<br>A <b>positive integer number</b> has to be entered.";

lang.builderSeparate={};
lang.builderSeparate.edge="The batch station has to have an outgoing edge.<br>Click on <b><i class='bi bi-share-fill'></i> Add edge</b> to connect the station to another station.";

lang.examples={};
lang.examples.exampleSimple="Erlang C example model";
lang.examples.exampleSimpleInfo="This is a simple example model which can be described analytically exactly by the Erlang C formula.";
lang.examples.exampleSimpleIndicators="The performance indicators are";
lang.examples.exampleSimpleEW="Mean waiting time";
lang.examples.exampleSimpleEV="Mean residence time";
lang.examples.exampleSimpleENQ="Mean queue length";
lang.examples.exampleSimpleEN="Mean number of clients in the system";
lang.examples.exampleControl="Comparison of different control strategies";
lang.examples.exampleControlRandom="Random queue selection";
lang.examples.exampleControlFewestCustomers="Fewest customers at the station";
lang.examples.exampleControlBatchService="Batch service";
lang.examples.exampleControlFastOperator="Twice as fast operator";
lang.examples.exampleControlCombinedQueue="2 operators with common queue";
lang.examples.exampleImpatienceRetry="Queueing model with impatience and retry";
lang.examples.examplePolicy="Comparison of different operating orders";
lang.examples.examplePolicyFIFO="FIFO";
lang.examples.examplePolicyRandom="Random";
lang.examples.examplePolicyLIFO="LIFO";
lang.examples.examplePolicySJF="Shortest job first";
lang.examples.examplePolicyLJF="Longest job first";
lang.examples.examplePolicyInfo1="If the service times are not used when";
lang.examples.examplePolicyInfo2="calculating the service order (FIFO, LIFO,";
lang.examples.examplePolicyInfo3="random), the service order has no influence";
lang.examples.examplePolicyInfo4="on the mean waiting times, but the variance.";
lang.examples.examplePolicyInfo5="SJF and LJF, on the other hand, also lead";
lang.examples.examplePolicyInfo6="to shorter or longer mean waiting times.";
lang.examples.examplePolicyInfo7="";
lang.examples.examplePolicyInfo8="";

lang.examples.examplePushPull="Push and pull production";
lang.examples.examplePushPullInfo1="In the upper line, clients are directed to the two process stations without restrictions (push production).";
lang.examples.examplePushPullInfo2="In the lower line, the barrier ensures that there are always only a maximum of three clients at the two process stations (pull production).";
lang.examples.exampleBusStopp="Hitchhiker’s paradox";
lang.examples.exampleBusStoppInfoPassengers="Passengers";
lang.examples.exampleBusStoppInfoBusses="Busses";
lang.examples.exampleBusStoppInfoBusStopp="Bus stop";
lang.examples.exampleBusStoppInfo1="On average, a bus arrives at the bus stop every 5 minutes."
lang.examples.exampleBusStoppInfo2="(The intervals between bus arrivals are exponentially distributed.)"
lang.examples.exampleBusStoppInfo3="How long does a passenger who arrives at the stop at a random time";
lang.examples.exampleBusStoppInfo4=" have to wait on average?"
lang.examples.exampleGalton="Galton board";
lang.examples.exampleGaltonInfo1="A Galton board is a model for visualizing the binomial distribution.";
lang.examples.exampleGaltonInfo2="Balls are filled into the model from above. Branching to the left or right is possible";
lang.examples.exampleGaltonInfo3="on each level. At the lower end of the model, a binomial distribution is approximated.";

lang.series={};
lang.series.noParameter="The model does not contain stations with variable parameters.";
lang.series.parameter="Parameter to be varied";
lang.series.parameterCurrentValue="Current value";
lang.series.parameterIsInteger="The parameter is <b>integer</b>.";
lang.series.rangeStation="Selected station";
lang.series.rangeProperty="Selected property at the station";
lang.series.rangePropertyValue="Current value of the property";
lang.series.rangeStart="Start value";
lang.series.rangeEnd="End value";
lang.series.rangeStep="Increment";
lang.series.rangeStartError="The <b>start value</b> is invalid.";
lang.series.rangeEndError="The <b>end value</b> is invalid.";
lang.series.rangeStepError="The <b>increment</b> is invalid.";
lang.series.rangeIntError="A <b>positive integer number</b> has to be entered.";
lang.series.rangeFloatError="A <b>positive number</b> has to be entered.";
lang.series.rangeFloat0Error="A <b>non-negative number</b> has to be entered.";
lang.series.rangeStartEndError="The <b>end value</b> has to be larger than the <b>start value</b>.";
lang.series.arrivalCountLabel="Arrivals per step";
lang.series.arrivalCount1M="Few (1 mio.)";
lang.series.arrivalCount5M="More (5 mio.)";
lang.series.arrivalCount10M="Many (10 mio.)";
lang.series.arrivalCount25M="Very many (25 mio.)";
lang.series.arrivalCountInfo="The more client arrivals are simulated per step, the less the results fluctuate in the end, but also the longer the entire simulation takes.";
lang.series.copyDiagram="Copy";
lang.series.saveDiagram="Save";
lang.series.copyDiagramTable="Copy diagram data as table";
lang.series.saveDiagramTable="Save diagram data as table";
lang.series.copyDiagramImage="Copy diagram image";
lang.series.copyDiagramImageError="Your browser does not support copying images to clipboard.";
lang.series.saveDiagramImage="Save diagram image";

lang.statisticsInfo={};
lang.statisticsInfo.EW='Mean waiting time';
lang.statisticsInfo.ES='Mean service time';
lang.statisticsInfo.EV='Mean residence time';
lang.statisticsInfo.EN='Mean number of clients at the station';
lang.statisticsInfo.ENQ='Mean number of clients in the queue at the station';
lang.statisticsInfo.EcBusy='Mean number of busy operators';
lang.statisticsInfo.rho="Mean utilization of the operators";
lang.statisticsInfo.SDW='Standard deviation of the waiting times';
lang.statisticsInfo.SDS='Standard deviation of the service times';
lang.statisticsInfo.SDV='Standard deviation of the residence times';
lang.statisticsInfo.SDN='Standard deviation of the number of clients at the station';
lang.statisticsInfo.SDNQ='Standard deviation of the number of clients in the queue at the station';
lang.statisticsInfo.SDcBusy='Standard deviation of the number of busy operators';
lang.statisticsInfo.CVW='Coefficient of variation of the waiting times';
lang.statisticsInfo.CVS='Coefficient of variation of the service times';
lang.statisticsInfo.CVV='Coefficient of variation of the residence times';
lang.statisticsInfo.CVN='Coefficient of variation of the number of clients at the station';
lang.statisticsInfo.CVNQ='Coefficient of variation of the number of clients in the queue at the station';
lang.statisticsInfo.CVcBusy='Coefficient of variation of number of busy operators';
lang.statisticsInfo.MinW='Minimum waiting time';
lang.statisticsInfo.MinS='Minimum service time';
lang.statisticsInfo.MinV='Minimum residence time';
lang.statisticsInfo.MinN='Minimum number of clients at the station';
lang.statisticsInfo.MinNQ='Minimum number of clients in the queue at the station';
lang.statisticsInfo.MincBusy='Minimum number of busy operators';
lang.statisticsInfo.MaxW='Maximum waiting time';
lang.statisticsInfo.MaxS='Maximum service time';
lang.statisticsInfo.MaxV='Maximum residence time';
lang.statisticsInfo.MaxN='Maximum number of clients at the station';
lang.statisticsInfo.MaxNQ='Maximum number of clients in the queue at the station';
lang.statisticsInfo.MaxcBusy='Maximum number of busy operators';
lang.statisticsInfo.N='Current number of clients at the station';
lang.statisticsInfo.NQ='Current number of clients in the queue at the station';
lang.statisticsInfo.cBusy='Current number of busy operators';
lang.statisticsInfo.n='Number of arrivals at the station';
lang.statisticsInfo.throughput='Throughput in customers per unit of time at the station';
lang.statisticsInfo.throughputName='Throughput';
lang.statisticsInfo.throughputPerSecond='customers/second';
lang.statisticsInfo.throughputPerMinute='customers/minute';
lang.statisticsInfo.throughputPerHour='customers/hour';

/* Activate language */

let language;

function setLanguage(useLanguage=null) {
  if (useLanguage!=null) {
    language=(useLanguage=='de')?languageDE:languageEN;
    return;
  }

  if (typeof(document)!='undefined') {
    language=(document.documentElement.lang=='de')?languageDE:languageEN;
    return;
  }

  language=languageEN;
}

setLanguage();

/* Performance indicator information */

/**
 * Generates the html code for an abbrevitation.
 * @param {String} str Text which is to be annotated
 * @param {String} info Information to be added to the text
 * @returns Html code
 */
function buildAbbr(str,info) {
  return "<abbr title='"+info+"'>"+str+"</abbr>";
}

/**
 * Generates the html code for a performance indicator with an abbrevitation.
 * @param {String} str Performance indicator text
 * @returns Html code
 */
function getCharacteristicsInfo(str) {
  if (str=='E[W]') return buildAbbr(str,language.statisticsInfo.EW);
  if (str=='E[S]') return buildAbbr(str,language.statisticsInfo.ES);
  if (str=='E[V]') return buildAbbr(str,language.statisticsInfo.EV);
  if (str=='E[N]') return buildAbbr(str,language.statisticsInfo.EN);
  if (str=='E[NQ]') return buildAbbr(str,language.statisticsInfo.ENQ);
  if (str=='E[cBusy]') return buildAbbr(str,language.statisticsInfo.EcBusy);
  if (str=='rho') return buildAbbr("&rho;",language.statisticsInfo.rho);
  if (str=='SD[W]') return buildAbbr(str,language.statisticsInfo.SDW);
  if (str=='SD[S]') return buildAbbr(str,language.statisticsInfo.SDS);
  if (str=='SD[V]') return buildAbbr(str,language.statisticsInfo.SDV);
  if (str=='SD[N]') return buildAbbr(str,language.statisticsInfo.SDN);
  if (str=='SD[NQ]') return buildAbbr(str,language.statisticsInfo.SDNQ);
  if (str=='SD[cBusy]') return buildAbbr(str,language.statisticsInfo.SDeBusy);
  if (str=='CV[W]') return buildAbbr(str,language.statisticsInfo.CVW);
  if (str=='CV[S]') return buildAbbr(str,language.statisticsInfo.CVS);
  if (str=='CV[V]') return buildAbbr(str,language.statisticsInfo.CVV);
  if (str=='CV[N]') return buildAbbr(str,language.statisticsInfo.CVN);
  if (str=='CV[NQ]') return buildAbbr(str,language.statisticsInfo.CVNQ);
  if (str=='CV[cBusy]') return buildAbbr(str,language.statisticsInfo.CVcBusy);
  if (str=='Min[W]') return buildAbbr(str,language.statisticsInfo.MinW);
  if (str=='Min[S]') return buildAbbr(str,language.statisticsInfo.MinS);
  if (str=='Min[V]') return buildAbbr(str,language.statisticsInfo.MinV);
  if (str=='Min[N]') return buildAbbr(str,language.statisticsInfo.MinN);
  if (str=='Min[NQ]') return buildAbbr(str,language.statisticsInfo.MinNQ);
  if (str=='Min[cBusy]') return buildAbbr(str,language.statisticsInfo.MincBusy);
  if (str=='Max[W]') return buildAbbr(str,language.statisticsInfo.MaxW);
  if (str=='Max[S]') return buildAbbr(str,language.statisticsInfo.MaxS);
  if (str=='Max[V]') return buildAbbr(str,language.statisticsInfo.MaxV);
  if (str=='Max[N]') return buildAbbr(str,language.statisticsInfo.MaxN);
  if (str=='Max[NQ]') return buildAbbr(str,language.statisticsInfo.MaxNQ);
  if (str=='Max[cBusy]') return buildAbbr(str,language.statisticsInfo.MaxcBusy);
  if (str=='N') return buildAbbr(str,language.statisticsInfo.N);
  if (str=='NQ') return buildAbbr(str,language.statisticsInfo.NQ);
  if (str=='cBusy') return buildAbbr(str,language.statisticsInfo.cBusy);
  if (str=='n') return buildAbbr(str,language.statisticsInfo.n);
  if (str=='throughput') return buildAbbr(language.statisticsInfo.throughputName,language.statisticsInfo.throughput);
  return str;
}
