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

export {fixModel};

import {addElementToModel, addEdgeToModel} from "./Editor.js";


/**
 * Trys to add missing stations and edges to the model.
 * @param {Array} elements Stations
 * @param {Array} edges Edges
 */
function fixModel(elements, edges) {
  /* Find stations */
  let source=null;
  let process=null;
  let dispose=null;
  for (let element of elements) {
    if (element.type=="Source") {
        if (source!=null) return;
        source=element;
        continue;
    }
    if (element.type=="Delay" || element.type=="Process") {
        if (process!=null) return;
        process=element;
        continue;
    }
    if (element.type=="Dispose") {
        if (dispose!=null) return;
        dispose=element;
        continue;
    }
    return; /* Station type unsupported for auto fix */
  }

  /* Add process station if needed */
  if (source!=null && process==null && dispose==null) {
    addElementToModel("Process",source.top,source.left+200);
    process=elements[elements.length-1];
  }


  /* Add dispose station if needed */
  if (dispose==null && (source!=null || process!=null)) {
    if (process!=null) addElementToModel("Dispose",process.top,process.left+200); else addElementToModel("Dispose",source.top,source.left+200);
    dispose=elements[elements.length-1];
  }

  /* Process existing edges */
  let sourceOut=false;
  let processIn=false;
  let processOut=false;
  let disposeIn=false;
  for (let edge of edges) {
    const idOut=edge.boxId1;
    const idIn=edge.boxId2;
    if (source!=null && source.boxId==idOut) sourceOut=true;
    if (process!=null) {
      if (process.boxId==idIn) processIn=true;
      if (process.boxId==idOut) processOut=true;
    }
    if (dispose!=null && dispose.boxId==idIn) disposeIn=true;
  }

  /* Add edges */
  if (process!=null) {
    if (source!=null && !sourceOut && !processIn) {
      addEdgeToModel(source.boxId,process.boxId);
    }
    if (dispose!=null && !processOut && !disposeIn) {
      addEdgeToModel(process.boxId,dispose.boxId);
    }
  } else {
    if (source!=null && dispose!=null && !sourceOut && !disposeIn) {
      addEdgeToModel(source.boxId,dispose.boxId);
    }
  }
}
