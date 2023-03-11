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

import {dragElement, dragTemplate} from "./Editor.js";

/* Darstellung der Boxen */

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
  }
  return box;
}

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
  }
  return box;
}



/* Vorlagen */

const templates=[];

templates.push({
  type: 'Source',
  color: "green",
  name: language.templates.source,
  maxEdgesIn: 0,
  maxEdgesOut: 1,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Source",id,language.templates.source+"<br>"+nr,"green","#1C1",top,left,isTemplate);},
  setup: {EI: 100, CVI: 1, b: 1}
});
templates.push({
  type: 'Delay',
  color: "#55F",
  name: language.templates.delay,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Delay",id,language.templates.delay+"<br>"+nr,"#55F","#99F",top,left,isTemplate);},
  setup: {ES: 80, CVS: 1}
});
templates.push({
  type: 'Process',
  color: "#00C",
  name: language.templates.process,
  maxEdgesIn: 999,
  maxEdgesOut: 2,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Process",id,language.templates.process+"<br>"+nr,"#00C","#33F",top,left,isTemplate);},
  setup: {ES: 80, CVS: 1, c: 1, b: 1, EWT: 300, CVWT: 1, policy: 1, SuccessNextBox: ''}
});
templates.push({
  type: 'Decide',
  color: "#DD0",
  name: language.templates.decide,
  maxEdgesIn: 999,
  maxEdgesOut: 999,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Decide",id,language.templates.decide+"<br>"+nr,"#DD0","#DD7",top,left,isTemplate);},
  setup: {mode: 0, rates: "1;1"}
});
templates.push({
  type: 'Duplicate',
  color: "#900",
  name: language.templates.duplicate,
  maxEdgesIn: 999,
  maxEdgesOut: 999,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Duplicate",id,language.templates.duplicate+"<br>"+nr,"#900","#955",top,left,isTemplate);}
});
templates.push({
  type: 'Counter',
  color: "#BBB",
  name: language.templates.counter,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Counter",id,language.templates.counter+"<br>"+nr,"#BBB","#DDD",top,left,isTemplate);}
});
templates.push({
  type: 'Dispose',
  color: "red",
  name: language.templates.dispose,
  maxEdgesIn: 999,
  maxEdgesOut: 0,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Dispose",id,language.templates.dispose+"<br>"+nr,"red","#F33",top,left,isTemplate);}
});
templates.push({
  type: 'Batch',
  color: "#F0F",
  name: language.templates.batch,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Batch",id,language.templates.batch+"<br>"+nr,"#F0F","#FAF",top,left,isTemplate);},
  setup: {b: 2}
});
templates.push({
  type: 'Separate',
  color: "#F0F",
  name: language.templates.separate,
  maxEdgesIn: 999,
  maxEdgesOut: 1,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addBox("Separate",id,language.templates.separate+"<br>"+nr,"#F0F","#FAF",top,left,isTemplate);}
});
templates.push({
  type: 'Text',
  name: language.templates.text,
  maxEdgesIn: 0,
  maxEdgesOut: 0,
  addFunc: function(id, nr, top, left, setup, isTemplate) {return addText("Text",id,setup.text,setup.fontSize,top,left,isTemplate);},
  setup: {text: language.templates.text, fontSize: 12},
  visibleSetup: true,
});

function getRecordByType(type) {
  for (let i=0;i<templates.length;i++) if (templates[i].type==type) return templates[i];
  return null;
}