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

import {language} from './Language.js';
import {zoomIn, zoomOut, fileNew, fileLoad, fileLoadDrag, fileLoadDragEnter, fileLoadDragLeave, fileLoadDrop, fileSave, showFileSidebar, showTemplatesSidebar, showMoreSidebar, allowDrop, canvasDrop, addEdgeClick, canvasClick} from "./Editor.js";
import {loadExample} from "./Example.js";
import {startAnimation, animationPlayPause, animationSingleTimeStep, animationFastForward} from "./Animator.js";
import {processSeries} from "./Series.js";
import {isDesktopApp} from "./Tools.js";

/* Language */

modalMessageOkButton.innerHTML=" "+language.dialog.Ok;
modalConfirmationYesButton.innerHTML=" "+language.dialog.Yes;
modalConfirmationNoButton.innerHTML=" "+language.dialog.No;

tabHome.innerHTML=" "+language.tabFile.title;
tabHomeFileNew.innerHTML=" "+language.tabFile.modelNew;
fileLoadDropTarget.innerHTML=" "+language.tabFile.modelLoad+"<br><small>"+language.tabFile.modelLoadDragDrop+"</small>";
tabHomeFileSave.innerHTML=" "+language.tabFile.modelSave;
tabHomeExamples.innerHTML=language.tabFile.examples;
tabHomeExamples0.innerHTML=" "+language.tabFile.exampleSimple;
tabHomeExamples1.innerHTML=" "+language.tabFile.exampleControl;
tabHomeExamples2.innerHTML=" "+language.tabFile.exampleImpatienceRetry;
tabHomeExamples3.innerHTML=" "+language.tabFile.examplePolicy;
tabHomeExamples4.innerHTML=" "+language.tabFile.examplePushPull;
tabHomeExtended.innerHTML=language.tabFile.extended;
tabHomeParameterSeries.innerHTML=" "+language.tabFile.extendedParameterSeries;
tabHomeHelp.innerHTML=language.tabFile.help;
if (!isDesktopApp) {
  tabHomeHelpDownload.innerHTML=" "+language.tabFile.extendedDownloadApp;
  tabHomeHelpDownload.title=language.tabFile.extendedDownloadAppInfo;
} else {
  tabHomeHelpDownload.style.display="none";
}
tabHomeHelpInfo.innerHTML=" "+language.tabFile.helpInfo;
const infoPageUrl='info'+((document.documentElement.lang=='de')?'_de':'')+'.html';
tabHomeHelpQT.innerHTML=" "+language.tabFile.helpQueueingTheory;
tabHomeHelpQT.onclick=()=>{if (isDesktopApp) Neutralino.window.create('/'+infoPageUrl+'?qt'); else window.open(infoPageUrl+'?qt');}
tabHomeHelpGlossary.innerHTML=" "+language.tabFile.helpGlossary;
tabHomeHelpGlossary.onclick=()=>{if (isDesktopApp) Neutralino.window.create('/'+infoPageUrl+'?glossary'); else window.open(infoPageUrl+'?glossary');}

helpInfoText1.innerHTML=language.tabFile.helpInfoText1;
helpInfoText2.innerHTML=language.tabFile.helpInfoText2;
helpInfoURL.innerHTML=" "+language.tabFile.helpGitHub;
helpInfoURL.onclick=()=>{if (isDesktopApp) Neutralino.os.open(language.tabFile.helpGitHubURL); else window.open(language.tabFile.helpGitHubURL);}
if (!isDesktopApp) {
  helpInfoImprintURL.innerHTML=language.tabFile.helpGitHubImprint;
  helpInfoImprintURL.onclick=()=>window.open(language.tabFile.helpGitHubImprintURL);
  helpInfoPrivacyURL.innerHTML=language.tabFile.helpGitHubPrivacy;
  helpInfoPrivacyURL.onclick=()=>window.open(language.tabFile.helpGitHubPrivacyURL);
} else {
  helpInfoImprintURL.style.display="none";
  helpInfoPrivacyURL.style.display="none";
}
helpInfoQTURL.innerHTML=language.tabFile.helpHome;
helpInfoQTURL.onclick=()=>{if (isDesktopApp) Neutralino.os.open(language.tabFile.helpHomeURL); else window.open(language.tabFile.helpHomeURL);}
if (!isDesktopApp) helpInfoText3.innerHTML=language.tabFile.helpInfoText3;

tabStation.innerHTML=" "+language.tabStation.title;
tabStationInfo.innerHTML=language.tabStation.info+(("ontouchstart" in document.documentElement)?('<div style="font-size: 75%; margin-top: 10px;">('+language.tabStation.infoTouch+')</div>'):'');

tabEdge.innerHTML=" "+language.tabEdge.title;
tabEdgeInfo.innerHTML=language.tabEdge.info;
tabEdgeButton.innerHTML=" "+language.tabEdge.stop;

tabAnimation.innerHTML=" "+language.tabAnimation.title;
animationSpeedLabel.innerHTML=language.tabAnimation.speed;
animationPlayPauseButtonOuter.title=language.tabAnimation.playPauseInfo;
animationStepButtonOuter.title=language.tabAnimation.StepInfo;
animationFastForwardButton.innerHTML=" "+language.tabAnimation.simulation;
tabAnimationSimInfo.innerHTML=language.tabAnimation.simulationDropDown;
tabAnimationSim0.innerHTML=language.tabAnimation.simulationDropDown1Mio;
tabAnimationSim1.innerHTML="<b>"+language.tabAnimation.simulationDropDown5Mio+"</b>";
tabAnimationSim2.innerHTML=language.tabAnimation.simulationDropDown10Mio;
tabAnimationSim3.innerHTML=language.tabAnimation.simulationDropDown25Mio;
tabAnimationSim4.innerHTML=language.tabAnimation.simulationDropDown100Mio;

function initMenuButton(id, title, tooltip) {
  if (title!=null && title!="") document.querySelector("#"+id+" .menuButtonTitle").innerHTML=" "+title;
  document.querySelector("#"+id).title=tooltip;
}

initMenuButton('file_button',language.tabFile.button,language.tabFile.buttonHint);
initMenuButton('add_station',language.tabStation.button,language.tabStation.buttonHint);
initMenuButton('add_edge',language.tabEdge.button,language.tabEdge.buttonHint);
initMenuButton('animation_button',language.tabAnimation.button,language.tabAnimation.buttonHint);
initMenuButton('zoom_button_in',null,language.tabAnimation.buttonHintZoomIn);
initMenuButton('zoom_button_out',null,language.tabAnimation.buttonHintZoomOut);

/* Connecting module functions with click handlers */

zoom_button_in.onclick=()=>zoomIn();
zoom_button_out.onclick=()=>zoomOut();

tabHomeFileNew.onclick=()=>fileNew();
fileLoadDropTarget.onclick=()=>fileLoad();
fileLoadDropTarget.ondragover=e=>fileLoadDrag(e);
fileLoadDropTarget.ondragenter=e=>fileLoadDragEnter(e);
fileLoadDropTarget.ondragleave=e=>fileLoadDragLeave(e);
fileLoadDropTarget.ondrop=e=>fileLoadDrop(e);
tabHomeFileSave.onclick=()=>fileSave();

file_button.onclick=()=>showFileSidebar();
add_station.onclick=()=>showTemplatesSidebar();

tabHomeHelpInfo.onclick=()=>showMoreSidebar();

canvas_area.ondrop=e=>canvasDrop(e);
canvas_area.ondragover=e=>allowDrop(e);
canvas_area.onclick=e=>canvasClick(e);

tabEdgeButton.onclick=()=>addEdgeClick();
add_edge.onclick=()=>addEdgeClick();

tabHomeExamples0.onclick=()=>loadExample(0);
tabHomeExamples1.onclick=()=>loadExample(1);
tabHomeExamples2.onclick=()=>loadExample(2);
tabHomeExamples3.onclick=()=>loadExample(3);
tabHomeExamples4.onclick=()=>loadExample(4);

animation_button.onclick=()=>startAnimation();
animationPlayPauseButtonOuter.onclick=()=>animationPlayPause();
animationStepButtonOuter.onclick=()=>animationSingleTimeStep();
animationFastForwardButton.onclick=()=>animationFastForward(5);
tabAnimationSim0.onclick=()=>animationFastForward(1);
tabAnimationSim1.onclick=()=>animationFastForward(5);
tabAnimationSim2.onclick=()=>animationFastForward(10);
tabAnimationSim3.onclick=()=>animationFastForward(25);
tabAnimationSim4.onclick=()=>animationFastForward(100);

tabHomeParameterSeries.onclick=()=>processSeries();

/* Online/Offline specific functions */

if (isDesktopApp) HomepageLink.onclick=()=>{Neutralino.os.open(HomepageLink.href); return false;}

tabHomeHelpDownload.onclick=()=>{
  const element = document.createElement('a');
  element.setAttribute('href','https://github.com/A-Herzog/MiniWarteschlangensimulator/releases/latest/download/MiniWarteschlangensimulator.exe');
  element.setAttribute('target','_blank');
  element.style.display='none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/* Start */

document.addEventListener('readystatechange',event=>{if (event.target.readyState=="complete") {
  if (isDesktopApp) {
    document.querySelector("nav h1").style.display="none";
  } else {
    document.querySelector("nav h1").onclick=()=>showMoreSidebar();
  }
  mainContent.style.display="";
  infoLoading.style.display="none";
}});
