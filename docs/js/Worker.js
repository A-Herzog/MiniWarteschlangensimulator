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

'use strict';

const useLanguage='en';
/* Begin of language independent part */

importScripts("./Language.js");
importScripts("./Tools.js");
importScripts("./DistCore.js");
importScripts("./StatCore.js");
importScripts("./SimCore.js");
importScripts("./Templates.js");
importScripts("./Simulator.js");
importScripts("./SimulatorBuilder.js");
importScripts("./SimulatorStations.js");
importScripts("./Events.js");

onmessage = function(e) {
  const request=JSON.parse(e.data.model);

  const simulator=new WebSimulator(false);
  simulator.build(request.elements,request.edges);

  const targetArrivalCount=request.count;
  while (true) {
    simulator.executeNext();
    const arrivalCount=simulator.arrivalCount;
    if (arrivalCount%20000==0) postMessage(JSON.stringify({progress: arrivalCount/targetArrivalCount}));
    if (arrivalCount>=targetArrivalCount) break;
  }
  simulator.done();

  postMessage(JSON.stringify({resultShort: simulator.infoShort, resultFull: simulator.infoFull}));
}
