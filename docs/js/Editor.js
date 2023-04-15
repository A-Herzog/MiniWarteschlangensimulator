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

export {zoomIn, zoomOut, showMessage, showConfirmationMessage, discardModel, fileNew, fileLoad, fileLoadDrag, fileLoadDragEnter, fileLoadDragLeave, fileLoadDrop, fileSave, showFileSidebar, showTemplatesSidebar, showAnimationSidebar, showMoreSidebar, allowDrop, dragElement, dragTemplate, canvasDrop, addEdgeActive, addEdgeClick, canvasClick, elements, edges, addElementToModel, addTextToModel, addDiagramToModel, getElementByBoxId, addEdgeToModel, updateModelOnCanvas};

import {templates, getRecordByType} from "./Templates.js";
import {animationActive} from "./Animator.js";

/* Größenanpassung */

function resizeCanvas() {
  let style;

  const viewportHeight=Math.floor(window.visualViewport.height);
  const viewportWidth=Math.floor(window.visualViewport.width);
  const navWidth=document.getElementById("sidebar").offsetWidth;
  const navHeight=document.getElementById("navbar").offsetHeight;
  const headerHeight=document.getElementById("sidebar-templates-header").offsetHeight;
  const h1Height=document.querySelector('#sidebar h1').offsetHeight;

  style=document.getElementById("canvas_outer").style;
  style.width=(viewportWidth-navWidth)+"px";
  style.height=(viewportHeight-navHeight)+"px";
  style.maxWidth=style.width;
  style.maxHeight=style.height;

  style=document.getElementById("sidebar").style;
  style.height=viewportHeight+"px";
  style.maxHeight=style.height;

  style=document.getElementById("template_outer").style;
  style.height=Math.max(175,viewportHeight-h1Height-headerHeight-25-15)+"px";
  style.maxHeight=style.height;
}

window.addEventListener('load', (event) => {
  const resizeObserver=new ResizeObserver(resizeCanvas);
  resizeObserver.observe(document.getElementById("sidebar"));
  resizeObserver.observe(document.body);
  resizeCanvas();

  const margin=20;
  let top=margin;
  for (let i=0;i<templates.length;i++) {
    const template=templates[i].addFunc("template"+(i+1),"",top,10,{},true,[]);
    top+=template.offsetHeight+margin;
  }
  document.getElementById("templates_area").style.height="calc(max("+top+"px,100%))";

  updateModelOnCanvas();
});

let canvasScale=100;

function updateZoomButtons() {
  document.getElementById('zoom_button_in').disabled=canvasScale>=140;
  document.getElementById('zoom_button_out').disabled=canvasScale<=60;
}

function zoomOut() {
  if (canvasScale<=60) return;
  canvasScale-=20;
  updateZoomButtons();
  updateCanvasScale(canvasScale/100);
}

function zoomIn() {
  if (canvasScale>=140) return;
  canvasScale+=20;
  updateZoomButtons();
  updateCanvasScale(canvasScale/100);
}

function updateCanvasScale(newScale) {
  const canvas=document.getElementById('canvas_area');
  canvas.style.transform='scale('+newScale+')';
}



/* Meldungen */

function showMessage(title, msg) {
  document.getElementById('modalMessageTitle').innerHTML=title;
  document.getElementById('modalMessageBody').innerHTML=msg;
  const dialog=new bootstrap.Modal(document.getElementById('modalMessage'),{});
  document.getElementById('modalMessage').onkeyup=event=>{if (event.key=="Enter" || event.key=="Escape") dialog.hide();}
  dialog.show();
}

function showConfirmationMessage(title, msg, yesCallback) {
  document.getElementById('modalConfirmationTitle').innerHTML=title;
  document.getElementById('modalConfirmationBody').innerHTML=msg;
  document.getElementById('modalConfirmationYesButton').onclick=yesCallback;
  const dialog=new bootstrap.Modal(document.getElementById('modalConfirmation'),{});
  document.getElementById('modalConfirmation').onkeyup=event=>{if (event.key=="Enter") {dialog.hide(); yesCallback();}}
  dialog.show();
}

function discardModel(yesCallback) {
  if (elements.length==0) {
    yesCallback();
    return;
  }
  showConfirmationMessage(language.tabFile.modelDiscardTitle,language.tabFile.modelDiscardText,yesCallback);
}



/* Modelle laden/speichern */

function fileNew() {
  discardModel(function() {
    elements.length=0;
    edges.length=0;
    updateModelOnCanvas();
    showTemplatesSidebar();
  });
}

function fileLoadDrag(event) {
  event.preventDefault();
}

let fileLoadEnterCount=0;

function fileLoadDragEnter(event) {
  const element=document.getElementById('fileLoadDropTarget');
  element.style.fontWeight="bold";
  element.style.backgroundColor="#5A5";
  fileLoadEnterCount++;
}

function fileLoadDragLeave(event) {
  fileLoadEnterCount--;
  if (fileLoadEnterCount>0) return;
  const element=document.getElementById('fileLoadDropTarget');
  element.style.fontWeight="";
  element.style.backgroundColor="";
}

function fileLodeJSON(text) {
  const model=JSON.parse(text);
  discardModel(function() {
    elements.length=0;
    edges.length=0;
    for (let i=0;i<model.elements.length;i++) elements.push(model.elements[i]);
    for (let i=0;i<model.edges.length;i++) edges.push(model.edges[i]);
    updateModelOnCanvas();
    showTemplatesSidebar();
  });
}

function fileLoadDrop(event) {
  const element=document.getElementById('fileLoadDropTarget');
  element.style.fontWeight="";
  element.style.backgroundColor="";
  fileLoadEnterCount=0;

  if (typeof(event.dataTransfer)=='undefined' || event.dataTransfer==null) return;
  if (typeof(event.dataTransfer.files)=='undefined' || event.dataTransfer.files.length!=1) return;
  event.dataTransfer.files[0]

  event.dataTransfer.files[0].text().then(response=>fileLodeJSON(response));

  event.preventDefault();
}

function fileLoad() {
  if (!isDesktopApp) return;

  Neutralino.os.showOpenDialog(language.tabFile.modelLoad,{filters: [
      {name: language.tabFile.modelFiles+' (*.json)', extensions: ['json']}
    ]}).then(file=>{
      if (file==null || file.length!=1) return;
      file=file[0].trim();
      if (file=='') return;
      Neutralino.filesystem.readFile(file).then(text=>fileLodeJSON(text));
    });
}

function fileSave() {
  const model={elements: elements, edges: edges};
  const json=JSON.stringify(model);

  if (isDesktopApp) {
    Neutralino.os.showSaveDialog(language.tabFile.modelSave, {defaultPath: 'model.json', filters: [
      {name: language.tabFile.modelFiles+' (*.json)', extensions: ['json']}
    ]}).then(file=>{
      file=file.trim();
      if (file=='') return;
      if (!file.toLocaleLowerCase().endsWith(".json")) file+=".json";
      Neutralino.filesystem.writeFile(file,json);
    });
  } else {
    const element=document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8,'+encodeURIComponent(json));
    element.setAttribute('download','Model.json');
    element.style.display='none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}



/* Sidebar */

function showSidebar(nr) {
  document.getElementById('sidebar-file').style.display=(nr==0)?"inline":"none";
  document.getElementById('sidebar-templates').style.display=(nr==1)?"inline":"none";
  document.getElementById('sidebar-edges').style.display=(nr==2)?"inline":"none";
  document.getElementById('sidebar-editor').style.display=(nr==3)?"inline":"none";
  document.getElementById('sidebar-animation').style.display=(nr==4)?"inline":"none";
  document.getElementById('sidebar-more').style.display=(nr==5)?"inline":"none";

  const editorContent=document.getElementById('sidebar-editor-inner');
  while (editorContent.firstChild) editorContent.removeChild(editorContent.lastChild);
}

function showFileSidebar() {
  if (animationActive) return;
  if (addEdgeActive) addEdgeClick();
  showSidebar(0);
}

function showTemplatesSidebar() {
  if (animationActive) return;
  if (addEdgeActive) addEdgeClick();
  showSidebar(1);
  resizeCanvas();
}

function showEdgesSidebar() {
  if (animationActive) return;
  showSidebar(2);
}

function showEditorSidebar() {
  if (animationActive) return;
  showSidebar(3);
}

function showAnimationSidebar() {
  showSidebar(4);
}

function showMoreSidebar() {
  if (animationActive) return;
  showSidebar(5);
}



/* Drag&Drop-Operationen */

function allowDrop(ev) {
  if (animationActive) return false;
  ev.preventDefault();
}

function dragTemplate(ev) {
  ev.dataTransfer.setData("templateType",ev.target.dataset.type);
  ev.dataTransfer.setData("deltaX",ev.layerX);
  ev.dataTransfer.setData("deltaY",ev.layerY);
}

function dragElement(ev) {
  ev.dataTransfer.setData("moveBoxId",ev.target.id);
  ev.dataTransfer.setData("deltaX",ev.layerX);
  ev.dataTransfer.setData("deltaY",ev.layerY);
}

function canvasDrop(ev) {
  if (animationActive) return;

  ev.preventDefault();
  const data=ev.dataTransfer;

  const templateType=data.getData("templateType");
  const x=ev.offsetX;
  const y=ev.offsetY;
  const deltaX=ev.dataTransfer.getData("deltaX");
  const deltaY=ev.dataTransfer.getData("deltaY");
  let top=y-deltaY;
  let left=x-deltaX;

  const canvas=document.getElementById("canvas_area");
  if (ev.target!=canvas) {
    top+=ev.target.offsetTop;
    left+=ev.target.offsetLeft;
  }

  if (templateType!='') {
    /* Aus Vorlage */
    addElementToModel(templateType,top,left);
  } else {
    /* Element verschieben */
    const boxId=ev.dataTransfer.getData("moveBoxId");
    for (let i=0;i<elements.length;i++) if (elements[i].boxId==boxId) {
      elements[i].top=top;
      elements[i].left=left;
      break;
    }
    updateModelOnCanvas();
  }
}



/* Touch -> Drag&Drop */

let dragStartElementX;
let dragStartElementY;
let dragStartX;
let dragStartY;

function handle_touch_down(e) {
  if (!e.target.classList.contains("draggable")) return;

  /* Startposition des Elements und des Fingers auf der Zeichenfläche merken */
  dragStartElementX=e.target.offsetLeft;
  dragStartElementY=e.target.offsetTop;
  dragStartX=e.targetTouches[0].clientX;
  dragStartY=e.targetTouches[0].clientY;
}

function handle_touch_move(e) {
  if (!e.target.classList.contains("draggable")) return;

  /* Verschiebung relativ zur Startposition */
  const posx=e.targetTouches[0].clientX;
  const posy=e.targetTouches[0].clientY;
  const deltaX=posx-dragStartX;
  const deltaY=posy-dragStartY;
  e.target.style.left=(dragStartElementX+deltaX)+"px";
  e.target.style.top=(dragStartElementY+deltaY)+"px";

  /* Scrollen der Zeichenfläche aussetzen, so lange wir Drag&Drop machen */
  e.preventDefault();
}

function handle_touch_up_canvas(e) {
  if (!e.target.classList.contains("draggable")) return;

  /* Daten aus div in Editor-Element übertragen */
  const boxId=e.target.id;
  for (let i=0;i<elements.length;i++) if (elements[i].boxId==boxId) {
    elements[i].top=e.target.offsetTop;
    elements[i].left=e.target.offsetLeft;
    break;
  }

  /* Alles neu zeichnen, damit die Kanten auch wieder passen */
  updateModelOnCanvas();
}

function handle_touch_up_templates(e) {
  if (!e.target.classList.contains("draggable")) return;

  /* Koordinaten relativ zur Zeichenfläche berechnen */
  const sourceRect=document.getElementById('templates_area').getBoundingClientRect();
  const destRect=document.getElementById('canvas_area').getBoundingClientRect();
  const deltaX=destRect.x-sourceRect.x;
  const deltaY=destRect.y-sourceRect.y;
  const top=e.target.offsetTop-deltaY;
  const left=e.target.offsetLeft-deltaX;

  /* Liegen wir im Zielbereich? */
  if (top>=0 && left>=0) {
    const templateType=e.target.dataset.type;
    addElementToModel(templateType,top,left);
  }

  /* Ausgangselement wieder an seinen Platz bewegen */
  e.target.style.left=dragStartElementX+"px";
  e.target.style.top=dragStartElementY+"px";
}

if (window.Touch) window.addEventListener('load', (event) => {
  const canvasArea=document.getElementById('canvas_area');
  canvasArea.addEventListener("touchstart",handle_touch_down,false);
  canvasArea.addEventListener("touchmove",handle_touch_move,false);
  canvasArea.addEventListener("touchend",handle_touch_up_canvas,false);

  const templatesArea=document.getElementById('templates_area');
  templatesArea.addEventListener("touchstart",handle_touch_down,false);
  templatesArea.addEventListener("touchmove",handle_touch_move,false);
  templatesArea.addEventListener("touchend",handle_touch_up_templates,false);
});



/* Kanten */

let addEdgeActive=false;
let addEdgeFirstBoxId;

function addEdgeClick() {
  if (animationActive) return;

  const button=document.getElementById('add_edge');
  addEdgeActive=!addEdgeActive;

  if (addEdgeActive) {
    button.classList.remove('btn-outline-light');
    button.classList.add('btn-warning');
    document.getElementById('sidebar-edges-info').innerHTML=language.tabEdge.step1;
    document.getElementById('sidebar-edges-info-img').src='./images/AddEdge1.webp';
    showEdgesSidebar();
  } else {
    button.classList.remove('btn-warning');
    button.classList.add('btn-outline-light');
    showTemplatesSidebar();
  }

  addEdgeFirstBoxId="";
}



/* Klicks auf Zeichenfläche */

function canvasClick(event) {
  if (animationActive) return;

  const target=event.target;
  const canvas=document.getElementById("canvas_area");

  /* Kanten-Hinzufüge-Modus */
  if (addEdgeActive) {
    if (target==canvas) {addEdgeClick(); return;}
    if (addEdgeFirstBoxId=="") {
      document.getElementById('sidebar-edges-info').innerHTML=language.tabEdge.step2;
      document.getElementById('sidebar-edges-info-img').src='./images/AddEdge2.webp';
      addEdgeFirstBoxId=target.id;
      return;
    }
    addEdgeToModel(addEdgeFirstBoxId,target.id);
    addEdgeFirstBoxId="";
    document.getElementById('sidebar-edges-info').innerHTML=language.tabEdge.step1;
    document.getElementById('sidebar-edges-info-img').src='./images/AddEdge1.webp';
    return;
  }

  /* Kante anklicken */
  if (typeof(target.dataset.edgeIndex)!='undefined') {
    showEdgeEditor(edges[target.dataset.edgeIndex],target.dataset.edgeIndex);
    return;
  }

  /* Element anklicken */
  if (typeof(target.dataset.elementIndex)!='undefined') {
    showElementEditor(elements[target.dataset.elementIndex],target.dataset.elementIndex,elements);
    return;
  }

  showTemplatesSidebar();
}

function showEdgeEditor(edge, index) {
  showEditorSidebar();
  const editor=document.getElementById('sidebar-editor-inner');

  const heading=document.createElement("h4");
  editor.appendChild(heading);
  heading.innerHTML="<i class='bi bi-share-fill'></i> "+language.tabEdge.titleEdit;

  editor.appendChild(document.createElement("hr"));

  const info=document.createElement("div");
  editor.appendChild(info);
  const element1=getElementByBoxId(edge.boxId1);
  const element2=getElementByBoxId(edge.boxId2);
  const name1=getRecordByType(element1.type).name+" "+element1.nr;
  const name2=getRecordByType(element2.type).name+" "+element2.nr;
  info.innerHTML=language.tabEdge.editInfo1+" <b>"+name1+"</b> "+language.tabEdge.editInfo2+" <b>"+name2+"</b>.";

  editor.appendChild(document.createElement("hr"));

  const menu=document.createElement("ul");
  menu.className="sidebarmenu";
  editor.appendChild(menu);

  const item=document.createElement("li");
  menu.appendChild(item);
  item.innerHTML="<i class='bi bi-trash'></i> "+language.tabEdge.delete;
  item.onclick=function() {edges.splice(index,1); updateModelOnCanvas(); showTemplatesSidebar();}
}

function showElementEditor(element, index, allElements) {
  const name=getRecordByType(element.type).name+" "+element.nr;

  showEditorSidebar();
  const editor=document.getElementById('sidebar-editor-inner');

  const heading=document.createElement("h4");
  editor.appendChild(heading);
  heading.innerHTML=name;

  editor.appendChild(document.createElement("hr"));

  addEditorElements(element,editor,allElements);

  editor.appendChild(document.createElement("hr"));

  const menu=document.createElement("ul");
  menu.className="sidebarmenu";
  editor.appendChild(menu);

  const item=document.createElement("li");
  menu.appendChild(item);
  item.innerHTML="<i class='bi bi-trash'></i> "+language.editor.deleteStation;
  item.onclick=function() {
    deleteEdges(element.boxId);
    elements.splice(index,1);
    updateModelOnCanvas();
    showTemplatesSidebar();
  }
}

function descriptionForParameter(parameter) {
  if (parameter=="EI") return language.editor.EI;
  if (parameter=="CVI") return language.editor.CVI;
  if (parameter=="ES") return language.editor.ES;
  if (parameter=="CVS") return language.editor.CVS;
  if (parameter=="EWT") return language.editor.EWT;
  if (parameter=="CVWT") return language.editor.CVWT;
  if (parameter=="c") return language.editor.c;
  if (parameter=="b") return language.editor.b;
  if (parameter=="mode") return language.editor.mode;
  if (parameter=="policy") return language.editor.policy;
  if (parameter=="rates") return language.editor.rates;
  if (parameter=="text") return language.editor.text;
  if (parameter=="fontSize") return language.editor.fontSize;
  if (parameter=="SuccessNextBox") return language.editor.SuccessNextBox;
  if (parameter=='release') return language.editor.release;
  if (parameter=='signal') return language.editor.signal;
  if (parameter=='source') return language.editor.source;
  if (parameter=='xrange') return language.editor.xrange;
  return "";
}

function nameForParameter(parameter) {
  if (parameter=="EI") return "E[I]";
  if (parameter=="CVI") return "CV[I]";
  if (parameter=="ES") return "E[S]";
  if (parameter=="CVS") return "CV[S]";
  if (parameter=="EWT") return "E[WT]";
  if (parameter=="CVWT") return "CV[WT]";
  if (parameter=="mode") return language.editor.modeLabel;
  if (parameter=="policy") return language.editor.policyLabel;
  if (parameter=="rates") return "";
  if (parameter=="text") return "";
  if (parameter=="fontSize") return language.editor.fontSizeLabel;
  if (parameter=="SuccessNextBox") return "";
  if (parameter=='release') return language.editor.releaseLabel;
  if (parameter=='signal') return language.editor.signalLabel;
  if (parameter=='source') return language.editor.sourceLabel;
  if (parameter=='xrange') return language.editor.xrangeLabel;
  return parameter;
}

function getNextStations(element) {
  const boxId=element.boxId;

  const nextElements=[];
  for (let i=0;i<edges.length;i++) if (edges[i].boxId1==boxId) nextElements.push(getElementByBoxId(edges[i].boxId2));
  return nextElements;
}

function addEditorElements(element, parent, allElements) {
  if (typeof(element.setup)=='undefined' || element.setup.length==0) {
    const info=document.createElement("div");
    parent.appendChild(info);
    info.innerHTML=language.editor.noSettings;
  }

  const form=document.createElement("form");
  parent.appendChild(form);

  const nextElements=getNextStations(element);

  for (let name in element.setup) {
    if ((name=='EWT' || name=='CVWT' || name=="SuccessNextBox") && nextElements.length!=2) continue;

    const value=element.setup[name];

    const info=document.createElement("div");
    form.appendChild(info);
    info.style.fontSize="90%";
    info.innerHTML=descriptionForParameter(name);

    const div=document.createElement("div");
    form.appendChild(div);
    div.className="input-group";

    const labelName=nameForParameter(name);
    if (labelName!='') {
      const span=document.createElement("span");
      div.appendChild(span);
      span.className="input-group-text";
      span.innerHTML=labelName+":=";
    }

    if (name=="mode") {
      const select=document.createElement("select");
      div.appendChild(select);
      select.className="form-select";
      let options="";
      options+="<option value='0'"+((value==0)?' selected':'')+'>'+language.editor.modeRandom+'</option>';
      options+="<option value='1'"+((value==1)?' selected':'')+'>'+language.editor.modeMinNQ+'</option>';
      options+="<option value='2'"+((value==2)?' selected':'')+'>'+language.editor.modeMinN+'</option>';
      select.innerHTML=options;
      select.onchange=function(){element.setup[name]=select.value;}

      const info2=document.createElement("div");
      form.appendChild(info2);
      info2.style.marginBottom="15px";
      info2.style.fontSize="80%";
      info2.innerHTML=language.editor.modeInfo;
      continue;
    }

    if (name=="policy") {
      const select=document.createElement("select");
      div.appendChild(select);
      select.className="form-select";
      let options="";
      options+="<option value='1'"+((value==1)?' selected':'')+'>'+language.editor.policyFIFO+'</option>';
      options+="<option value='0'"+((value==0)?' selected':'')+'>'+language.editor.policyRandom+'</option>';
      options+="<option value='-1'"+((value==-1)?' selected':'')+'>'+language.editor.policyLIFO+'</option>';
      select.innerHTML=options;
      select.onchange=function(){element.setup[name]=select.value;}
      continue;
    }

    if (name=="SuccessNextBox") {
      let val=(typeof(value)=='undefined' || value<=0 || value=='')?nextElements[0].id:value;
      if (val!=nextElements[0].id && val!=nextElements[1].id) val=nextElements[0].id;
      const select=document.createElement("select");
      div.appendChild(select);
      select.className="form-select";
      let options="";
      options+="<option value='"+nextElements[0].id+"'"+((val==nextElements[0].id)?' selected':'')+'>'+nextElements[0].name+'</option>';
      options+="<option value='"+nextElements[1].id+"'"+((val==nextElements[1].id)?' selected':'')+'>'+nextElements[1].name+'</option>';
      select.innerHTML=options;
      select.onchange=function(){element.setup[name]=select.value;}
      continue;
    }

    if (name=="signal") {
      const select=document.createElement("select");
      div.appendChild(select);
      select.className="form-select";
      let options="";
      for (let nr of allElements.filter(element=>element.type=='Signal').map(element=>element.nr)) {
        options+="<option value='"+nr+"'"+((value==nr)?' selected':'')+'>'+language.templates.signal+" "+nr+'</option>';
      }
      select.innerHTML=options;
      select.onchange=function(){element.setup[name]=select.value;}
      continue;
    }

    if (name=="source") {
      const sourceTypes=["Process","Delay","Batch","Barrier"];
      const select=document.createElement("select");
      div.appendChild(select);
      select.className="form-select";
      let options="";
      for (let source of allElements.filter(element=>sourceTypes.indexOf(element.type)>=0)) {
        const listId=source.type+"-"+source.nr;
        options+="<option value='"+listId+"'"+((value==listId)?' selected':'')+'>'+source.name+'</option>';
      }
      select.innerHTML=options;
      select.onchange=()=>{
        element.setup[name]=select.value;
        if (element.visibleSetup) updateModelOnCanvas();
      }
      element.setup[name]=select.value;
        if (element.visibleSetup) updateModelOnCanvas();
      continue;
    }

    const input=document.createElement("input");
    div.appendChild(input);
    input.type="text";
    input.className="form-control";
    input.value=value;
    input.onchange=function(){
      element.setup[name]=input.value;
      if (element.visibleSetup) updateModelOnCanvas();
    }

    if (name=="rates" && nextElements.length>0) {
      const info2=document.createElement("div");
      form.appendChild(info2);
      info2.style.marginBottom="15px";
      info2.style.fontSize="80%";
      let text=language.editor.ratesLabel+": "+nextElements[0].name;
      for (let i=1;i<nextElements.length;i++) text+=", "+nextElements[i].name;
      info2.innerHTML=text;
    }
  }
}

function deleteEdges(boxId) {
  let index=0;
  while (index<edges.length) {
    if (edges[index].boxId1==boxId || edges[index].boxId2==boxId) {
      edges.splice(index,1);
    } else {
      index++;
    }
  }
}



/* Modell */

const elements=[];
const edges=[];

function getNextFreeId() {
  let nextId=1;
  let ok=false;
  while (!ok) {
    ok=true;
    for (let i=0;i<elements.length;i++) if (elements[i].id==nextId) {nextId++; ok=false; break;}
    if (ok) break;
  }
  return nextId;
}

function getNextFreeTypeNr(type) {
  let nextNr=1;
  let ok=false;
  while (!ok) {
    ok=true;
    for (let i=0;i<elements.length;i++) if (elements[i].type==type && elements[i].nr==nextNr) {nextNr++; ok=false; break;}
    if (ok) break;
  }
  return nextNr;
}

function addElementToModel(type, top, left) {
  const id=getNextFreeId();
  const nr=getNextFreeTypeNr(type);
  const boxId="Box"+id;

  const template=getRecordByType(type);

  elements.push({
    id: id,
    boxId: boxId,
    type: type,
    name: template.name+" "+nr,
    nr: nr,
    top: top,
    left: left,
    setup: structuredClone(template.setup),
    visibleSetup: ((typeof(template.visibleSetup)=='undefined')?false:template.visibleSetup),
    visualOnly: ((typeof(template.visualOnly)=='undefined')?false:template.visualOnly)
  });
  updateModelOnCanvas();

  return boxId;
}

function addTextToModel(top, left, text, fontSize=12) {
  const boxId=addElementToModel("Text",top,left);
  const element=getElementByBoxId(boxId);
  element.setup.text=text;
  element.setup.fontSize=fontSize;
  updateModelOnCanvas();
}

function addDiagramToModel(top, left, source) {
  const boxId=addElementToModel("Diagram",top,left);
  const element=getElementByBoxId(boxId);
  element.setup.source=source;
  updateModelOnCanvas();
}

function getElementByBoxId(boxId) {
  for (let i=0;i<elements.length;i++) if (elements[i].boxId==boxId) return elements[i];
  return null;
}

function addEdgeToModel(boxId1, boxId2) {
  /* Elemente finden */
  let element1=getElementByBoxId(boxId1);
  let element2=getElementByBoxId(boxId2);

  if (element1==element2) {
    showMessage(language.dialog.Error,language.tabEdge.errorCircle);
    return;
  }

  /* Vorlagen finden */
  let template1=null;
  for (let i=0;i<templates.length;i++) if (templates[i].type==element1.type) {template1=templates[i]; break;}
  let template2=null;
  for (let i=0;i<templates.length;i++) if (templates[i].type==element2.type) {template2=templates[i]; break;}

  /* Aus- und einlaufende Kanten zählen */
  let edgesOut=0;
  let edgesIn=0;
  for (let i=0;i<edges.length;i++) {
    const edgeBoxId1=edges[i].boxId1;
    const edgeBoxId2=edges[i].boxId2;
    if (edgeBoxId1==boxId1) edgesOut++;
    if (edgeBoxId2==boxId2) edgesIn++;
  }

  /* Fehlermeldungen, wenn Kante nicht hinzugefügt werden kann */
  if (edgesOut>=template1.maxEdgesOut) {
    showMessage(language.dialog.Error,language.tabEdge.errorSource);
    return;
  }
  if (edgesIn>=template2.maxEdgesIn) {
    showMessage(language.dialog.Error,language.tabEdge.errorDestination);
    return;
  }

  /* Kante hinzufügen */
  edges.push({boxId1: boxId1, boxId2: boxId2});
  updateModelOnCanvas();
}

function addElementToCanvas(element, index, elements) {
  const template=getRecordByType(element.type);
  const elementNode=template.addFunc("Box"+element.id,element.nr,element.top,element.left,element.setup,false,elements);
  elementNode.dataset.elementIndex=index;
}

function addEdgeToCanvas(edge, index) {
  const element1=document.getElementById(edge.boxId1);
  const element2=document.getElementById(edge.boxId2);

  /* Anknüpfpunkte für Kanten bestimmen */
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

  /* Kürzeste Verbindung bestimmen */
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

  /* Canvas-Element für Kante erzeugen */
  const edgeCanvas=document.createElement("canvas");
  const canvas=document.getElementById("canvas_area");
  canvas.appendChild(edgeCanvas);
  edgeCanvas.dataset.edgeIndex=index;

  edgeCanvas.className="edge";
  edgeCanvas.alt=language.tabEdge.titleEdit;
  edgeCanvas.title=language.tabEdge.titleEdit;
  edgeCanvas.style.top=(Math.min(arrow1[1],arrow2[1])-20)+"px";
  edgeCanvas.style.left=(Math.min(arrow1[0],arrow2[0])-20)+"px";
  edgeCanvas.style.height=(Math.abs(arrow1[1]-arrow2[1])+40)+"px";
  edgeCanvas.style.width=(Math.abs(arrow1[0]-arrow2[0])+40)+"px";
  edgeCanvas.height=(Math.abs(arrow1[1]-arrow2[1])+40);
  edgeCanvas.width=(Math.abs(arrow1[0]-arrow2[0])+40);
  const sy=Math.min(arrow1[1],arrow2[1])-20;
  const sx=(Math.min(arrow1[0],arrow2[0])-20);

  /* Kante zeichnen */
  const ctx=edgeCanvas.getContext("2d");
  ctx.lineWidth=2;
  ctx.strokeStyle="black";

  const a={x: arrow1[0]-sx, y: arrow1[1]-sy};
  const b={x: arrow2[0]-sx, y: arrow2[1]-sy};
  const delta={x: b.x-a.x, y: b.y-a.y};
  const delta2={x: delta.y, y: -delta.x};

  let l;
  l=Math.sqrt(delta.x**2+delta.y**2);
  delta.x/=l;
  delta.y/=l;
  l=Math.sqrt(delta2.x**2+delta2.y**2);
  delta2.x/=l;
  delta2.y/=l;

  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();

  let c;

  /* Pfeile zeichnen */
  c={x: b.x-15*delta.x+15*delta2.x, y: b.y-15*delta.y+15*delta2.y};
  ctx.beginPath();
  ctx.moveTo(b.x,b.y);
  ctx.lineTo(c.x,c.y);
  ctx.stroke();

  c={x: b.x-15*delta.x-15*delta2.x, y: b.y-15*delta.y-15*delta2.y};
  ctx.beginPath();
  ctx.moveTo(b.x,b.y);
  ctx.lineTo(c.x,c.y);
  ctx.stroke();
}

function updateModelOnCanvas() {
  const canvas=document.getElementById("canvas_area");

  while (canvas.firstChild) canvas.removeChild(canvas.lastChild);

  if (elements.length==0) {
    let infoText="";
    if (language.canvasInfoLang!=null && language.canvasInfoLang!="") {
      infoText+="<span style='font-size: 90%; border: 1px solid #CCC; background-color: #FAFAFA; padding: 5px 10px; border-radius: 3px; cursor: default;'>"+language.canvasInfoLang+"</span><br><br><br>";
    }
    infoText+='<span style="cursor: default;">'+language.canvasInfo+"</span>";

    const info=document.createElement("div");
    canvas.appendChild(info);
    info.style.position="absolute";
    info.style.top="50px";
    info.style.left="50px";
    info.style.padding="15px";
    info.style.color="#555";
    info.innerHTML=infoText;
    return;
  }

  for (let i=0;i<elements.length;i++) addElementToCanvas(elements[i],i,elements);
  for (let i=0;i<edges.length;i++) addEdgeToCanvas(edges[i],i);
}