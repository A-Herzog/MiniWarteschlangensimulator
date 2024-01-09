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

export {loadExample};

import {discardModel, addElementToModel, addTextToModel, addDiagramToModel, addEdgeToModel, updateModelOnCanvas, getElementByBoxId, elements, edges} from './Editor.js';
import {language} from "./Language.js";
import {showTemplatesSidebar} from './Editor.js';

function loadExample(nr, discardOkChecked=false) {
  if (!discardOkChecked) {
    discardModel(function() {loadExample(nr,true);});
    return;
  }

  elements.length=0;
  edges.length=0;
  updateModelOnCanvas();

  if (nr==0) loadExampleSimple();
  if (nr==1) loadExampleStrategies();
  if (nr==2) loadExampleRetry();
  if (nr==3) loadExamplePolicy();
  if (nr==4) loadPushPull();
  if (nr==5) loadBusStopp();

  showTemplatesSidebar();
}

function loadExampleSimple() {
  addTextToModel(50,100,language.examples.exampleSimple,16);
  const sourceBoxId=addElementToModel("Source",100,100);
  const processBoxId=addElementToModel("Process",100,300);
  const disposeBoxId=addElementToModel("Dispose",100,500);
  addEdgeToModel(sourceBoxId,processBoxId);
  addEdgeToModel(processBoxId,disposeBoxId);
  let y=200;
  addTextToModel(y,100,language.examples.exampleSimpleInfo);
  addTextToModel(y+=25,100,language.examples.exampleSimpleIndicators+":");
  addTextToModel(y+=18,100,language.examples.exampleSimpleEW+": E[W]=320");
  addTextToModel(y+=18,100,language.examples.exampleSimpleEV+": E[V]=400");
  addTextToModel(y+=18,100,language.examples.exampleSimpleENQ+": E[NQ]="+(3.2).toLocaleString());
  addTextToModel(y+=18,100,language.examples.exampleSimpleEN+": E[N]=4");
  addDiagramToModel(y+=18+50,100,"Process-1");
}

function loadExampleStrategies() {
  addTextToModel(50,100,language.examples.exampleControl,16);

  const sourceBoxId=addElementToModel("Source",300,100);
  getElementByBoxId(sourceBoxId).setup.EI=50;

  const duplicateBoxId=addElementToModel("Duplicate",300,300);

  /* Zufällige Auswahl */
  addTextToModel(25,650,language.examples.exampleControlRandom,10);
  const decide1BoxId=addElementToModel("Decide",100,500);
  const process11BoxId=addElementToModel("Process",50,700);
  const process12BoxId=addElementToModel("Process",150,700);
  const disposeBoxId1=addElementToModel("Dispose",100,900);

  /* Kürzere Warteschlange */
  addTextToModel(225,650,language.examples.exampleControlFewestCustomers,10);
  const decide2BoxId=addElementToModel("Decide",300,500);
  getElementByBoxId(decide2BoxId).setup.mode=2;
  const process21BoxId=addElementToModel("Process",250,700);
  const process22BoxId=addElementToModel("Process",350,700);
  const disposeBoxId2=addElementToModel("Dispose",300,900);

  /* 2er Batche */
  addTextToModel(475,700,language.examples.exampleControlBatchService,10);
  const process3BoxId=addElementToModel("Process",500,700);
  getElementByBoxId(process3BoxId).setup.b=2;
  const disposeBoxId3=addElementToModel("Dispose",500,900);

  /* Schnller Bediener */
  addTextToModel(625,700,language.examples.exampleControlFastOperator,10);
  const process4BoxId=addElementToModel("Process",650,700);
  getElementByBoxId(process4BoxId).setup.ES=40;
  const disposeBoxId4=addElementToModel("Dispose",650,900);

  /* 2 Bediener */
  addTextToModel(775,700,language.examples.exampleControlCombinedQueue,10);
  const process5BoxId=addElementToModel("Process",800,700);
  getElementByBoxId(process5BoxId).setup.c=2;
  const disposeBoxId5=addElementToModel("Dispose",800,900);

  addEdgeToModel(sourceBoxId,duplicateBoxId);
  addEdgeToModel(duplicateBoxId,decide1BoxId);
  addEdgeToModel(duplicateBoxId,decide2BoxId);
  addEdgeToModel(duplicateBoxId,process3BoxId);
  addEdgeToModel(duplicateBoxId,process4BoxId);
  addEdgeToModel(duplicateBoxId,process5BoxId);

  addEdgeToModel(decide1BoxId,process11BoxId);
  addEdgeToModel(decide1BoxId,process12BoxId);

  addEdgeToModel(decide2BoxId,process21BoxId);
  addEdgeToModel(decide2BoxId,process22BoxId);

  addEdgeToModel(process11BoxId,disposeBoxId1);
  addEdgeToModel(process12BoxId,disposeBoxId1);
  addEdgeToModel(process21BoxId,disposeBoxId2);
  addEdgeToModel(process22BoxId,disposeBoxId2);
  addEdgeToModel(process3BoxId,disposeBoxId3);
  addEdgeToModel(process4BoxId,disposeBoxId4);
  addEdgeToModel(process5BoxId,disposeBoxId5);
}

function loadExampleRetry() {
  addTextToModel(50,100,language.examples.exampleImpatienceRetry,16);

  const sourceBoxId=addElementToModel("Source",100,100);
  const processBoxId=addElementToModel("Process",100,300);
  const decideBoxId=addElementToModel("Decide",300,300);
  getElementByBoxId(decideBoxId).setup.rates="3;1";
  const delayBoxId=addElementToModel("Delay",300,100);
  getElementByBoxId(delayBoxId).setup.ES="300";
  const disposeBoxId1=addElementToModel("Dispose",100,500);
  const disposeBoxId2=addElementToModel("Dispose",300,500);

  getElementByBoxId(processBoxId).setup.SuccessNextBox=getElementByBoxId(disposeBoxId1).name;

  addEdgeToModel(sourceBoxId,processBoxId);
  addEdgeToModel(processBoxId,disposeBoxId1);
  addEdgeToModel(processBoxId,decideBoxId);
  addEdgeToModel(decideBoxId,delayBoxId);
  addEdgeToModel(decideBoxId,disposeBoxId2);
  addEdgeToModel(delayBoxId,processBoxId);
}

function loadExamplePolicy() {
  addTextToModel(50,100,language.examples.examplePolicy,16);

  const sourceBoxId=addElementToModel("Source",220,100);
  const duplicateBoxId=addElementToModel("Duplicate",220,300);
  const processBoxId1=addElementToModel("Process",120,500);
  getElementByBoxId(processBoxId1).setup.policy=1;
  const processBoxId2=addElementToModel("Process",220,500);
  getElementByBoxId(processBoxId2).setup.policy=0;
  const processBoxId3=addElementToModel("Process",320,500);
  getElementByBoxId(processBoxId3).setup.policy=-1;
  const disposeBoxId1=addElementToModel("Dispose",120,700);
  const disposeBoxId2=addElementToModel("Dispose",220,700);
  const disposeBoxId3=addElementToModel("Dispose",320,700);

  addEdgeToModel(sourceBoxId,duplicateBoxId);
  addEdgeToModel(duplicateBoxId,processBoxId1);
  addEdgeToModel(duplicateBoxId,processBoxId2);
  addEdgeToModel(duplicateBoxId,processBoxId3);
  addEdgeToModel(processBoxId1,disposeBoxId1);
  addEdgeToModel(processBoxId2,disposeBoxId2);
  addEdgeToModel(processBoxId3,disposeBoxId3);

  addTextToModel(100,500,language.examples.examplePolicyFIFO,10);
  addTextToModel(200,500,language.examples.examplePolicyRandom,10);
  addTextToModel(300,500,language.examples.examplePolicyLIFO,10);

  addTextToModel(400,100,language.examples.examplePolicyInfo1,12);
  addTextToModel(420,100,language.examples.examplePolicyInfo2,12);
}

function loadPushPull() {
  addTextToModel(50,100,language.examples.examplePushPull,16);

  const sourceBoxId=addElementToModel("Source",220,100);
  getElementByBoxId(sourceBoxId).setup.EI=110;
  const duplicateBoxId=addElementToModel("Duplicate",220,250);

  const processBoxId1=addElementToModel("Process",120,450);
  const processBoxId2=addElementToModel("Process",120,600);
  const disposeBoxId1=addElementToModel("Dispose",120,1050);

  const barrierBoxId=addElementToModel("Barrier",320,450);
  const processBoxId3=addElementToModel("Process",320,600);
  const processBoxId4=addElementToModel("Process",320,750);
  const signalBoxId=addElementToModel("Signal",320,900);
  const disposeBoxId2=addElementToModel("Dispose",320,1050);
  const setup=getElementByBoxId(barrierBoxId).setup;
  setup.release=3;
  setup.signal='1';

  addEdgeToModel(sourceBoxId,duplicateBoxId);

  addEdgeToModel(duplicateBoxId,processBoxId1);
  addEdgeToModel(processBoxId1,processBoxId2);
  addEdgeToModel(processBoxId2,disposeBoxId1);

  addEdgeToModel(duplicateBoxId,barrierBoxId);
  addEdgeToModel(barrierBoxId,processBoxId3);
  addEdgeToModel(processBoxId3,processBoxId4);
  addEdgeToModel(processBoxId4,signalBoxId);
  addEdgeToModel(signalBoxId,disposeBoxId2);

  addTextToModel(450,100,language.examples.examplePushPullInfo1,12);
  addTextToModel(470,100,language.examples.examplePushPullInfo2,12);

  addDiagramToModel(540,100,"Barrier-1");
}

function loadBusStopp() {
  addTextToModel(50,100,language.examples.exampleBusStopp,16);

  let setup;

  addTextToModel(105,100,language.examples.exampleBusStoppInfoPassengers,10);
  const sourceBoxId1=addElementToModel("Source",130,100);
  setup=getElementByBoxId(sourceBoxId1).setup;
  setup.EI=3600;
  setup.CVI=0;

  addTextToModel(155,300,language.examples.exampleBusStoppInfoBusStopp,10);
  const barrierBoxId=addElementToModel("Barrier",180,300);
  setup=getElementByBoxId(barrierBoxId).setup;
  setup.signal='1';
  setup.storeSignals=false;

  const disposeBoxId1=addElementToModel("Dispose",130,500);

  addTextToModel(305,100,language.examples.exampleBusStoppInfoBusses,10);
  const sourceBoxId2=addElementToModel("Source",330,100);
  setup=getElementByBoxId(sourceBoxId2).setup;
  setup.EI=300;

  const signalBoxId=addElementToModel("Signal",270,300);

  const disposeBoxId2=addElementToModel("Dispose",330,500);

  addEdgeToModel(sourceBoxId1,barrierBoxId);
  addEdgeToModel(barrierBoxId,disposeBoxId1);

  addEdgeToModel(sourceBoxId2,signalBoxId);
  addEdgeToModel(signalBoxId,disposeBoxId2);

  addTextToModel(450,100,language.examples.exampleBusStoppInfo1,12);
  addTextToModel(470,100,language.examples.exampleBusStoppInfo2,12);
  addTextToModel(490,100,language.examples.exampleBusStoppInfo3,12);
  addTextToModel(510,100,language.examples.exampleBusStoppInfo4,12);
}