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

export {templates, getRecordByType};

import {language} from "./Language.js";
import {getPositiveFloat} from './Tools.js';
import {dragElement, dragElementProgress, dragTemplate} from "./Editor.js";


/**
 * Generates and adds a station box html element.
 * @param {String} type Station type
 * @param {Number} id Station id
 * @param {String} name Name of the station to be displayed in the station box
 * @param {String} color1 Color for the left side of the box
 * @param {String} color2 Color for the right side of the box
 * @param {Number} top Y coordinate of the upper left corner of the station box
 * @param {Number} left X coordinate of the upper left corner of the station box
 * @param {Boolean} isTemplate Is the box to be added to the canvas (false) or to the templates bar (true)
 * @returns Station html element
 */
function addBox(type, id, name, color1, color2, top, left, isTemplate) {
  const box=document.createElement("div");
  box.className="box draggable";
  box.id=id;
  box.style.zIndex=1;
  box.style.top=top+"px";
  box.style.left=left+"px";
  box.style.color="white";
  box.style.background=color1+" linear-gradient(to right, "+color1+", "+color2+")";
  box.draggable=true;
  box.dataset.type=type;
  box.innerHTML=name;
  if (isTemplate) {
    document.getElementById("templates_area").appendChild(box);
    box.ondragstart=dragTemplate;
  } else {
    document.getElementById("canvas_area").appendChild(box);
    box.ondragstart=dragElement;
    box.ondrag=dragElementProgress;
  }
  return box;
}

/**
 * Generates and adds a text line html element.
 * @param {String} type Element type
 * @param {Number} id Element id
 * @param {String} text Text to be displayed
 * @param {Number} fontSize Font size
 * @param {Number} top Y coordinate of the upper left corner of the text line
 * @param {Number} left X coordinate of the upper left corner of the text line
 * @param {Boolean} isTemplate Is the text line to be added to the canvas (false) or to the templates bar (true)
 * @returns Text line html element
 */
function addText(type, id, text, fontSize, top, left, isTemplate) {
  const box=document.createElement("span");
  box.className="draggable";
  box.id=id;
  box.style.position="absolute";
  box.style.display="block";
  box.style.cursor="pointer";
  box.style.zIndex=1;
  box.style.top=top+"px";
  box.style.left=left+"px";
  box.style.color="black";
  box.style.fontSize=fontSize+"pt";
  box.draggable=true;
  box.dataset.type=type;
  box.innerHTML=(typeof(text)=='undefined')?language.templates.text:text;
  if (isTemplate) {
    document.getElementById("templates_area").appendChild(box);
    box.ondragstart=dragTemplate;
  } else {
    document.getElementById("canvas_area").appendChild(box);
    box.ondragstart=dragElement;
    box.ondrag=dragElementProgress;
  }
  return box;
}

/**
 * Generates and adds a diagram element.
 * @param {String} type Element type
 * @param {Number} id Element id
 * @param {Number} top Y coordinate of the upper left corner of the diagram box
 * @param {Number} left X coordinate of the upper left corner of the diagram box
 * @param {String} sourceName Diagram data source
 * @param {Boolean} isTemplate Is the diagram to be added to the canvas (false) or to the templates bar (true)
 * @returns Diagram html element
 */
function addDiagram(type, id, top, left, sourceName, isTemplate) {
  const box=document.createElement("div");
  box.className="box_diagram draggable";
  if (isTemplate) {
    box.classList.add("box_diagram_template");
    box.innerHTML=language.templates.diagram;
  } else {
    box.innerHTML=language.templates.diagram+((sourceName!='')?(", "+language.templates.diagramSource+"=<b>"+sourceName+"</b>, "+"aktuelle Anzahl an Kunden an der Station"):"");
  }
  box.id=id;
  box.style.zIndex=1;
  box.style.top=top+"px";
  box.style.left=left+"px";
  box.style.color="blue";
  box.style.background="#EEF linear-gradient(to right, #EEF, #F2F2FF)";
  box.draggable=true;
  box.dataset.type=type;
  if (isTemplate) {
    document.getElementById("templates_area").appendChild(box);
    box.ondragstart=dragTemplate;
  } else {
    document.getElementById("canvas_area").appendChild(box);
    box.ondragstart=dragElement;
    box.ondrag=dragElementProgress;
  }
  return box;
}

/**
 * Updates the diagram display during an animation.
 * @param {Number} time Current time
 * @param {Object} simStation Diagram station
 * @param {Object} simData Simulation runtime data
 * @param {Array} simStations List of all simulation stations
 */
function animateDiagram(time, simStation, simData, simStations) {
  /* Find out data source station index on first invocation */
  if (typeof(simData.simStationIndex)=='undefined') {
    simData.simStationIndex=-1;
    for (let i=0;i<simStations.length;i++) {
      const editElement=simStations[i].editElement;
      if (editElement.type+"-"+editElement.nr==simStation.setup.source) {
        simData.simStationIndex=i;
        break;
      }
    }
    const hours=getPositiveFloat(simStation.setup.xrange);
    if (hours==null) simData.storeSize=2*3600; else simData.storeSize=hours*3600;
  }
  if (simData.simStationIndex<0) return;

  /* Read current value */
  const currentYValue=simStations[simData.simStationIndex].n;

  /* Remove old values if needed, add new value */
  if (typeof(simData.values)=='undefined') {
    simData.values=[];
    simData.values.push({x: 0, y: 0});
  }
  const values=simData.values;
  if (values.length>0) {
    let deleteCount=0;
    const limit=time-simData.storeSize;
    for (let i=0;i<values.length;i++) if (values[i].x<limit) deleteCount=i+1; else break;
    if (deleteCount>0) values.splice(0,deleteCount);
  }
  if (values.length>0 && values[values.length-1].x==time) {
    values[values.length-1].y=currentYValue;
  } else {
    values.push({x: time, y: currentYValue});
  }

  /* Prepare canvas on first invocation */
  if (typeof(simData.canvas)=='undefined') {
    const outerElement=document.getElementById(simStation.boxId);
    const canvas=document.createElement("canvas");
    outerElement.appendChild(canvas);
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width=canvas.offsetWidth;
    canvas.height=canvas.offsetHeight;
    simData.canvas=canvas;
    simData.canvasMaxX=canvas.width-canvas.offsetLeft;
    simData.canvasMaxY=canvas.height-canvas.offsetTop;
  }

  /* Draw diagram */
  let maxYValue=values.map(value=>value.y).reduce((a,b)=>Math.max(a,b));
  maxYValue=Math.max(10,maxYValue);
  if (maxYValue>10) maxYValue=Math.max(maxYValue,20);
  if (maxYValue>20) maxYValue=Math.max(maxYValue,50);
  if (maxYValue>50) maxYValue=Math.max(maxYValue,100);
  if (maxYValue>100) maxYValue=Math.max(maxYValue,200);
  if (maxYValue>200) maxYValue=500;

  const canvas=simData.canvas;
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.font="10px";
  ctx.fillText("0",0,simData.canvasMaxY);
  ctx.fillText(maxYValue,0,10);

  ctx.beginPath();
  let first=true;
  let lastY;
  for (let value of values) {
    const x=(1-(time-value.x)/simData.storeSize)*simData.canvasMaxX;
    const y=(1-Math.min(1,value.y/maxYValue))*simData.canvasMaxY;
    if (first) {
      ctx.moveTo(x,y);
      first=false;
    } else {
      ctx.lineTo(x,lastY);
      ctx.lineTo(x,y);
    }
    lastY=y;
  }
  ctx.stroke();
}

/**
 * Cleans the diagram display.
 * @param {Object} simStation Diagram station
 * @param {Object} simData Simulation runtime data
 */
function animateDiagramClean(simStation, simData) {
  if (typeof(simData.canvas)!='undefined') simData.canvas.parentElement.removeChild(simData.canvas);
}


/**
 * Station templates
 */
const templates=[];

templates.push({
  type: 'Source',
  color: "green",
  name: language.templates.source,
  maxEdgesIn: 0,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Source",id,language.templates.source+"<br>"+nr,"green","#1C1",top,left,isTemplate),
  setup: {EI: 100, CVI: 1, b: 1}
});
templates.push({
  type: 'Delay',
  color: "#55F",
  name: language.templates.delay,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Delay",id,language.templates.delay+"<br>"+nr,"#55F","#99F",top,left,isTemplate),
  setup: {ES: 80, CVS: 1}
});
templates.push({
  type: 'Process',
  color: "#00C",
  name: language.templates.process,
  maxEdgesIn: 999,
  maxEdgesOut: 2,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Process",id,language.templates.process+"<br>"+nr,"#00C","#33F",top,left,isTemplate),
  setup: {ES: 80, CVS: 1, c: 1, b: 1, EWT: 300, CVWT: 1, policy: 1, SuccessNextBox: ''}
});
templates.push({
  type: 'Decide',
  color: "#DD0",
  name: language.templates.decide,
  maxEdgesIn: 999,
  maxEdgesOut: 999,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Decide",id,language.templates.decide+"<br>"+nr,"#DD0","#DD7",top,left,isTemplate),
  setup: {mode: 0, rates: "1;1"}
});
templates.push({
  type: 'Duplicate',
  color: "#900",
  name: language.templates.duplicate,
  maxEdgesIn: 999,
  maxEdgesOut: 999,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Duplicate",id,language.templates.duplicate+"<br>"+nr,"#900","#955",top,left,isTemplate)
});
templates.push({
  type: 'Counter',
  color: "#BBB",
  name: language.templates.counter,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Counter",id,language.templates.counter+"<br>"+nr,"#BBB","#DDD",top,left,isTemplate)
});
templates.push({
  type: 'Dispose',
  color: "red",
  name: language.templates.dispose,
  maxEdgesIn: 999,
  maxEdgesOut: 0,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Dispose",id,language.templates.dispose+"<br>"+nr,"red","#F33",top,left,isTemplate)
});
templates.push({
  type: 'Batch',
  color: "#F0F",
  name: language.templates.batch,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Batch",id,language.templates.batch+"<br>"+nr,"#F0F","#FAF",top,left,isTemplate),
  setup: {b: 2}
});
templates.push({
  type: 'Separate',
  color: "#F0F",
  name: language.templates.separate,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Separate",id,language.templates.separate+"<br>"+nr,"#F0F","#FAF",top,left,isTemplate)
});
templates.push({
  type: 'Signal',
  color: "#FB3",
  name: language.templates.signal,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Signal",id,language.templates.signal+"<br>"+nr,"#FB3","#FD7",top,left,isTemplate)
});
templates.push({
  type: 'Barrier',
  color: "#FB3",
  name: language.templates.barrier,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addBox("Barrier",id,language.templates.barrier+"<br>"+nr,"#FB3","#FD7",top,left,isTemplate),
  setup: {release: 1, signal: '', storeSignals: true}
});
templates.push({
  type: 'Text',
  name: language.templates.text,
  maxEdgesIn: 0,
  maxEdgesOut: 0,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>addText("Text",id,setup.text,setup.fontSize,top,left,isTemplate),
  setup: {text: language.templates.text, fontSize: 12},
  visibleSetup: true,
  visualOnly: true
});
templates.push({
  type: 'Diagram',
  name: language.templates.diagram,
  maxEdgesIn: 0,
  maxEdgesOut: 0,
  addFunc: (id, nr, top, left, setup, isTemplate, elements)=>{
    const sourceList=elements.filter(element=>element.type+"-"+element.nr==setup.source);
    const source=(sourceList.length==1)?sourceList[0].name:"";
    return addDiagram("Diagram",id,top,left,source,isTemplate);
  },
  animateFunc: animateDiagram,
  animateCleanFunc: animateDiagramClean,
  setup: {source: '', xrange: 2},
  visibleSetup: true,
  visualOnly: true
});

/**
 * Returns a station template object based on a given station type
 * @param {String} type Station type
 * @returns Station template object
 */
function getRecordByType(type) {
  for (let template of templates) if (template.type==type) return template;
  return null;
}