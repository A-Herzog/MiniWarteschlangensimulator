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

class SimModelBuilder {
  constructor(editElements, editEdges) {
    this.editElements=editElements;
    this.editEdges=editEdges;
  }

  getElementByBoxId(boxId) {
    for (let editElement of this.editElements) if (editElement.boxId==boxId) return editElement;
    return null;
  }

  getSimStationFromBoxId(boxId) {
    const editElement=this.getElementByBoxId(boxId);
    if (editElement==null) return null;
    const id=editElement.id;
    for (let station of this.stationsList) if (station.id==id) return station;
    return null;
  }

  build(globalStatistics) {
    this.stationsList=[];
    let hasSource=false;

    /* Stationen anlegen */
    for (let editElement of this.editElements) {
      let simElement=null;
      const type=editElement.type;
      if (type=='Source') {simElement=new SimSource(editElement); hasSource=true;}
      if (simElement==null && type=='Delay') simElement=new SimDelay(editElement);
      if (simElement==null && type=='Process') simElement=new SimProcess(editElement);
      if (simElement==null && type=='Decide') simElement=new SimDecide(editElement);
      if (simElement==null && type=='Duplicate') simElement=new SimDuplicate(editElement);
      if (simElement==null && type=='Counter') simElement=new SimCounter(editElement);
      if (simElement==null && type=='Dispose') simElement=new SimDispose(editElement);
      if (simElement==null && type=='Batch') simElement=new SimBatch(editElement);
      if (simElement==null && type=='Separate') simElement=new SimSeparate(editElement);
      if (simElement==null && type=='Signal') simElement=new SimSignal(editElement);
      if (simElement==null && type=='Barrier') simElement=new SimBarrier(editElement);

      if (type=='Text') continue;
      if (simElement==null) return language.builder.unknownStationType+": "+editElement.type;
      this.stationsList.push(simElement);
    }
    if (!hasSource) {
      return language.builder.noSource;
    }

    /* Stationen verknüpfen */
    const destinationStations=new Set();
    for (let editEdge of this.editEdges) {
      const station1=this.getSimStationFromBoxId(editEdge.boxId1);
      const station2=this.getSimStationFromBoxId(editEdge.boxId2);
      if (station1!=null && station2!=null) {
        station1.addEdgeOut(station2);
        destinationStations.add(station2);
      }
    }

    /* Unverbundene Stationen entfernen */
    const removeStations=new Set();
    for (let station of this.stationsList) if (!destinationStations.has(station) && station.editElement.type!="Source") removeStations.add(station);
    for (let removeStation of removeStations) {
      const index=this.stationsList.indexOf(removeStation);
      this.stationsList.splice(index,1);
    }

    /* Daten in Stationen laden */
    for (let station of this.stationsList) {
      const stationError=station.build(globalStatistics);
      if (stationError!=null) return language.builder.stationError+" <b style='color: "+templates.filter(template=>template.type==station.editElement.type)[0].color+"'>"+station.name+"</b>:<br>"+stationError;
    }

    return null;
  }

  get stations() {
    return this.stationsList;
  }
}

function distributionBuilder(E, CV) {
  if (CV==0) return distcore.get("const("+E+")");
  if (CV==1.0) return distcore.get("exp("+E+")");
  return distcore.get("lognormal("+E+";"+(E*CV)+")");
}