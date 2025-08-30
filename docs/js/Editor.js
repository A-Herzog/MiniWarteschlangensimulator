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

export {zoomIn, zoomOut, showMessage, showConfirmationMessage, discardModel, fileNew, fileLoad, fileLodeJSON, fileLoadDrag, fileLoadDragEnter, fileLoadDragLeave, fileLoadDrop, fileSave, showFileSidebar, showTemplatesSidebar, showAnimationSidebar, showMoreSidebar, allowDrop, dragElement, dragElementProgress, dragTemplate, canvasDrop, addEdgeActive, addEdgeClick, canvasClick, elements, edges, addElementToModel, addTextToModel, addDiagramToModel, getElementByBoxId, addEdgeToModel, updateModelOnCanvas, deleteSelectedElement};

import {language} from "./Language.js";
import {animationActive} from "./Animator.js";
import {templates, getRecordByType} from "./Templates.js";
import {isDesktopApp} from "./Tools.js";


/* === Zooming system === */

/**
 * Update canvas after window resize
 */
function resizeCanvas() {
  let style;

  if (document.getElementById("sidebar")==null) return;

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

if (typeof(window)!='undefined') window.addEventListener('load', (event) => {
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

/**
 * Enable or disable zoom buttons (when minimum/maximum zoom level is reached).
 */
function updateZoomButtons() {
  document.getElementById('zoom_button_in').disabled=canvasScale>=140;
  document.getElementById('zoom_button_out').disabled=canvasScale<=60;
}

/**
 * Decreate zoom level.
 */
function zoomOut() {
  if (canvasScale<=60) return;
  canvasScale-=20;
  updateZoomButtons();
  updateCanvasScale(canvasScale/100);
}

/**
 * Increase zoom level.
 */
function zoomIn() {
  if (canvasScale>=140) return;
  canvasScale+=20;
  updateZoomButtons();
  updateCanvasScale(canvasScale/100);
}

/**
 * Update canvas scaling (css) when zoom level was increased or decreased.
 * @param {Number} newScale New canvas scaling
 */
function updateCanvasScale(newScale) {
  const canvas=document.getElementById('canvas_area');
  canvas.style.transform='scale('+newScale+')';
}


/* === Messages === */

/**
 * Shows a message box with an "Ok" button.
 * @param {String} title Message box title
 * @param {String} msg Message box content
 */
function showMessage(title, msg) {
  document.getElementById('modalMessageTitle').innerHTML=title;
  document.getElementById('modalMessageBody').innerHTML=msg;
  const dialog=new bootstrap.Modal(document.getElementById('modalMessage'),{});
  document.getElementById('modalMessage').onkeyup=event=>{if (event.key=="Enter" || event.key=="Escape") dialog.hide();}
  dialog.show();
}

/**
 * Shows a Yes/No message box.
 * @param {String} title Message box title
 * @param {String} msg Message box content
 * @param {Function} yesCallback Function to be invoked on "Yes" click
 */
function showConfirmationMessage(title, msg, yesCallback) {
  document.getElementById('modalConfirmationTitle').innerHTML=title;
  document.getElementById('modalConfirmationBody').innerHTML=msg;
  document.getElementById('modalConfirmationYesButton').onclick=yesCallback;
  const dialog=new bootstrap.Modal(document.getElementById('modalConfirmation'),{});
  document.getElementById('modalConfirmation').onkeyup=event=>{if (event.key=="Enter") {dialog.hide(); yesCallback();}}
  dialog.show();
}

/**
 * Shows a "Discard model now?" message box.
 * @param {Function} yesCallback Function to be invoked on "Yes" click
 */
function discardModel(yesCallback) {
  if (elements.length==0) {
    yesCallback();
    return;
  }
  showConfirmationMessage(language.tabFile.modelDiscardTitle,language.tabFile.modelDiscardText,yesCallback);
}


/* === Load/save models === */

/**
 * Menu function: File | New
 */
function fileNew() {
  discardModel(function() {
    elements.length=0;
    edges.length=0;
    updateModelOnCanvas();
    showTemplatesSidebar();
  });
}

/**
 * Handler for File | Load drag over event
 * @param {Object} event
 */
function fileLoadDrag(event) {
  event.preventDefault();
}

let fileLoadEnterCount=0;

/**
 * Handler for File | Load drag enter event
 * @param {Object} event
 */
function fileLoadDragEnter(event) {
  const element=document.getElementById('fileLoadDropTarget');
  element.style.fontWeight="bold";
  element.style.backgroundColor="#5A5";
  fileLoadEnterCount++;
}

/**
 * Handler for File | Load drag leave event
 * @param {Object} event
 */
function fileLoadDragLeave(event) {
  fileLoadEnterCount--;
  if (fileLoadEnterCount>0) return;
  const element=document.getElementById('fileLoadDropTarget');
  element.style.fontWeight="";
  element.style.backgroundColor="";
}

/**
 * Trys to load a model from a JSON object given as a string
 * @param {String} text String to be interpreted as JSON and then as a model
 */
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

/**
 * Handler for File | Load file drop event
 * @param {Object} event
 */
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

/**
 * Menu function: File | Load
 * (in desktop app version; in web app version only drag and drop loading is possible)
 */
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

/**
 * Menu function: File | Save
 */
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


/* === Sidebar === */

/**
 * Currently select edge (-1 for no edge selected)
 * @see showEdgeEditor
 * @see showSidebar
 * @see deleteSelectedElement
 */
let indexEdgeInEditor=-1;

/**
 * Currently select station (-1 for no station selected)
 * @see showElementEditor
 * @see showSidebar
 * @see deleteSelectedElement
 */
let indexElementInEditor=-1;

/**
 * Shows a specified sidebar
 * @param {Number} nr Sidebar to be displayed (number between 0 and 5)
 * @see showFileSidebar()
 * @see showTemplatesSidebar()
 * @see showEdgesSidebar()
 * @see showEditorSidebar()
 * @see showAnimationSidebar()
 * @see showMoreSidebar()
 */
function showSidebar(nr) {
  let needCanvasUpdate=edges.filter(edge=>edge.select).length>0 || elements.filter(element=>element.select).length>0;
  edges.forEach(edge=>edge.select=false);
  elements.forEach(element=>element.select=false);
  if (needCanvasUpdate) updateModelOnCanvas();

  indexEdgeInEditor=-1;
  indexElementInEditor=-1;
  document.getElementById('sidebar-file').style.display=(nr==0)?"inline":"none";
  document.getElementById('sidebar-templates').style.display=(nr==1)?"inline":"none";
  document.getElementById('sidebar-edges').style.display=(nr==2)?"inline":"none";
  document.getElementById('sidebar-editor').style.display=(nr==3)?"inline":"none";
  document.getElementById('sidebar-animation').style.display=(nr==4)?"inline":"none";
  document.getElementById('sidebar-more').style.display=(nr==5)?"inline":"none";

  const editorContent=document.getElementById('sidebar-editor-inner');
  while (editorContent.firstChild) editorContent.removeChild(editorContent.lastChild);
}

/**
 * Shows the file menu sidebar.
 */
function showFileSidebar() {
  if (animationActive) return;
  if (addEdgeActive) addEdgeClick();
  showSidebar(0);
}

/**
 * Shows the add elements sidebar.
 */
function showTemplatesSidebar() {
  if (animationActive) return;
  if (addEdgeActive) addEdgeClick();
  showSidebar(1);
  resizeCanvas();
}

/**
 * Shows the add edge sidebar.
 */
function showEdgesSidebar() {
  if (animationActive) return;
  showSidebar(2);
}

/**
 * Shows elements settings editor sidebar.
 */
function showEditorSidebar() {
  if (animationActive) return;
  showSidebar(3);
}

/**
 * Shows the animation sidebar.
 */
function showAnimationSidebar() {
  showSidebar(4);
}

/**
 * Shows the File | More information sidebar.
 */
function showMoreSidebar() {
  if (animationActive) return;
  showSidebar(5);
}


/* === Template drag & drop operations === */

/**
 * Callback handler for testing if dropping templates on the drawing surface is allowed.
 * @param {Object} ev Drop event
 * @returns Is dropping templates on surface allowed?
 */
function allowDrop(ev) {
  if (animationActive) return false;
  ev.preventDefault();
}

/**
 * Callback when starting to drag a template from the templates sidebar
 * @param {Object} ev Drag start event
 */
function dragTemplate(ev) {
  if (animationActive) return;

  ev.dataTransfer.setData("templateType",ev.target.dataset.type);
  ev.dataTransfer.setData("deltaX",ev.layerX);
  ev.dataTransfer.setData("deltaY",ev.layerY);
}

/**
 * Callback when starting to drag an element on the drawing surface
 * @param {Object} ev Drag start event
 */
function dragElement(ev) {
  if (animationActive) return;

  /* Respect surface zooming */
  ev.target.style.left=Math.round(parseInt(ev.target.style.left)*canvasScale/100)+"px";
  ev.target.style.top=Math.round(parseInt(ev.target.style.top)*canvasScale/100)+"px";
  ev.target.style.transform="scale("+(canvasScale/100)+")"; /* This will also zoom the original element on the surface - this is why we hide the original element while dragging */

  ev.dataTransfer.setData("moveBoxId",ev.target.id);
  ev.dataTransfer.setData("deltaX",ev.layerX);
  ev.dataTransfer.setData("deltaY",ev.layerY);
}

/**
 * Callback when dragging (after start drag) on the drawing surface
 * @param {Object} ev Drag event
 */
function dragElementProgress(ev) {
  if (animationActive) return;

  ev.target.style.display="none"; /* Hide original element (not possible in start drag event) */
}

/**
 * Callback when dropping an element or a template on the drawing surface.
 * @param {Object} ev Drop event
 */
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
    /* From templates bar */
    addElementToModel(templateType,top,left);
  } else {
    /* Element moved or copied */
    const boxId=ev.dataTransfer.getData("moveBoxId");
    let index=-1;
    for (let i=0;i<elements.length;i++) if (elements[i].boxId==boxId) {index=i; break;}
    if (index<0) return;
    if (ev.ctrlKey) {
      addCopyElementToModel(elements[index],top,left);
    } else {
      elements[index].top=top;
      elements[index].left=left;
    }
    updateModelOnCanvas();
  }
}


/* === Translate touch operation to drag & drop === */

let dragStartElementX;
let dragStartElementY;
let dragStartX;
let dragStartY;

/**
 * Touch down event handler
 * @param {Object} e Touch event
 */
function handle_touch_down(e) {
  if (animationActive) return;
  if (!e.target.classList.contains("draggable")) return;

  /* Store start position for element on drawing surface */
  dragStartElementX=e.target.offsetLeft;
  dragStartElementY=e.target.offsetTop;
  dragStartX=e.targetTouches[0].clientX;
  dragStartY=e.targetTouches[0].clientY;
}

/**
 * Touch move event handler
 * @param {Object} e Touch event
 */
function handle_touch_move(e) {
  if (animationActive) return;
  if (!e.target.classList.contains("draggable")) return;

  /* Moving relative to stored starting position */
  const posx=e.targetTouches[0].clientX;
  const posy=e.targetTouches[0].clientY;
  const deltaX=posx-dragStartX;
  const deltaY=posy-dragStartY;
  e.target.style.left=(dragStartElementX+deltaX)+"px";
  e.target.style.top=(dragStartElementY+deltaY)+"px";

  /* Do not scroll drawing surface as long as dragging elements is active */
  e.preventDefault();
}

/**
 * Touch up event handler (for moving elements on the drawing surface)
 * @param {Object} e Touch event
 */
function handle_touch_up_canvas(e) {
  if (animationActive) return;
  if (!e.target.classList.contains("draggable")) return;

  /* Update data from div element in editor element */
  const boxId=e.target.id;
  for (let i=0;i<elements.length;i++) if (elements[i].boxId==boxId) {
    elements[i].top=e.target.offsetTop;
    elements[i].left=e.target.offsetLeft;
    break;
  }

  /* Redraw model (for updating edges) */
  updateModelOnCanvas();
}

/**
 * Touch up event handler (for dragging templates to the drawing surface)
 * @param {Object} e Touch event
 */
function handle_touch_up_templates(e) {
  if (animationActive) return;
  if (!e.target.classList.contains("draggable")) return;

  /* Calculate coordinates relative to the drawing surface */
  const sourceRect=document.getElementById('templates_area').getBoundingClientRect();
  const destRect=document.getElementById('canvas_area').getBoundingClientRect();
  const deltaX=destRect.x-sourceRect.x;
  const deltaY=destRect.y-sourceRect.y;
  const top=e.target.offsetTop-deltaY;
  const left=e.target.offsetLeft-deltaX;

  /* Is drop position in the target area? */
  if (top>=0 && left>=0) {
    const templateType=e.target.dataset.type;
    addElementToModel(templateType,top,left);
  }

  /* Move template div back to the initial location */
  e.target.style.left=dragStartElementX+"px";
  e.target.style.top=dragStartElementY+"px";
}

if (typeof(window)!='undefined' && typeof(document)!='undefined' && (("ontouchstart" in document.documentElement) || navigator.maxTouchPoints>0)) window.addEventListener('load', (event) => {
  const canvasArea=document.getElementById('canvas_area');
  canvasArea.addEventListener("touchstart",handle_touch_down,false);
  canvasArea.addEventListener("touchmove",handle_touch_move,false);
  canvasArea.addEventListener("touchend",handle_touch_up_canvas,false);

  const templatesArea=document.getElementById('templates_area');
  templatesArea.addEventListener("touchstart",handle_touch_down,false);
  templatesArea.addEventListener("touchmove",handle_touch_move,false);
  templatesArea.addEventListener("touchend",handle_touch_up_templates,false);
});


/* === Edges === */

let addEdgeActive=false;
let addEdgeFirstBoxId;

/**
 * Start adding an edge element.
 */
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


/* === Clicks or key down on the drawing surface === */

/**
 * Callback for clicking on the drawing surface
 * @param {Object} event Click event
 */
function canvasClick(event) {
  if (animationActive) return;

  const target=event.target;
  const canvas=document.getElementById("canvas_area");

  /* Add edges modes */
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

  /* Click on existing edge */
  if (typeof(target.dataset.edgeIndex)!='undefined') {
    showEdgeEditor(edges[target.dataset.edgeIndex],target.dataset.edgeIndex);
    return;
  }

  /* Click on existing element */
  if (typeof(target.dataset.elementIndex)!='undefined') {
    showElementEditor(elements[target.dataset.elementIndex],target.dataset.elementIndex);
    return;
  }

  showTemplatesSidebar();
}

/**
 * Shows the editor sidebar for editing an edge
 * @param {Object} edge Edge object to be edited
 * @param {Number} index Index of the edge object in the list of all edges
 */
function showEdgeEditor(edge, index) {
  showEditorSidebar();
  edge.select=true;
  indexEdgeInEditor=index;
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

  updateModelOnCanvas();
}

/**
 * Shows the editor sidebar for editing a station
 * @param {Object} element Station object to be edited
 * @param {Number} index Index of the station object in the list of all stations
 */
function showElementEditor(element, index) {
  const name=getRecordByType(element.type).name+" "+element.nr;

  showEditorSidebar();
  element.select=true;
  indexElementInEditor=index;
  const editor=document.getElementById('sidebar-editor-inner');

  const heading=document.createElement("h4");
  editor.appendChild(heading);
  heading.innerHTML=name;

  editor.appendChild(document.createElement("hr"));

  addEditorElements(element,editor);

  editor.appendChild(document.createElement("hr"));

  const menu=document.createElement("ul");
  menu.className="sidebarmenu";
  editor.appendChild(menu);

  const item=document.createElement("li");
  menu.appendChild(item);
  item.innerHTML="<i class='bi bi-trash'></i> "+language.editor.deleteStation;
  item.onclick=e=>deleteElement(element,index);

  updateModelOnCanvas();
}

/**
 * Deletes an element
 * @param {Object} element Station object to be edited
 * @param {Number} index Index of the station object in the list of all stations
 */
function deleteElement(element, index) {
  deleteEdges(element.boxId);
  elements.splice(index,1);
  updateModelOnCanvas();
  showTemplatesSidebar();
}

/**
 * Returns the description for a station parameter to be shown above the input field for the parameter.
 * @param {String} parameter Station parameter name
 * @returns Description for the parameter
 */
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
  if (parameter=='storeSignals') return language.editor.storeSignals;
  if (parameter=='source') return language.editor.source;
  if (parameter=='xrange') return language.editor.xrange;
  return "";
}

/**
 * Returns the formula smybol for a station parameter to be shown on the left of the input field for the parameter.
 * @param {String} parameter Station parameter name
 * @returns Formula symbol for the parameter
 */
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
  if (parameter=='storeSignals') return language.editor.storeSignalsLabel;
  if (parameter=='source') return language.editor.sourceLabel;
  if (parameter=='xrange') return language.editor.xrangeLabel;
  return parameter;
}

/**
 * Returns a list of the stations which are directly connected via outgoing edges from a station.
 * @param {Object} element Station object for which the following station are to be listed
 * @returns Following stations
 * @see addEditorElements
 */
function getNextStations(element) {
  const boxId=element.boxId;

  const nextElements=[];
  for (let i=0;i<edges.length;i++) if (edges[i].boxId1==boxId) nextElements.push(getElementByBoxId(edges[i].boxId2));
  return nextElements;
}

/**
 * Adds input lines for the parameters of a station to a HTML node
 * @param {Object} element Station object to be edited
 * @param {Object} parent Parent HTML node in which the input lines are to be inserted
 */
function addEditorElements(element, parent) {
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
      options+="<option value='3'"+((value==3)?' selected':'')+'>'+language.editor.modeMaxNQ+'</option>';
      options+="<option value='4'"+((value==4)?' selected':'')+'>'+language.editor.modeMaxN+'</option>';
      // options+="<option value='5'"+((value==5)?' selected':'')+'>'+language.editor.modeCondition+'</option>';
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
      options+="<option value='2'"+((value==2)?' selected':'')+'>'+language.editor.policySJF+'</option>';
      options+="<option value='-2'"+((value==-2)?' selected':'')+'>'+language.editor.policyLJF+'</option>';
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
      for (let nr of elements.filter(element=>element.type=='Signal').map(element=>element.nr)) {
        options+="<option value='"+nr+"'"+((value==nr)?' selected':'')+'>'+language.templates.signal+" "+nr+'</option>';
      }
      select.innerHTML=options;
      select.onchange=function(){element.setup[name]=select.value;}
      continue;
    }

    if (name=="storeSignals") {
      div.classList.add("form-switch");
      const checkBox=document.createElement("input");
      div.appendChild(checkBox);
      checkBox.type="checkbox";
      checkBox.className="form-check-input";
      checkBox.checked=element.setup[name];
      checkBox.onchange=function(){element.setup[name]=checkBox.checked;}
      checkBox.style.borderRadius=".25em";
      const checkBoxLabel=document.createElement("label");
      div.appendChild(checkBoxLabel);
      checkBoxLabel.className="form-check-label";
      checkBoxLabel.innerHTML=language.editor.storeSignalsLabel2;
      checkBoxLabel.style.paddingLeft="10px";
      checkBoxLabel.htmlFor=checkBox;
      continue;
    }

    if (name=="source") {
      const sourceTypes=["Process","Delay","Batch","Barrier"];
      const select=document.createElement("select");
      div.appendChild(select);
      select.className="form-select";
      let options="";
      for (let source of elements.filter(element=>sourceTypes.indexOf(element.type)>=0)) {
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

/**
 * Deletes all incoming and outgoing edges to/from a station.
 * (Is called when deleting the station itself.)
 * @param {Number} boxId ID of the station
 */
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

/**
 * Deletes the currently selected station or edge.
 */
function deleteSelectedElement() {
  if (indexElementInEditor>=0) {
    const element=elements[indexElementInEditor];
    deleteEdges(element.boxId);
    elements.splice(indexElementInEditor,1);
    updateModelOnCanvas();
    showTemplatesSidebar();
    return;
  }

  if (indexEdgeInEditor>=0) {
    edges.splice(indexEdgeInEditor,1);
    updateModelOnCanvas();
    showTemplatesSidebar();
    return;
  }
}


/* === Model === */

/**
 * List of all stations in the model
 */
const elements=[];

/**
 * List of all edges in the model
 */
const edges=[];

/**
 * Returns the smallest natural number which is not already used as an id for a station.
 * @returns Next free id for a station
 */
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

/**
 * Returns the next free not used number for a station type (to be displayed below the name of the station in the station box)
 * @param {String} type Internal type name of the station
 * @returns Free number (starting with 1) for stations of the given type
 */
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

/**
 * Adds a new station at a defined position to the model
 * @param {String} type Internal type name of the station
 * @param {Number} top Y coordinate of the station box
 * @param {Number} left X coordinate of the station box
 * @returns Id of then new station
 */
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

/**
 * Adds a new station as a copy of an existing station at a defined position to the model
 * @param {Object} copySource Station to be copied
 * @param {Number} top Y coordinate of the station box
 * @param {Number} left X coordinate of the station box
 * @returns Id of then new station
 */
function addCopyElementToModel(copySource, top, left) {
  const id=getNextFreeId();
  const nr=getNextFreeTypeNr(copySource.type);
  const boxId="Box"+id;

  const template=getRecordByType(copySource.type);

  elements.push({
    id: id,
    boxId: boxId,
    type: copySource.type,
    name: template.name+" "+nr,
    nr: nr,
    top: top,
    left: left,
    setup: structuredClone(copySource.setup),
    visibleSetup: ((typeof(copySource.visibleSetup)=='undefined')?false:copySource.visibleSetup),
    visualOnly: ((typeof(copySource.visualOnly)=='undefined')?false:copySource.visualOnly)
  });
  updateModelOnCanvas();

  return boxId;
}

/**
 * Adds a text line to the model
 * @param {Number} top Y coordinate of the upper left position of the text line
 * @param {Number} left X coordinate of the upper left position of the text line
 * @param {String} text Text line to be displayed
 * @param {Number} fontSize Font size (defaults to 12)
 */
function addTextToModel(top, left, text, fontSize=12) {
  const boxId=addElementToModel("Text",top,left);
  const element=getElementByBoxId(boxId);
  element.setup.text=text;
  element.setup.fontSize=fontSize;
  updateModelOnCanvas();
}

/**
 * Adds a line diagram to the model
 * @param {Number} top Y coordinate of the upper left corner of the diagram
 * @param {Number} left X coordinate of the upper left corner of the diagram
 * @param {String} source Data to be displayed
 */
function addDiagramToModel(top, left, source) {
  const boxId=addElementToModel("Diagram",top,left);
  const element=getElementByBoxId(boxId);
  element.setup.source=source;
  updateModelOnCanvas();
}

/**
 * Returns an element object by the elements id
 * @param {Number} boxId Id of the element object
 * @returns Element object or null, if there is no element with the given id
 */
function getElementByBoxId(boxId) {
  for (let i=0;i<elements.length;i++) if (elements[i].boxId==boxId) return elements[i];
  return null;
}

/**
 * Adds a connection edge between two stations
 * @param {Number} boxId1 Id of the starting element
 * @param {Number} boxId2 Id of the destination element
 */
function addEdgeToModel(boxId1, boxId2) {
  /* Find elements */
  let element1=getElementByBoxId(boxId1);
  let element2=getElementByBoxId(boxId2);

  if (element1==element2) {
    showMessage(language.dialog.Error,language.tabEdge.errorCircle);
    return;
  }

  /* Find templates */
  let template1=null;
  for (let i=0;i<templates.length;i++) if (templates[i].type==element1.type) {template1=templates[i]; break;}
  let template2=null;
  for (let i=0;i<templates.length;i++) if (templates[i].type==element2.type) {template2=templates[i]; break;}

  /* Count outgoing and incomoing edges */
  let edgesOut=0;
  let edgesIn=0;
  for (let i=0;i<edges.length;i++) {
    const edgeBoxId1=edges[i].boxId1;
    const edgeBoxId2=edges[i].boxId2;
    if (edgeBoxId1==boxId1) edgesOut++;
    if (edgeBoxId2==boxId2) edgesIn++;
  }

  /* Error message, if the edge cannot be added */
  if (edgesOut>=template1.maxEdgesOut) {
    showMessage(language.dialog.Error,language.tabEdge.errorSource);
    return;
  }
  if (edgesIn>=template2.maxEdgesIn) {
    showMessage(language.dialog.Error,language.tabEdge.errorDestination);
    return;
  }

  /* Add edge */
  edges.push({boxId1: boxId1, boxId2: boxId2});
  updateModelOnCanvas();
}

/**
 * Draws an element on the canvas
 * @param {Object} element Station to be drawn
 * @param {Number} index Index of the station in the list of all stations
 * @param {Array} elements List of all stations
 * @see updateModelOnCanvas()
 */
function addElementToCanvas(element, index, elements) {
  const template=getRecordByType(element.type);
  const elementNode=template.addFunc("Box"+element.id,element.nr,element.top,element.left,element.setup,false,elements);
  elementNode.dataset.elementIndex=index;
  if (element.select) {
    elementNode.style.border="3px solid lime";
    if (!("ontouchstart" in document.documentElement)) {
      const trashBox=document.createElement("span");
      trashBox.className="trashBox bi bi-trash";
      trashBox.title=language.editor.deleteStation;
      elementNode.appendChild(trashBox);
      trashBox.onclick=e=>deleteElement(element,index);
    }
  }
}

/**
 * Draws an edge on the canvas
 * @param {Object} edge Edge to be drawn
 * @param {Number} index Index of the edge in the list of all edges
 * @see updateModelOnCanvas()
 */
function addEdgeToCanvas(edge, index) {
  const element1=document.getElementById(edge.boxId1);
  const element2=document.getElementById(edge.boxId2);

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

  /* Find shortest connection */
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

  /* Generate canvas element for the edge */
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

  /* Draw edge */
  const ctx=edgeCanvas.getContext("2d");
  ctx.lineWidth=2;
  ctx.strokeStyle=edge.select?"lime":"black";

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

  /* Draw arrows */
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

/**
 * Redraws the canvas.
 */
function updateModelOnCanvas() {
  const canvas=document.getElementById("canvas_area");

  while (canvas.firstChild) canvas.removeChild(canvas.lastChild);

  if (elements.length==0) {
    let infoText="";
    if (language.canvasInfoLang!=null && language.canvasInfoLang!="") {
      infoText+="<span style='font-size: 90%; border: 1px solid #CCC; color: #111; background-color: #FAFAFA; padding: 5px 10px; border-radius: 3px; cursor: default;'>"+language.canvasInfoLang+"</span><br><br><br>";
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
    localStorage.removeItem("current_model");
    return;
  }

  for (let i=0;i<elements.length;i++) addElementToCanvas(elements[i],i,elements);
  for (let i=0;i<edges.length;i++) addEdgeToCanvas(edges[i],i);

  /* Store current model in local storage */
  const model={elements: elements, edges: edges};
  const json=JSON.stringify(model);
  localStorage.setItem("current_model",json);
}
