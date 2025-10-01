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

export {SimModelBuilder, distributionBuilder};

import {templates, getRecordByType} from "./Templates.js";
import {SimSource, SimDelay, SimProcess, SimDecide, SimDuplicate, SimCounter, SimThroughput, SimDispose, SimBatch, SimSeparate, SimSignal, SimBarrier, SimSignalSource} from './SimulatorStations.js';
import {distcore} from "./DistCore.js";
import {language} from "./Language.js";


/**
 * Builds a (read only, fast) simulation model from a (weakly connected, editable) editor model.
 */
class SimModelBuilder {
  /**
   * Constructor
   * @param {Array} editElements List of the edit model elements
   * @param {Array} editEdges List of the edit model edges
   * @param {Object} math Math.js object to be used
   */
  constructor(editElements, editEdges, math) {
    this.editElements=editElements;
    this.editEdges=editEdges;
    this.math=math;
  }

  /**
   * Returns the editor model station object for a given id.
   * @param {Number} boxId Id of the station
   * @returns Returns the station with the given id (or null if there is no station with this id)
   */
  #getElementByBoxId(boxId) {
    for (let editElement of this.editElements) if (editElement.boxId==boxId) return editElement;
    return null;
  }

  /**
   * Returns the simulation model station object for a given id.
   * @param {Number} boxId Id of the station
   * @returns Returns the station with the given id (or null if there is no station with this id)
   */
  #getSimStationFromBoxId(boxId) {
    const editElement=this.#getElementByBoxId(boxId);
    if (editElement==null) return null;
    const id=editElement.id;
    for (let station of this.stationsList) if (station.id==id) return station;
    return null;
  }

  /**
   * Builds the simulation model.
   * @param {Object} globalStatistics Global statistics object to be connected to the simulation model
   * @returns Error message or null in case of success
   */
  build(globalStatistics) {
    this.stationsList=[];
    this.animationStationsList=[];
    let hasSource=false;

    /* Generate stations */
    for (let editElement of this.editElements) {

      if (editElement.visualOnly) {
        const template=getRecordByType(editElement.type);
        if (template!=null && typeof(template.animateFunc)=='function') this.animationStationsList.push({element: editElement, template: template, data: {}});
        continue;
      }

      let simElement=null;
      const type=editElement.type;
      if (type=='Source') {simElement=new SimSource(editElement); hasSource=true;}
      if (simElement==null && type=='Delay') simElement=new SimDelay(editElement);
      if (simElement==null && type=='Process') simElement=new SimProcess(editElement);
      if (simElement==null && type=='Decide') simElement=new SimDecide(editElement);
      if (simElement==null && type=='Duplicate') simElement=new SimDuplicate(editElement);
      if (simElement==null && type=='Counter') simElement=new SimCounter(editElement);
      if (simElement==null && type=='Throughput') simElement=new SimThroughput(editElement);
      if (simElement==null && type=='Dispose') simElement=new SimDispose(editElement);
      if (simElement==null && type=='Batch') simElement=new SimBatch(editElement);
      if (simElement==null && type=='Separate') simElement=new SimSeparate(editElement);
      if (simElement==null && type=='Signal') simElement=new SimSignal(editElement);
      if (simElement==null && type=='Barrier') simElement=new SimBarrier(editElement);
      if (simElement==null && type=='SignalSource') simElement=new SimSignalSource(editElement);

      if (simElement==null) return language.builder.unknownStationType+": "+editElement.type;
      this.stationsList.push(simElement);
    }

    if (!hasSource) {
      return language.builder.noSource;
    }

    /* Connect stations */
    const destinationStations=new Set();
    for (let editEdge of this.editEdges) {
      const station1=this.#getSimStationFromBoxId(editEdge.boxId1);
      const station2=this.#getSimStationFromBoxId(editEdge.boxId2);
      if (station1!=null && station2!=null) {
        station1.addEdgeOut(station2);
        destinationStations.add(station2);
      }
    }

    /* Remove unconnected stations */
    const removeStations=new Set();
    for (let station of this.stationsList) if (!destinationStations.has(station) && station.editElement.type!="Source" && station.editElement.type!="SignalSource") removeStations.add(station);
    for (let removeStation of removeStations) {
      const index=this.stationsList.indexOf(removeStation);
      this.stationsList.splice(index,1);
    }

    /* Load data into stations */
    for (let station of this.stationsList) {
      const stationError=station.build(globalStatistics,this.editElements,this);
      if (stationError!=null) return language.builder.stationError+" <b style='color: "+templates.filter(template=>template.type==station.editElement.type)[0].color+"'>"+station.name+"</b>:<br>"+stationError;
    }

    return null;
  }

  /**
   * Returns the list of the simulation station boxes (not visual only stations).
   */
  get stations() {
    return this.stationsList;
  }

  /**
   * Returns a list of all visual only (diagram) elements.
   */
  get animationStations() {
    return this.animationStationsList;
  }
}

/**
 * Generates a pseudo random number generator from mean and CV using distcore.
 * @param {Number} E Mean
 * @param {Number} CV Coefficient of variation
 * @returns Pseudo random number generator
 */
function distributionBuilder(E, CV) {
  if (CV==0) return distcore.get("const("+E+")");
  if (CV==1.0) return distcore.get("exp("+E+")");
  return distcore.get("lognormal("+E+";"+(E*CV)+")");
}