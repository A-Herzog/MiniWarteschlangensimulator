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

export {WebSimulator, SimulatorWorker};

import {SimModelBuilder} from "./SimulatorBuilder.js";
import {simcore} from "./SimCore.js";
import {statcore} from "./StatCore.js";
import {language, getCharacteristicsInfo} from "./Language.js";


/**
 * Simulator class
 */
class WebSimulator extends simcore.Simulator {
  /**
   * Constructor
   * @param {Boolean} withAnimation Run in animation mode?
   */
  constructor(withAnimation) {
    super(null);
    this.withAnimation=withAnimation;
    this.statistics={};
    if (withAnimation) {
      this.animateMoveClients=[];
      this.animateStaticClients=[];
    }
    this.arrivalCount=0;
  }

  /**
   * Trys to build a simulation model from an editor model.
   * @param {Array} elements List of all stations
   * @param {Array} edges List of the edges connecting the stations
   * @returns Returns null if building was successful, otherwise an error message.
   */
  build(elements, edges) {
    const builder=new SimModelBuilder(elements,edges);
    const buildResult=builder.build(this.statistics);
    if (buildResult!=null) return buildResult;

    this.simStations=builder.stations;
    this.animationStationsList=builder.animationStations;
    for (let simStation of this.simStations) simStation.generateInitialEvents(this);

    return null;
  }

  /**
   * Returns the list of the simulation station boxes (not visual only stations).
   */
  get stations() {
    return this.simStations;
  }

  /**
   * Returns a list of all visual only (diagram) elements.
   */
  get animationStations() {
    return this.animationStationsList;
  }

  /**
   * Do all needed calculations (for statistics) when simulation is finished.
   */
  done() {
    for (let station of this.simStations) station.doneStatistics(this);
    for (let animationStation of this.animationStationsList) animationStation.template.animateCleanFunc(animationStation.element,animationStation.data);
  }

  /**
   * Executes the next waiting event.
   * @returns Returns true if there was an event to be executed, otherwise (if the events list is empty) false.
   */
  executeNext() {
    if (this.withAnimation) this.animateMoveClients=[];
    return super.executeNext();
  }

  /**
   * Returns runtime information on a station as html code.
   * @param {String} stationName Name of the station
   * @param {Object} stationData Runtime station data
   * @returns Runtime information on a station as html code
   */
  #getAnimationStatisticTextStation(stationName, stationData) {
    let status="";
    status+="<p><u>"+stationName+"</u><br>";
    status+="<small>";
    let count=0;
    for (let recordName in stationData) {
      const className=stationData[recordName].constructor.name;
      if (className=='States') {
        if (count>0) status+=", ";
        if (count>0 && count%2==0) status+="<br>";
        count++;
        status+=getCharacteristicsInfo(recordName)+"="+stationData[recordName].current;
      }
      if (className=='Values' || className=='States') {
        if (count>0) status+=", ";
        if (count>0 && count%2==0) status+="<br>";
        count++;
        status+=getCharacteristicsInfo("E["+recordName+"]")+"=<span title='"+stationData[recordName].mean.toLocaleString()+"'>"+statcore.formatShorter(stationData[recordName].mean)+"</span>";
      }
      if (className=='Counter') {
        if (count>0) status+=", ";
        if (count>0 && count%2==0) status+="<br>";
        count++;
        status+=getCharacteristicsInfo(recordName)+"="+stationData[recordName].count.toLocaleString();
      }
    }
    status+="</small></p>";
    return status;
  }

  /**
   * Fires a signal.
   * @param {Number} nr Number of the signal
   */
  fireSignal(nr) {
    for (let station of this.simStations) if (typeof(station.signal)=='function') station.signal(this,nr);
  }

  /**
   * Returns the runtime station information to be displayed during animation.
   */
  get info() {
    let status="";
    status+="<p><small>"+language.tabAnimation.time+": "+simcore.formatTime(this.time)+"</small></p>";

    for (let priority=3;priority>=1;priority--) for (let stationName in this.statistics) {
      const stationData=this.statistics[stationName];
      if (stationData.priority==priority) status+=this.#getAnimationStatisticTextStation(stationName,stationData);
    }

    return status;
  }

  /**
   * Short simulation results.
   */
  get infoShort() {
    const raw={};

    for (let stationName in this.statistics) {
       const stationData=this.statistics[stationName];
       const data={};
       for (let recordName in stationData) {
         let value=null;
         const className=stationData[recordName].constructor.name;
         if (className=='Values' || className=='States') value=stationData[recordName].mean;
         if (className=='Counter') value=stationData[recordName].count;
         if (value!=null) data[recordName]=value;
       }
       raw[stationName]=data;
    }

    return raw;
  }

  /**
   * Detailed simulation results.
   */
  get infoFull() {
    const raw={};

    raw.time=this.time;

    raw.stations={};
    for (let stationName in this.statistics) {
      const stationData=this.statistics[stationName];
      raw.stations[stationName]={};
      raw.stations[stationName].priority=stationData.priority;
      raw.stations[stationName].records={};
      const rawData=raw.stations[stationName].records;
      for (let recordName in stationData) {
        const className=stationData[recordName].constructor.name;
        const stat=stationData[recordName];
        if (className=='Values') {
          rawData["E["+recordName+"]"]=stat.makePlain();
          rawData["E["+recordName+"]"].name=recordName;
        }
        if (className=='States') {
          rawData["E["+recordName+"]"]={count: stat.time, mean: stat.mean, min: stat.min, max: stat.max};
          rawData["E["+recordName+"]"].name=recordName;
        }
        if (className=='Counter') {
          rawData[recordName]={count: stat.count};
          rawData[recordName].name=recordName;
        }
      }
    }

    return raw;
  }
}


/**
 * Simulator web worker class
 */
class SimulatorWorker {
  /**
   * Constructor
   * @param {Array} models Models to be simulated in parallel
   * @param {Object} infoElement Html node for displaying progress information
   * @param {Object} progressBar Progress bar html node
   * @param {Function} resultsCallback Function which is called when the simulation was completed
   * @param {Function} cancelCallback Function which is called when the simulation was canceled
   */
  constructor(models, infoElement, progressBar, resultsCallback, cancelCallback) {
    this.models=models;
    this.infoElement=infoElement;
    this.progressBar=progressBar;
    this.resultsCallback=resultsCallback;
    this.cancelCallback=cancelCallback;
  }

  /**
   * Start processing
   */
  start() {
    const that=this;
    this.worker=[];
    this.workerProgress=[];
    this.results=[];
    for (let i=0;i<this.models.length;i++) {
      const w=new Worker('./js/Worker.js',{type: "module"});
      w.onerror=()=>that.infoElement.innerHTML=language.tabAnimation.simulationWebWorkerError;
      w.onmessage=e=>that.#processMessage(w,e);
      this.worker.push(w);
      this.workerProgress.push(0);
      this.results.push({});
    }

    let path=window.location.href;
    if (path.endsWith(".html")) path=path.substring(0,path.lastIndexOf("/")+1);
    if (!path.endsWith("/")) path+="/";

    for (let i=0;i<this.models.length;i++) {
	    this.worker[i].postMessage({path: path, model: JSON.stringify(this.models[i]), useLanguage: ((document.documentElement.lang=='de')?'de':'en')});
    }
  }

  /**
   * Process message from worker thread
   * @param {Object} w Worker
   * @param {Object} e Message
   */
  #processMessage(w, e) {
    const index=this.worker.indexOf(w);
    const answer=JSON.parse(e.data);

    /* Progress */
    if (typeof(answer.progress)!='undefined') {
      const workerProgress=this.workerProgress;
      workerProgress[index]=answer.progress;
      const sum=workerProgress.reduce((a,b)=>a+b,0);
      const percent=Math.round(sum*100/workerProgress.length)+"%";
      this.progressBar.style.width=percent;
      this.progressBar.innerHTML=percent;
    }

    /* Results */
    if (typeof(answer.resultShort)!='undefined') {
      this.worker[index].terminate();
      this.results[index]=answer;
      this.worker[index]=null;
      let allDone=true;
      for (let i=0;i<this.worker.length;i++) if (this.worker[i]!=null) {allDone=false; break;}
      if (allDone) this.resultsCallback();
    }
  }

  /**
   * Cancel simulation.
   */
  cancel() {
    for (let i=0;i<this.worker.length;i++) if (this.worker[i]!=null) {
      this.worker[i].terminate();
      this.worker[i]=null;
    }
    this.cancelCallback();
  }

  /**
   * Generates a text from a statistic object.
   * @param {Object} statistics Station statistics
   * @returns Statistics results as (html formated) text
   * @see info
   */
  #buildTextFromStatistics(statistics) {
    let status="";
    status+="<p><small>"+language.tabAnimation.time+": "+simcore.formatTime(statistics.time)+"</small></p>";

    for (let priority=3;priority>=1;priority--) for (let stationName in statistics.stations) {
      const stationData=statistics.stations[stationName];
      if (stationData.priority==priority) {
        status+="<p><u>"+stationName+"</u><br><small>";
        let count=0;
        for (let recordName in stationData.records) {
          const recordData=stationData.records[recordName];
          if (count>0) status+=",&nbsp;&nbsp;";
          if (count>0 && count%4==0) status+="<br>";
          count++;
          const value=(typeof(recordData.mean)=='undefined')?recordData.count:recordData.mean;
          status+=getCharacteristicsInfo(recordName)+"=<span title='"+value.toLocaleString()+"'>"+statcore.formatShorter(value)+"</span>";

          if (recordData.name=="W" && typeof(recordData.cv)!='undefined') {
            if (count>0) status+=",&nbsp;&nbsp;";
            if (count>0 && count%4==0) status+="<br>";
            count++;
            status+=getCharacteristicsInfo("CV[W]")+"=<span title='"+recordData.cv.toLocaleString()+"'>"+statcore.formatShorter(recordData.cv)+"</span>";
          }
        }
        status+="</small></p>";
      }
    }

    return status;
  }

  /**
   * Joins the statistics from the threads to a single statistic object.
   * @param {Array} results Statistic results of the individual web workers
   * @returns Joined statstics
   * @see info
   * @see full
   */
  #joinResults(results) {
    const result=structuredClone(results[0]);

    for (let i=1;i<results.length;i++) {
      const r=results[i];
      result.time+=r.time;
      for (let stationName in r.stations) {
        for (let recordName in r.stations[stationName].records) {
          const recordData=r.stations[stationName].records[recordName];
          const resultData=result.stations[stationName].records[recordName];
          if (typeof(resultData.mean)!='undefined') {
            if (resultData.count+recordData.count>0) resultData.mean=(resultData.mean*resultData.count+recordData.mean*recordData.count)/(resultData.count+recordData.count);
          }
          resultData.count+=recordData.count;
          if (typeof(resultData.sum)!='undefined') {
            resultData.sum+=recordData.sum;
            resultData.sum2+=recordData.sum2;
          }
          if (typeof(resultData.max)!='undefined') {
            resultData.min=Math.min(resultData.min,recordData.min);
            resultData.max=Math.max(resultData.max,recordData.max);
          }
        }
      }
    }

    for (let stationName in result.stations) {
      for (let recordName in result.stations[stationName].records) {
        const recordData=result.stations[stationName].records[recordName];
        if (typeof(recordData.sum)=='undefined') continue;
        recordData.mean=(recordData.count==0)?0:(recordData.sum/recordData.count);
        recordData.sd=(recordData.count<2)?0:Math.sqrt(Math.max(0,recordData.sum2/(recordData.count-1)-recordData.sum**2/recordData.count/(recordData.count-1)));
        recordData.cv=(recordData.mean==0)?0:(recordData.sd/recordData.mean);
      }
    }

    result.threads=results.threads;

    return result;
  }

  /**
   * Returns short simulation statistics.
   */
  get info() {
    const data=[];
    data.threads=this.results.length;
    for (let i=0;i<this.results.length;i++) data.push(this.results[i].resultFull);
    if (data.length==1) {
      data[0].threads=1;
      return this.#buildTextFromStatistics(data[0]);
    } else {
      const result=this.#joinResults(data);
      return this.#buildTextFromStatistics(result);
    }
  }

  /**
   * Returns simulation statistics in raw format (for later processing in parameter series).
   */
  get raw() {
    let data=[];
    for (let i=0;i<this.results.length;i++) data.push(this.results[i].resultShort);
    return data;
  }

  /**
   * Returns detailed simulation statistics.
   */
  get full() {
    const data=[];
    data.threads=this.results.length;
    for (let i=0;i<this.results.length;i++) data.push(this.results[i].resultFull);
    if (data.length==1) {
      data[0].threads=1;
      return data[0];
    } else {
      return this.#joinResults(data);
    }
  }
}
