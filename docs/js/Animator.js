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

export {startAnimation, animationPlayPause, animationSingleTimeStep, animationActive, animationFastForward};

import {showMessage, showConfirmationMessage, showAnimationSidebar, addEdgeActive, showTemplatesSidebar, elements, edges} from './Editor.js';
import {fixModel} from './FixModel.js';
import {SimulatorWorker, WebSimulator} from './Simulator.js';
import {language, getCharacteristicsInfo} from "./Language.js";
import {formatTime} from './SimCore.js';

/**
 * Start animation.
 */
function startAnimation() {
  /* Stop already running animation */
  if (animationActive) {
    stopAnimation();
    return;
  }

  /* If the last animation was terminated in pause mode, do visual reset */
  animationPause=false;
  const playPauseButton=document.getElementById('animationPlayPauseButton');
  playPauseButton.classList.remove('bi-play');
  playPauseButton.classList.add('bi-pause');

  const stepButton=document.getElementById('animationStepButtonOuter');
  stepButton.classList.add("disabled");

  /* Stop function for adding edges if needed */
  if (addEdgeActive) addEdgeClick();

  /* Check and generate model */
  fixModel(elements,edges);
  simulator=new WebSimulator(true);
  const buildResult=simulator.build(elements,edges);
  if (buildResult!=null) {
    showMessage(language.builder.invalidModelTitle,language.builder.invalidModelText+"<br>"+buildResult);
    return;
  }

  /* Prepare position data for animation */
  const simStations=simulator.stations;
  for (let i=0;i<simStations.length;i++) {
    const div=document.getElementById(simStations[i].editElement.boxId);
    stationDivs[simStations[i].id]=div;
  }
  stationConnections={};

  /* Start animation */
  animationPause=false;
  setAnimationMode(true);
  animationSlider=document.getElementById('animationSpeed');
  animationSlider.value=1;
  animationInfo=document.getElementById('sidebar-animation-info');
  animationStep();
}

/**
 * Stops a running animation.
 */
function stopAnimation() {
  setAnimationMode(false);
  simulator.done();
  simulator=null;

  const canvas=document.getElementById("canvas_area");

  /* Remove old symbols */
  for (let i=0;i<animationStaticClientsDivs.length;i++) {
    canvas.removeChild(animationStaticClientsDivs[i]);
  }
  animationStaticClientsDivs=[];
}

/**
 * Sets the GUI for animation or not animation mode
 * @param {Boolean} active Animation active yes/no
 * @see startAnimation()
 * @see stopAnimation()
 */
function setAnimationMode(active) {
  const button=document.getElementById('animation_button');
  animationActive=active;

  if (active) {
    button.classList.remove('btn-outline-light');
    button.classList.add('btn-warning');
    showAnimationSidebar();
  } else {
    button.classList.remove('btn-warning');
    button.classList.add('btn-outline-light');
    showTemplatesSidebar();
  }

  document.getElementById('file_button').disabled=active;
  document.getElementById('add_station').disabled=active;
  document.getElementById('add_edge').disabled=active;
  document.querySelector('#sidebar h1').style.cursor=active?"default":"pointer";
}

/**
 * Callback for the animation play/pause button.
 */
function animationPlayPause() {
  const playpauseButton=document.getElementById('animationPlayPauseButton');
  const stepButton=document.getElementById('animationStepButtonOuter');

  if (animationPause) {
    /* Start animation */
    animationPause=false;
    playpauseButton.classList.remove('bi-play');
    playpauseButton.classList.add('bi-pause');
    stepButton.classList.add("disabled");
    animationStep();
  } else {
    /* Pause animation */
    if (animationStepTimeout!=null) {
      clearTimeout(animationStepTimeout);
      animationStepTimeout=null;
    }
    animationPause=true;
    playpauseButton.classList.remove('bi-pause');
    playpauseButton.classList.add('bi-play');
    stepButton.classList.remove("disabled");
  }
}
/**
 * Is the animation active?
 */
let animationActive=false;

/**
 * Is the animation in pause mode?
 */
let animationPause=false;

let animationStepTimeout=null;
let animationSlider;
let animationInfo;

let stationDivs={};
let stationConnections={};
let animationStaticClientsDivs=[];

/**
 * Simulator object for running the animation.
 */
let simulator=null;

/**
 * Animation delays in different speed modes
 * @see animationStep()
 */
const animationDelay={1: 1000, 2: 500, 3: 200, 4: 50, 5: 0};

/**
 * Executes a single animation step.
 */
function animationStep() {
  animationStepTimeout=null;
  const delay=animationDelay[animationSlider.value];

  /* Execute simulation step */
  if (simulator==null) return;
  const hasNext=simulator.executeNext();
  if (!hasNext) {stopAnimation(); return;}

  /* Update moving animation images */
  const animationDuration=Math.max(5,Math.min(200,delay));
  showMoveClients(animationDuration);

  /* Update static animation images */
  showStaticClients();

  /* Update status information */
  animationInfo.innerHTML=simulator.info;

  /* Update the visual only elements */
  updateVisualElements();

  /* Plan next animation step */
  if (!animationPause) {
    const nextStepDelay=simulator.nextEventIsSameTime?animationDuration:Math.max(animationDuration,delay);
    animationStepTimeout=setTimeout(animationStep,nextStepDelay);
  }
}

/**
 * Executes one or more animation steps (as long as the time is not changing).
 * This is the callback for the step button in animation pause mode.
 */
function animationSingleTimeStep() {
  const startTime=simulator.time;
  while (startTime==simulator.time) {
    animationStep();
  }
}

/**
 * Generates a client icon as HTML node
 * @param {Number} top Upper y coordinate
 * @param {Number} left Left x coordinate
 * @returns HTML icon node
 */
function createIcon(top, left) {
  const icon=document.createElement("div");
  icon.className="client bi bi-person-fill";
  icon.style.top=top+"px";
  icon.style.left=left+"px";
  return icon;
}

/**
 * Draw the static client icons on the canvas.
 */
function showStaticClients() {
  const canvas=document.getElementById("canvas_area");

  const oldIcons=animationStaticClientsDivs;
  const oldIconCount=oldIcons.length;
  let oldIconsUsed=0;
  animationStaticClientsDivs=[];

  /* Generate new symbols and/or recycle old symbols */
  for (let id in simulator.animateStaticClients) {
    const count=simulator.animateStaticClients[id];
    const station=stationDivs[id];
    const top=station.offsetTop-20;
    let left=station.offsetLeft+station.offsetWidth-25;
    const drawCount=Math.min(count,6);
    for (let i=0;i<drawCount;i++) {
      let icon;
      if (oldIconsUsed<oldIcons.length) {
        /* Recycle old icon */
        icon=oldIcons[oldIconsUsed];
        oldIconsUsed++;
        icon.style.top=top+"px";
        icon.style.left=left+"px";
      } else {
        /* Create and add new icon */
        icon=createIcon(top,left);
        canvas.appendChild(icon);
      }
      animationStaticClientsDivs.push(icon);
      left-=15;
    }
  }

  /* Remove symbol which are not used anymore */
  for (let i=oldIconsUsed;i<oldIconCount;i++) {
    canvas.removeChild(oldIcons[i]);
  }
}

/**
 * Calculates the animation path from a origin to a destination station
 * @param {Number} id1 Id of the origin station
 * @param {Number} id2 Id of the destination station
 * @returns Array containing the origin and the destination point of the animation movement path
 */
function calcConnection(id1, id2) {
  const element1=stationDivs[id1];
  const element2=stationDivs[id2];

  /* Calculate connection points for the edge */
  const startX1=element1.offsetLeft;
  const startY1=element1.offsetTop;
  const middleX1=element1.offsetLeft+element1.offsetWidth/2;
  const middleY1=element1.offsetTop+element1.offsetHeight/2;
  const endX1=element1.offsetLeft+element1.offsetWidth;
  const endY1=element1.offsetTop+element1.offsetHeight;
  const startX2=element2.offsetLeft;
  const startY2=element2.offsetTop;
  const middleX2=element2.offsetLeft+element2.offsetWidth/2;
  const middleY2=element2.offsetTop+element2.offsetHeight/2;
  const endX2=element2.offsetLeft+element2.offsetWidth;
  const endY2=element2.offsetTop+element2.offsetHeight;
  const P1=[[endX1, middleY1], [middleX1, startY1], [startX1, middleY1], [middleX1, endY1]];
  const P2=[[endX2, middleY2], [middleX2, startY2], [startX2, middleY2], [middleX2, endY2]];

  /* Calculate shortest connection */
  let best1=0;
  let best2=0;
  let bestDelta=999999999;
  for (let j=0;j<4;j++) for (let k=0;k<4;k++) {
    const P=P1[j];
    const Q=P2[k];
    const delta=Math.sqrt(Math.pow(P[0]-Q[0],2)+Math.pow(P[1]-Q[1],2));
    if (delta<bestDelta) {
      bestDelta=delta;
      best1=j;
      best2=k;
    }
  }
  const arrow1=P1[best1];
  const arrow2=P2[best2];
  return [arrow1, arrow2];
}

/**
 * Adds the moving clients to the canvas.
 * @param {Number} animationTime Time for movement (in ms)
 */
function showMoveClients(animationTime) {
  const canvas=document.getElementById("canvas_area");

  for (let i=0;i<simulator.animateMoveClients.length;i++) {
    const move=simulator.animateMoveClients[i];

    /* Determine the route from the starting point to the destination */
    if (typeof(stationConnections[move.from])=='undefined') stationConnections[move.from]={};
    if (typeof(stationConnections[move.from][move.to])=='undefined') stationConnections[move.from][move.to]=calcConnection(move.from,move.to);
    const path=stationConnections[move.from][move.to];

    const startX=path[0][0]-25;
    const startY=path[0][1]-25;
    const endX=path[1][0]-25;
    const endY=path[1][1]-25;

    const icon=createIcon(startY,startX);
    canvas.appendChild(icon);

    const moveDelta=Math.sqrt((endX-startX)**2+(endY-startY)**2);

    const moveInfo={
      element: icon,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      timeStart: Date.now(),
      timeAnimation: animationTime*moveDelta/100
    };
    requestAnimationFrame(()=>animationFrame(moveInfo));
  }
}

/**
 * Updates the visual only elements (diagrams) on the canvas.
 */
function updateVisualElements() {
  for (let animationStation of simulator.animationStations) animationStation.template.animateFunc(simulator.time,animationStation.element,animationStation.data,simulator.stations);
}

/**
 * Draws a client icon on its path from the origin to the destination station
 * @param {Object} moveInfo Information on the client icon to be drawn
 * @see showMoveClients
 */
function animationFrame(moveInfo) {
  const now=Date.now();
  const percent=(now-moveInfo.timeStart)/moveInfo.timeAnimation;

  const icon=moveInfo.element;
  if (percent>1) {
    const canvas=document.getElementById("canvas_area");
    canvas.removeChild(icon);
  } else {
    icon.style.left=Math.round(moveInfo.startX+(moveInfo.endX-moveInfo.startX)*percent)+"px";
    icon.style.top=Math.round(moveInfo.startY+(moveInfo.endY-moveInfo.startY)*percent)+"px";

    requestAnimationFrame(()=>animationFrame(moveInfo));
  }
}

/**
 * Simulation progress dialog.
 * @see animationFastForwardStep2
 */
let workerDialog=null;

/**
 * Simulation web worker container object
 * @see SimulatorWorker
 * @see animationFastForwardStep2
 */
let worker=null;

/**
 * Callback for the "Cancel simulation" button.
 * @see animationFastForwardStep2
 */
function cancelWorker() {
  if (worker!=null) {
    worker.cancel();
  } else {
    if (workerDialog!=null) workerDialog.hide();
  }
}

/**
 * Cancels the animation and starts a simulation.
 * Calling this function will first show a confirmation message.
 * @param {Number} arrivalMio Arrivals (in millions) to be simulated
 */
function animationFastForward(arrivalMio) {
  showConfirmationMessage(language.tabAnimation.simulationTitle,language.tabAnimation.simulationText,()=>animationFastForwardStep2(arrivalMio));
}

/**
 * Cancels the animation and starts a simulation (without confirmation message).
 * @param {Number} arrivalMio Arrivals (in millions) to be simulated
 * @see animationFastForward
 */
function animationFastForwardStep2(arrivalMio) {
  stopAnimation();

  let button;

  const body=document.getElementById('modalAreaBody');
  const footer=document.getElementById('modalAreaFooter');

  document.getElementById('modalAreaTitle').innerHTML=language.tabAnimation.simulationTitle;
  body.innerHTML='<div style="cursor: default;"><b>'+language.tabAnimation.simulationProgress1+'</b><br>'+language.tabAnimation.simulationProgress2a+arrivalMio+language.tabAnimation.simulationProgress2b+'</div><div class="progress" style=" margin-top: 15px;"><div id="simProgress" style="width: 0%;" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>';
  footer.innerHTML="";
  footer.appendChild(button=document.createElement("button"));
  button.type="button";
  button.className="btn btn-danger bi-x-circle";
  button.onclick=cancelWorker;
  button.innerHTML=" "+language.tabAnimation.simulationCancel;

  const progress=document.getElementById('simProgress');

  workerDialog=new bootstrap.Modal(document.getElementById('modalArea'),{});
  workerDialog.show();

  const countSum=arrivalMio*1_000_000;
  let cpuCount=navigator.hardwareConcurrency;
  if (navigator.userAgent.toLocaleLowerCase().indexOf("firefox")>=0 && cpuCount==16) cpuCount=24; /* Firefox will never report more than 16 threads; having more threads than logical core is of no (big) disadvantage, to guessing here. */
  const model={elements: elements, edges: edges, count: Math.ceil(countSum/cpuCount)};
  const models=[];
  for (let i=0;i<cpuCount;i++) models.push(model);
  worker=new SimulatorWorker(models,body,progress,()=>{
    body.innerHTML=worker.info;
    footer.innerHTML="";
    footer.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="btn btn-primary bi-check";
    button.dataset.bsDismiss="modal";
    button.innerHTML=" "+language.dialog.Ok;
    footer.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="btn btn-success bi-file-earmark-text";
    button.onclick=()=>animationFastForwardShowFullData();
    button.innerHTML=" "+language.tabAnimation.allData;
  },
  ()=>workerDialog.hide());
  worker.start();
}

/**
 * Shows the simulation results.
 */
function animationFastForwardShowFullData() {
  const statistics=worker.full;
  let content="";
  const contentPlain=[];

  content+='<!DOCTYPE html>';
  content+='<head>';
  content+='<meta charset="utf-8">';
  content+='<title>Mini Warteschlangensimulator</title>';
  content+='<meta name="viewport" content="width=device-width, initial-scale=1">';
  content+='<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">';
  content+='<link href="./libs/bootstrap.min.css" rel="stylesheet">';
  content+='<link href="./libs/bootstrap-icons.css" rel="stylesheet">';
  content+='</head>';
  content+='<body style="background-color: #E7E7E7;">';

  content+='<nav class="navbar navbar-expand-lg navbar-light bg-success" style="padding: 10px 20px; cursor: default; user-select: none;"><h3 class="text-light">'+language.tabAnimation.simulationResults+'</h3></nav>';
  content+='<div class="wrapper" style="padding: 20px;">';

  content+="<p>";
  content+=language.tabAnimation.time+": "+formatTime(statistics.time)+"<br>";
  content+=language.tabAnimation.threads+": "+statistics.threads+"<br>";
  content+=language.tabAnimation.runTime+": "+statistics.runTime.toLocaleString()+" ms";
  content+="</p>"

  contentPlain.push(language.tabAnimation.time+": "+formatTime(statistics.time));
  contentPlain.push(language.tabAnimation.threads+": "+statistics.threads);
  contentPlain.push("");

  for (let priority=3;priority>=1;priority--) for (let stationName in statistics.stations) {
    const stationData=statistics.stations[stationName];
    if (stationData.priority==priority) {
      content+="<h4>"+stationName+"</h4>";
      content+="<ul>";
      contentPlain.push(stationName);
      for (let recordName in stationData.records) {
        const recordData=stationData.records[recordName];
        if (typeof(recordData)=='number') continue;
        content+="<li>";
        let plainLine="";
        if (typeof(recordData.mean)!='undefined') {
          content+=getCharacteristicsInfo("E["+recordData.name+"]")+"="+recordData.mean.toLocaleString();
          plainLine+="E["+recordData.name+"]="+recordData.mean.toLocaleString();
          if (typeof(recordData.sd)!='undefined') {
            content+=", "+getCharacteristicsInfo("SD["+recordData.name+"]")+"="+recordData.sd.toLocaleString();
            content+=", "+getCharacteristicsInfo("CV["+recordData.name+"]")+"="+recordData.cv.toLocaleString();
            plainLine+=", SD["+recordData.name+"]="+recordData.sd.toLocaleString();
            plainLine+=", CV["+recordData.name+"]="+recordData.cv.toLocaleString();
          }
          if (typeof(recordData.max)!='undefined') {
            content+=", "+getCharacteristicsInfo("Min["+recordData.name+"]")+"="+recordData.min.toLocaleString();
            content+=", "+getCharacteristicsInfo("Max["+recordData.name+"]")+"="+recordData.max.toLocaleString();
            plainLine+=", Min["+recordData.name+"]="+recordData.min.toLocaleString();
            plainLine+=", Max["+recordData.name+"]="+recordData.max.toLocaleString();
          }
          if (typeof(recordData.sd)!='undefined') {
            content+=", "+getCharacteristicsInfo("n")+"="+recordData.count.toLocaleString();
            plainLine+=", n="+recordData.count.toLocaleString();
          }
          if (recordData.name=='cBusy' && stationData.records.c) {
            const rho=recordData.mean/stationData.records.c;
            content+=", "+getCharacteristicsInfo("rho")+"="+(rho*100).toLocaleString()+"%"; // XXX:
            plainLine+=", rho="+(rho*100).toLocaleString()+"%";
          }
        } else {
          content+=getCharacteristicsInfo("n")+"="+recordData.count.toLocaleString();
          plainLine+="n="+recordData.count.toLocaleString();
        }
        contentPlain.push(plainLine);
        content+="</li>";
      }
      content+="</ul>";
      contentPlain.push("");
    }
  }

  content+='<p style="margin-top: 20px;">';
  content+='<button type="button" class="btn btn-primary bi-x-circle" onclick="window.close()"> '+language.dialog.CloseWindow+'</button>';
  content+='<button type="button" class="btn btn-primary bi-clipboard" style="margin-left: 10px;" onclick="navigator.clipboard.writeText(atob(\''+btoa(contentPlain.join("\n"))+'\'));"> '+language.tabAnimation.copy+'</button>';
  content+='</p>';

  content+='</div>';

  content+='</body>';
  content+='</html>';

  const newWindow=window.open('');
  newWindow.document.write(content);
  newWindow.focus()
}
