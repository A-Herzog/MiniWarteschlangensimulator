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

export {processSeries};

import {showMessage, showTemplatesSidebar, elements, edges} from './Editor.js';
import {WebSimulator} from './Simulator.js';
import {language} from './Language.js';
import {getPositiveFloat, getNotNegativeFloat, getPositiveInt} from './Tools.js';
import {SimulatorWorker} from './Simulator.js';


let seriesParameters;
let parameterNr;

let parameterValue1;
let parameterValue2;
let parameterValueStep;

let parameterSeriesSimValues;
let parameterSeriesSimSetups;
let parameterSeriesSimWorker;



/* === Helper functions === */

/**
 * Generates a modal dialog object
 * @param {String} title Dialog title
 * @param {String} msg Message to be shown in the dialog
 * @param {Function} onOk Callback for the "Ok" button
 * @param {Boolean} addCancel Show a cancel button?
 * @param {Boolean} fullscreen Display dialog as full screen?
 * @returns Dialog object
 */
function addModalDialog(title, msg, onOk=null, addCancel=false, fullscreen=false) {
  const dialogElement=document.createElement('div');
  dialogElement.className="modal fade";
  dialogElement.tabIndex=-1;
  const dialogElementInner1=document.createElement('div');
  dialogElementInner1.className="modal-dialog "+(fullscreen?'modal-fullscreen':'modal-dialog-centered');
  dialogElement.appendChild(dialogElementInner1);
  const dialogElementInner2=document.createElement('div');
  dialogElementInner2.className="modal-content";
  dialogElementInner1.appendChild(dialogElementInner2);

  const dialogHead=document.createElement('div');
  dialogHead.className="modal-header";
  dialogHead.innerHTML=`<h5 class="modal-title">`+title+`</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`;
  dialogElementInner2.appendChild(dialogHead);

  const dialogBody=document.createElement('div');
  dialogBody.className="modal-body";
  if (typeof(msg)=='string') {
    dialogBody.innerHTML=msg;
  } else {
    dialogBody.appendChild(msg);
  }
  dialogElementInner2.appendChild(dialogBody);

  const dialogFooter=document.createElement('div');
  dialogFooter.className="modal-footer";
  dialogElementInner2.appendChild(dialogFooter);

  let button;

  if (onOk!=null) {
    dialogFooter.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="btn btn-primary bi-check";
    button.dataset.bsDismiss="modal";
    button.onclick=onOk;
    button.innerHTML=" "+language.dialog.Ok;
  }
  if (addCancel) {
    dialogFooter.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="btn btn-danger bi-x-circle";
    button.dataset.bsDismiss="modal";
    button.innerHTML=" "+language.dialog.Cancel;
  }

  document.getElementsByClassName('wrapper')[0].appendChild(dialogElement);

  const dialog=new bootstrap.Modal(dialogElement,{});

  return {html: dialogElement, object: dialog};
}


/* === Step 1: Parameter selection === */

/**
 * Tests if a station has two outgoing edges
 * @param {Number} boxId Id of the station
 * @returns Returns true, if the station has two outgoing edges
 */
function hasTwoOutgoingEdges(boxId) {
  let count=0;
  for (let i=0;i<edges.length;i++) if (edges[i].boxId1==boxId) {
    count++;
    if (count==2) return true;
  }
  return false;
}

/**
 * Generates a list of all possible parameters to be changed in the parameter series.
 * @returns List of possible parameters for the parameter series
 */
function getParameters() {
  const list=[];

  for (let i=0;i<elements.length;i++) {
    const element=elements[i];
    for (let id2 in element.setup) {
      let name2=null;
      let isInteger=false;
      let allow0=false;
      if (id2=='EI') name2='E[I]';
      if (id2=='CVI') {name2='CV[I]'; allow0=true;}
      if (id2=='ES') name2='E[S]';
      if (id2=='CVS') {name2='CV[S]'; allow0=true;}
      if (id2=='EWT' && hasTwoOutgoingEdges(element.boxId)) name2='E[WT]';
      if (id2=='CVWT' && hasTwoOutgoingEdges(element.boxId)) name2='CV[WT]';
      if (id2=='b') {name2='b'; isInteger=true;}
      if (id2=='c') {name2='c'; isInteger=true;}
      if (name2==null) continue;
      list.push({
        id1: element.id,
        name1: element.name,
        id2: id2,
        name2: name2,
        initialValue: element.setup[id2],
        isInteger: isInteger,
        allow0: allow0,
        fullName: element.name+" "+name2
      });
    }
  }

  return list;
}

/**
 * Start parameter series system.
 * Shows a dialog for selecting the parameter to be changed in the parameter series.
 */
function processSeries() {
  showTemplatesSidebar();

  /* Check model */
  const simulator=new WebSimulator(false);
  const buildResult=simulator.build(elements,edges);
  if (buildResult!=null) {
    showMessage(language.builder.invalidModelTitle,language.builder.invalidModelText+"<br>"+buildResult);
    return;
  }

  /* Identify possible parameters */
  seriesParameters=getParameters();
  if (seriesParameters.length==0) {
    showMessage(language.tabFile.extendedParameterSeries,language.series.noParameter);
    return;
  }

  /* Show selection dialog */
  const content=document.createElement("span");
  let div;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.innerHTML=language.series.parameter;

  content.appendChild(div=document.createElement("div"));
  div.className="input-group";

  const select=document.createElement("select");
  select.className='form-select';
  select.onchange=seriesParameterSelectChange;
  select.id="seriesParameterSelect";
  let options="";
  for (let i=0;i<seriesParameters.length;i++) options+="<option value='"+i+"'"+((i==0)?' selected':'')+'>'+seriesParameters[i].name1+' - '+seriesParameters[i].name2+'</option>';
  select.innerHTML=options;
  div.appendChild(select);

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.style.marginTop="10px";
  div.id="seriesParameterSelectInfo";

  parameterValue1=null;
  parameterValue2=null;
  parameterValueStep=null;

  const dialog=addModalDialog(language.tabFile.extendedParameterSeries,content,seriesParameterRangeDialog,true);
  seriesParameterSelectChange();
  dialog.html.addEventListener('hidden.bs.modal',()=>{document.getElementsByClassName('wrapper')[0].removeChild(dialog.html);});
  dialog.object.show();
}

function seriesParameterSelectChange() {
  parameterNr=document.getElementById('seriesParameterSelect').value;
  let isInteger='';
  if (seriesParameters[parameterNr].isInteger) isInteger=' ('+language.series.parameterIsInteger+')';
  document.getElementById('seriesParameterSelectInfo').innerHTML=language.series.parameterCurrentValue+': <b>'+seriesParameters[parameterNr].initialValue+'</b>'+isInteger;
}


/* === Step 2: Range selection === */

/**
 * Shows a dialog for defining the range in which the parameter of the parameter series is to be changed.
 */
function seriesParameterRangeDialog() {
  const param=seriesParameters[parameterNr];

  const content=document.createElement("span");
  let div, input, text;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.style.marginBottom="15px";
  text="";
  text+=language.series.rangeStation+": <b>"+param.name1+"</b><br>";
  text+=language.series.rangeProperty+": <b>"+param.name2+"</b><br>";
  text+=language.series.rangePropertyValue+": <b>"+param.initialValue+"</b>"+(param.isInteger?(' ('+language.series.parameterIsInteger+')'):'');
  div.innerHTML=text;

  if (parameterValue1==null) {
    parameterValue1=getPositiveFloat(param.initialValue)/2;
    parameterValue2=getPositiveFloat(param.initialValue)*2;
    if (param.isInteger) {
      parameterValue1=Math.max(1,Math.round(parameterValue1));
      parameterValue2=Math.max(1,Math.round(parameterValue2));
      if (parameterValue1==parameterValue2) parameterValue2+=1;
    }
    parameterValueStep=(parameterValue2-parameterValue1)/10;
    if (param.isInteger) parameterValueStep=Math.max(1,Math.round(parameterValueStep));

    parameterValue1=parameterValue1.toLocaleString();
    parameterValue2=parameterValue2.toLocaleString();
    parameterValueStep=parameterValueStep.toLocaleString();
  }

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.innerHTML=language.series.rangeStart;
  content.appendChild(div=document.createElement("div"));
  div.className='input-group';
  div.appendChild(input=document.createElement("input"));
  input.type="text";
  input.className="form-control";
  input.onclick=seriesParameterRangeChange;
  input.onkeyup=seriesParameterRangeChange;
  input.id='seriesParameterRange1';
  input.value=parameterValue1;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.innerHTML=language.series.rangeEnd;
  content.appendChild(div=document.createElement("div"));
  div.className='input-group';
  div.appendChild(input=document.createElement("input"));
  input.type="text";
  input.className="form-control";
  input.onclick=seriesParameterRangeChange;
  input.onkeyup=seriesParameterRangeChange;
  input.id='seriesParameterRange2';
  input.value=parameterValue2;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.innerHTML=language.series.rangeStep;
  content.appendChild(div=document.createElement("div"));
  div.className='input-group';
  div.appendChild(input=document.createElement("input"));
  input.type="text";
  input.className="form-control";
  input.onclick=seriesParameterRangeChange;
  input.onkeyup=seriesParameterRangeChange;
  input.id='seriesParameterRangeStep';
  input.value=parameterValueStep;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.style.color="red";
  div.style.marginTop="15px";
  div.style.marginBottom="10px";
  div.id="seriesParameterRangeInfo";

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.innerHTML=language.series.arrivalCountLabel;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='90%';
  div.className='input-group';
  div.innerHTML=language.series.arrivalCountLabel;
  text="";
  text+="<select id='seriesParameterArrivalCount' class='form-select'>";
  text+="<option value='1000000'>"+language.series.arrivalCount1M+"</option>";
  text+="<option value='5000000'>"+language.series.arrivalCount5M+"</option>";
  text+="<option value='10000000'>"+language.series.arrivalCount10M+"</option>";
  text+="<option value='25000000'>"+language.series.arrivalCount25M+"</option>";
  text+="</select>";
  div.innerHTML=text;

  content.appendChild(div=document.createElement("div"));
  div.style.fontSize='80%';
  div.style.marginTop="10px";
  div.innerHTML=language.series.arrivalCountInfo;

  const dialog=addModalDialog(language.tabFile.extendedParameterSeries,content,seriesParameterStart,true);
  seriesParameterRangeChange();
  dialog.html.addEventListener('hidden.bs.modal',()=>{document.getElementsByClassName('wrapper')[0].removeChild(dialog.html);});
  dialog.object.show();
}

/**
 * Tests if the specified range is valid.
 * @returns Returns true if the specified range is valid.
 */
function testRange() {
  const param=seriesParameters[parameterNr];

  const value1Str=document.getElementById('seriesParameterRange1').value;
  const value2Str=document.getElementById('seriesParameterRange2').value;
  const stepStr=document.getElementById('seriesParameterRangeStep').value;
  const info=document.getElementById('seriesParameterRangeInfo');
  info.innerHTML='';
  info.style.display="none";

  parameterValue1=value1Str;
  parameterValue2=value2Str;
  parameterValueStep=stepStr;

  if (param.isInteger) {
    const value1=getPositiveInt(value1Str);
    if (value1==null) {info.innerHTML=language.series.rangeStartError+" "+language.series.rangeIntError; info.style.display=""; return false;}
    const value2=getPositiveInt(value2Str);
    if (value2==null) {info.innerHTML=language.series.rangeEndError+" "+language.series.rangeIntError; info.style.display=""; return false;}
    const step=getPositiveInt(stepStr);
    if (step==null) {info.innerHTML=language.series.rangeStepError+" "+language.series.rangeIntError; info.style.display=""; return false;}
    if (value2<=value1) {info.innerHTML=language.series.rangeStartEndError; info.style.display=""; return false;}
    parameterValue1=value1;
    parameterValue2=value2;
    parameterValueStep=step;
  } else {
    let value1, value2;
    if (param.allow0) {
      value1=getNotNegativeFloat(value1Str);
      if (value1==null) {info.innerHTML=language.series.rangeStartError+" "+language.series.rangeFloat0Error; info.style.display=""; return false;}
      value2=getNotNegativeFloat(value2Str);
      if (value2==null) {info.innerHTML=language.series.rangeEndError+" "+language.series.rangeFloat0Error; info.style.display=""; return false;}
    } else {
      value1=getPositiveFloat(value1Str);
      if (value1==null) {info.innerHTML=language.series.rangeStartError+" "+language.series.rangeFloatError; info.style.display=""; return false;}
      value2=getPositiveFloat(value2Str);
      if (value2==null) {info.innerHTML=language.series.rangeEndError+" "+language.series.rangeFloatError; info.style.display=""; return false;}
    }
    const step=getPositiveFloat(stepStr);
    if (step==null) {info.innerHTML=language.series.rangeStepError+" "+language.series.rangeFloatError; info.style.display=""; return false;}
    if (value2<=value1) {info.innerHTML=language.series.rangeStartEndError; info.style.display=""; return false;}
    parameterValue1=value1;
    parameterValue2=value2;
    parameterValueStep=step;
  }

  return true;
}

/**
 * Callback for range changes.
 * @see testRange()
 * @see seriesParameterRangeDialog()
 */
function seriesParameterRangeChange() {
  testRange();
}


/* === Step 3: Simulation === */

/**
 * Runs the parameter series simulations.
 */
function seriesParameterStart() {
  /* Input check */
  if (!testRange()) {
    seriesParameterRangeDialog();
    return;
  }

  /* Generate models to be simulated */
  const param=seriesParameters[parameterNr];
  parameterSeriesSimValues=[];
  parameterSeriesSimSetups=[];
  const arrivalCount=parseInt(document.getElementById('seriesParameterArrivalCount').value);
  const baseModel=JSON.stringify({elements: elements, edges: edges, count: arrivalCount});
  for (let value=parameterValue1;value<=parameterValue2;value+=parameterValueStep) {
    const useValue=Math.round(value*1_000_000_000)/1_000_000_000;
    const model=JSON.parse(baseModel);
    for (let i=0;i<model.elements.length;i++) if (model.elements[i].id==param.id1) model.elements[i].setup[param.id2]=useValue;
    parameterSeriesSimValues.push(useValue);
    parameterSeriesSimSetups.push(model);
  }

  /* Show progress dialog */
  const body=document.getElementById('modalAreaBody');
  const footer=document.getElementById('modalAreaFooter');

  document.getElementById('modalAreaTitle').innerHTML=language.tabFile.extendedParameterSeries;
  body.innerHTML='<div style="cursor: default;"><b>'+language.tabAnimation.simulationProgress1+'</b><br>'+language.tabAnimation.simulationProgress3a+parameterSeriesSimSetups.length+language.tabAnimation.simulationProgress3b+Math.round(arrivalCount/1_000_000)+language.tabAnimation.simulationProgress3c+'</div><div class="progress" style=" margin-top: 15px;"><div id="simProgress" style="width: 0%;" class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>';
  footer.innerHTML='<button type="button" class="btn btn-danger bi-x-circle" onclick="parameterSeriesSimWorker.cancel()"> '+language.tabAnimation.simulationCancel+'</button>';

  const progress=document.getElementById('simProgress');

  const workerDialog=new bootstrap.Modal(document.getElementById('modalArea'),{});
  workerDialog.show();

  /* Run simulations */
  parameterSeriesSimWorker=new SimulatorWorker(parameterSeriesSimSetups,body,progress,()=>{workerDialog.hide(); seriesParameterResults();},()=>workerDialog.hide());
  parameterSeriesSimWorker.start();
}


/* === Step 4: Display results === */

/**
 * Colors for the results diagram series
 * @see seriesParameterResults()
 */
const seriesParameterColors=["blue", "red", "green", "orange", "black", "gray", "magenta"]

/**
 * Generates a results table for export.
 * @param {String} inputName  Headingfor the first column
 * @param {Array} inputValues Values in the first column
 * @param {Array} results Values in the other columns
 * @returns Table for export
 */
function buildTable(inputName, inputValues, results) {
  let table="";

  /* Heading */
  table+=inputName;
  for (let stationName in results[0]) for (let valueName in results[0][stationName]) {
    table+="\t"+stationName+" - "+((valueName=='n')?valueName:("E["+valueName+"]"));
  }
  table+="\n";

  /* Data lines */
  for (let i=0;i<results.length;i++) {
    table+=inputValues[i].toLocaleString();
    for (let stationName in results[i]) for (let valueName in results[i][stationName]) {
      const value=results[i][stationName][valueName];
      table+="\t"+value.toLocaleString();
    }
    table+="\n";
  }

  return table;
}

/**
 * Downloads some string as a file.
 * @param {String} content Content for the file download
 * @param {String} filename Destination file name
 */
function download(content, filename) {
  const a=document.createElement('a');
  const blob=new Blob([content], {type: 'text/plain'});
  a.href = window.URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}

/** Is Chart.js already loaded? */
let chartJsLoaded=false;

/**
 * Loaded Chart.js (if not already loaded) and then executes a lambda expression.
 * @param {Function} then Will be executed when Chart.js is available.
 */
function loadChartJs(then) {
  if (chartJsLoaded) {
    then();
    return;
  }

  chartJsLoaded=true;

  const script=document.createElement("script");
  script.src="./libs/chart.umd.js";
  script.async = false;
  script.onload=then;
  document.head.appendChild(script);
}

/**
 * Shows the parameter series simulation results.
 */
function seriesParameterResults() {
  const results=parameterSeriesSimWorker.raw;
  const param=seriesParameters[parameterNr];
  const table=buildTable(param.name1+" - "+param.name2,parameterSeriesSimValues,results);

  /* Determine data series */
  const datasetNames=[];
  for (let stationName in results[0]) for (let recordName in results[0][stationName]) {
    if (recordName=='W' || recordName=='NQ' || recordName=='N') datasetNames.push({station: stationName, record: recordName});
  }

  /* Generate dialog */
  const dialog=addModalDialog(language.tabFile.extendedParameterSeries,'<canvas id="parameterSeries_plot" style="width: 100%;"></canvas><small>'+language.tabFile.extendedParameterSeriesPlotInfo+'</small>',()=>{},false,true);
  dialog.html.addEventListener('hidden.bs.modal',()=>document.getElementsByClassName('wrapper')[0].removeChild(dialog.html));

  /* Copy and save buttons in the footer */
  const footer=dialog.html.getElementsByClassName('modal-footer')[0];
  let div, button, ul, li, a;

  /* Copy options */
  footer.appendChild(div=document.createElement('div'));
  div.className='dropdown';
  div.style.display='inline-block';

  div.appendChild(button=document.createElement('button'));
  button.type="button";
  button.className="btn btn-primary bi-clipboard dropdown-toggle";
  button.dataset.bsToggle='dropdown';
  button.ariaExpanded='false';
  button.innerHTML="&nbsp;"+language.series.copyDiagram;

  div.appendChild(ul=document.createElement('ul'));
  ul.className='dropdown-menu';

  ul.appendChild(li=document.createElement('li'));
  li.appendChild(a=document.createElement('a'));
  a.className='dropdown-item';
  a.style.cursor='pointer';
  a.innerHTML=language.series.copyDiagramTable;
  a.onclick=()=>navigator.clipboard.writeText(table);

  ul.appendChild(li=document.createElement('li'));
  li.appendChild(a=document.createElement('a'));
  a.className='dropdown-item';
  a.style.cursor='pointer';
  a.innerHTML=language.series.copyDiagramImage;
  a.onclick=()=>{
    if (typeof(ClipboardItem)!="undefined") {
      document.getElementById("parameterSeries_plot").toBlob(blob=>navigator.clipboard.write([new ClipboardItem({"image/png": blob})]));
    } else {
      alert(language.series.copyDiagramImageError);
    }
  };

  /* Save options */
  footer.appendChild(div=document.createElement('div'));
  div.className='dropdown';
  div.style.display='inline-block';

  div.appendChild(button=document.createElement('button'));
  button.type="button";
  button.className="btn btn-primary bi-download dropdown-toggle";
  button.dataset.bsToggle='dropdown';
  button.ariaExpanded='false';
  button.innerHTML="&nbsp;"+language.series.saveDiagram;

  div.appendChild(ul=document.createElement('ul'));
  ul.className='dropdown-menu';

  ul.appendChild(li=document.createElement('li'));
  li.appendChild(a=document.createElement('a'));
  a.className='dropdown-item';
  a.style.cursor='pointer';
  a.innerHTML=language.series.saveDiagramTable;
  a.onclick=()=>download(table,language.tabAnimation.resultsFile);

  ul.appendChild(li=document.createElement('li'));
  li.appendChild(a=document.createElement('a'));
  a.className='dropdown-item';
  a.style.cursor='pointer';
  a.innerHTML=language.series.saveDiagramImage;
  a.onclick=()=>{
    const element=document.createElement("a");
    element.href=document.getElementById("parameterSeries_plot").toDataURL("image/png");
    element.download="diagram.png";
    element.click();
  };

  dialog.object.show();

  /* Show diagram */
  const datasets=[];
  for (let i=0;i<datasetNames.length;i++) {
    const datasetName=datasetNames[i];
    const name=datasetName.station+" E["+datasetName.record+"]";
    const data=[];
    for (let j=0;j<results.length;j++) data.push(results[j][datasetName.station][datasetName.record]);

    const set={};
    set.label=name;
    set.fill=false;
    set.borderColor=seriesParameterColors[i%seriesParameterColors.length];
    set.data=data;
    if (datasetName.record=='NQ' || datasetName.record=='N') set.yAxisID='y2';
    datasets.push(set);
  }

  const options={
    scales: {
      x: {
        title: {display: true, text: seriesParameters[parameterNr].fullName}
      },
      y: {
        title: {display: true, text: language.tabAnimation.timePlain},
        min: 0
      },
      y2: {
        position: 'left',
        title: {display: true, text: language.tabAnimation.count},
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  loadChartJs(()=>{
    new Chart(parameterSeries_plot, {
      type: "line",
      data: {labels: parameterSeriesSimValues, datasets: datasets},
      options: options
    });
  });
}
