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

export {SimSource, SimDelay, SimProcess, SimDecide, SimDuplicate, SimCounter, SimDispose, SimBatch, SimSeparate, SimSignal, SimBarrier};

import {distributionBuilder} from "./SimulatorBuilder.js";
import {statcore} from "./StatCore.js";
import {SendEvent, ArrivalEvent, ServiceDoneEvent, WaitingCancelEvent} from "./Events.js";
import {getPositiveFloat, getNotNegativeFloat, getPositiveInt, getNotNegativeInt} from './Tools.js';
import {language} from "./Language.js";


/**
 * Simulation client class
 */
class Client {
  /**
   * Constructor
   */
  constructor() {
    this.w=0;
    this.s=0;
  }
}


/**
 * Abstract simulation station class
 */
class SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    this.editElement=editElement;
    this.nextSimElements=[];
    this.n=0;
  }

  /**
   * Returns the id of the station.
   */
  get id() {
    return this.editElement.id;
  }

  /**
   * Returns the name of the station.
   */
  get name() {
    return this.editElement.name;
  }

  /**
   * Add a connecting to the following station.
   * @param {Object} nextSimElement Next station
   */
  addEdgeOut(nextSimElement) {
    this.nextSimElements.push(nextSimElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    return null;
  }

  /**
   * Adds the statistic indicators for this station to the global statistics object.
   * @param {Object} globalStatistics Global statistic object (parameter in build function)
   * @param {Number} priority Display order for this statistic indicator
   * @param {Object} fields Names and statistics objects to be added to the global statistics
   */
  _initStatistics(globalStatistics, priority, fields) {
    this.statistics={priority: priority};
    for (let name in fields) this.statistics[name]=fields[name];
    globalStatistics[this.name]=this.statistics;
  }

  /**
   * Is called at the end of the simulation to complete the statistic data.
   * @param {Object} simulator Simulator object
   */
  doneStatistics(simulator) {
  }

  /**
   * Is called by the simulator to generate the events which should be in the list at the beginning of the simulation.
   * (For example the first client arrival at a source station.)
   * @param {Object} simulator Statistic object
   */
  generateInitialEvents(simulator) {
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
  }

  /**
   * Processes a client leaving this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processLeave(simulator, client) {
  }

  /**
   * Sends a client to another station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client to be sent
   * @param {Object} destination Destination station
   * @param {Number} delta Time delta (0 means "now")
   */
  _sendClient(simulator, client, destination, delta=0) {
    SendEvent.sendClient(simulator, this, destination, client, delta);
  }

  /**
   * Notifies the station that a signal has been fired.
   * @param {Object} simulator Simulator object
   * @param {Number} nr Number of the signal
   */
  signal(simulator, nr) {
  }
}


/**
 * Simulation source station
 */
class SimSource extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length!=1) return language.builderSource.edge;

    const setup=this.editElement.setup;

    const EI=getPositiveFloat(setup.EI);
    if (EI==null) return language.builderSource.EI;
    const CVI=getNotNegativeFloat(setup.CVI);
    if (CVI==null) return language.builderSource.CVI;
    this.distI=distributionBuilder(EI,CVI);

    this.b=getPositiveInt(setup.b);
    if (this.b==null) return language.builderSource.b;

    return null;
  }

  /**
   * Is called by the simulator to generate the events which should be in the list at the beginning of the simulation.
   * (First client arrival at this source station.)
   * @param {Object} simulator Statistic object
   */
  generateInitialEvents(simulator) {
    ArrivalEvent.scheduleNext(simulator,this);
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    const b=this.b;
    this.n=b;
    for (let i=1;i<=b;i++) {
      this._sendClient(simulator,new Client(),this.nextSimElements[0]);
    }
    simulator.arrivalCount++;
  }
}


/**
 * Simulation delay station
 */
class SimDelay extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length!=1) return language.builderSource.edge;

    const setup=this.editElement.setup;

    const ES=getPositiveFloat(setup.ES);
    if (ES==null) return language.builderDelay.ES;
    const CVS=getNotNegativeFloat(setup.CVS);
    if (CVS==null) return language.builderDelay.CVS;
    this.distS=distributionBuilder(ES,CVS);

    this._initStatistics(globalStatistics,2,{S: new statcore.Values(), N: new statcore.States(), n: new statcore.Counter()});

    return null;
  }

  /**
   * Is called at the end of the simulation to complete the statistic data.
   * @param {Object} simulator Simulator object
   */
  doneStatistics(simulator) {
    this.statistics.N.set(simulator.time,this.n);
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    const statistics=this.statistics;

    statistics.n.add();

    const delta=this.distS();
    client.s+=delta;

    statistics.S.add(delta);
    statistics.N.set(simulator.time,this.n);

    this._sendClient(simulator,client,this.nextSimElements[0],delta);
  }

  /**
   * Processes a client leaving this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processLeave(simulator, client) {
    this.statistics.N.set(simulator.time,this.n);
  }
}


/**
 * Simulation process station
 */
class SimProcess extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
    this.queue=[];
    this.nq=0;
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderProcess.edge;

    const setup=this.editElement.setup;

    const ES=getPositiveFloat(setup.ES);
    if (ES==null) return language.builderProcess.ES;
    const CVS=getNotNegativeFloat(setup.CVS);
    if (CVS==null) return language.builderProcess.CVS;
    this.distS=distributionBuilder(ES,CVS);

    this.b=getPositiveInt(setup.b);
    if (this.b==null) return language.builderProcess.b;

    this.c=getPositiveInt(setup.c);
    if (this.c==null) return language.builderProcess.c;
    this.freeC=this.c;

    this.policy=parseInt(setup.policy);

    this.nextSuccess=this.nextSimElements[0];
    if (this.nextSimElements.length==2) {
      const EWT=getPositiveFloat(setup.EWT);
      if (EWT==null) return language.builderProcess.EWT;
      const CVWT=getNotNegativeFloat(setup.CVWT);
      if (CVWT==null) return language.builderProcess.CVWT;
      this.distWT=distributionBuilder(EWT,CVWT);

      this.nextCancel=this.nextSimElements[1];
      if (this.editElement.setup.SuccessNextBox==this.nextSimElements[1].id) {
        this.nextSuccess=this.nextSimElements[1];
        this.nextCancel=this.nextSimElements[0];
      }
    } else {
      this.distWT=null;
      this.nextCancel=null;
    }

    this._initStatistics(globalStatistics,2,{
      W: new statcore.Values(),
      S: new statcore.Values(),
      V: new statcore.Values(),
      NQ: new statcore.States(),
      N: new statcore.States(),
      cBusy: new statcore.States(),
      n: new statcore.Counter()
    });

    return null;
  }

  /**
   * Is called at the end of the simulation to complete the statistic data.
   * @param {Object} simulator Simulator object
   */
  doneStatistics(simulator) {
    this.statistics.N.set(simulator.time,this.n);
    this.statistics.NQ.set(simulator.time,this.nq);
    this.statistics.cBusy.set(simulator.time,this.c-this.freeC);
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    const time=simulator.time;
    const statistics=this.statistics;
    statistics.n.add();

    /* Record client at station */
    statistics.N.set(time,this.n);

    /* Add client to queue */
    this.queue.push(client);
    this.nq++;
    statistics.NQ.set(time,this.nq);
    client.startWaiting=time;

    /* If needed, add waiting cancelation event to list */
    if (this.nextCancel!=null) {
      const wt=this.distWT();
      const cancelEvent=new WaitingCancelEvent(time+wt,this,client);
      client.cancelEvent=cancelEvent;
      simulator.addEvent(cancelEvent);
    }

    /* Test if a service process can start */
    this._testStartService(simulator);
  }

  /**
   * Processes a client leaving this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processLeave(simulator, client) {
    this.statistics.N.set(simulator.time,this.n);
  }

  /**
   * Notifies the station that a service process has ended.
   * @param {Object} simulator Simulator object
   * @see ServiceDoneEvent
   */
  serviceEnded(simulator) {
    /* Define operator as "available" */
    this.freeC++;
    this.statistics.cBusy.set(simulator.time,this.c-this.freeC);

    /* Test if a service process can start */
    this._testStartService(simulator);
  }

  /**
   * Tests if a waiting client and a free operator is available so a serivce process can be started
   * (and starts the service process in this case).
   * @param {Object} simulator Simulator object
   */
  _testStartService(simulator) {
    const b=this.b;
    if (this.queue.length<b || this.freeC==0) return;

    const statistics=this.statistics;
    const time=simulator.time;

    const delta=this.distS();

    for (let i=1;i<=b;i++) {
      /* Remove client from queue */
      let client;
      switch (this.policy) {
        case 1:
          /* FIFO */
          client=this.queue.shift();
          break;
        case 0:
          /* Random */
          const useIndex=Math.floor(Math.random()*this.queue.length);
          client=this.queue.splice(useIndex,1)[0];
          break;
        case -1:
          /* LIFO */
          client=this.queue.splice(this.queue.length-1,1)[0];
          break;
        default:
          /* Fallback: FIFO */
          client=this.queue.shift();
          break;
      }

      /* Record statistics for client and for station */
      const W=time-client.startWaiting;
      statistics.W.add(W);
      statistics.S.add(delta);
      statistics.V.add(W+delta);
      client.w+=W;
      client.s+=delta;

      /* Configure forwarding */
      this._sendClient(simulator,client,this.nextSuccess,delta);

      /* If needed: Remove waiting cancelation event from list */
      if (typeof(client.cancelEvent)!='undefined' && client.cancelEvent!=null) {
        simulator.removeEvent(client.cancelEvent);
        client.cancelEvent=null;
      }
    }

    /* Record queue length */
    this.nq-=b;
    statistics.NQ.set(time,this.nq);

    /* Define operator as "occupied" */
    this.freeC--;
    statistics.cBusy.set(time,this.c-this.freeC);

    /* Added event "Service done" to list */
    simulator.addEvent(new ServiceDoneEvent(time+delta,this));
  }

  /**
   * Notifies the station that a waiting client has given up waiting.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   * @see WaitingCancelEvent
   */
  cancelWaiting(simulator, client) {
    /* Remove client from queue */
    const index=this.queue.indexOf(client);
    this.queue.splice(index,1);
    this.nq--;
    this.statistics.NQ.set(simulator.time,this.nq);

    /* Record statistics for client and for station */
    const W=simulator.time-client.startWaiting;
    this.statistics.W.add(W);
    client.w+=W;

    /* Forwarding */
    this._sendClient(simulator,client,this.nextCancel,0);
  }
}


/**
 * Simulation decide station
 */
class SimDecide extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1) return language.builderDecide.edge;

    const setup=this.editElement.setup;

    this.mode=setup.mode;
    if (this.mode<0 || this.mode>2) return language.builderDecide.mode;

    if (this.mode==1 || this.mode==2) for (let i=0;i<this.nextSimElements.length;i++) {
      if (this.nextSimElements[i].constructor.name!='SimProcess') {
        return language.builderDecide.nextMin1+this.nextSimElements[i].name+language.builderDecide.nextMin2;
      }
    }

    if (this.mode==0) {
      const rateStrings=setup.rates.split(';');
      while (rateStrings.length<this.nextSimElements.length) rateStrings.push("0");
      this.rates=[];
      this.ratesSum=0;
      for (let i=0;i<this.nextSimElements.length;i++) {
        const rate=getNotNegativeFloat(rateStrings[i]);
        if (rate==null) return language.builderDecide.nextRandom1+" "+(i+1)+" "+language.builderDecide.nextRandom2+" "+this.nextSimElements[i].name+" "+language.builderDecide.nextRandom3;
        this.rates.push(rate);
        this.ratesSum+=rate;
      }
    }

    this._initStatistics(globalStatistics,1,{n: new statcore.Counter()});

    return null;
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    this.statistics.n.add();

    let next=0;

    if (this.mode==0) {
      /* Random */
      const rnd=Math.random()*this.ratesSum;
      let sum=0;
      for (let i=0;i<this.rates.length;i++) {
        sum+=this.rates[i];
        if (sum>=rnd) {next=i; break;}
      }
    }

    if (this.mode==1) {
      /* Min NQ */
      let bestValue=this.nextSimElements[0].nq;
      let bestIndex=[0];
      for (let i=1;i<this.nextSimElements.length;i++) {
        const value=this.nextSimElements[i].nq;
        if (value<bestValue) {bestValue=value; bestIndex=[i]; continue;}
        if (value==bestValue) {bestIndex.push(i);}
      }
      if (bestIndex.length==1) {
        next=bestIndex[0];
      } else {
        next=bestIndex[Math.floor(Math.random()*bestIndex.length)];
      }
    }

    if (this.mode==2) {
      /* Min N */
      let bestValue=this.nextSimElements[0].n;
      let bestIndex=[0];
      for (let i=1;i<this.nextSimElements.length;i++) {
        const value=this.nextSimElements[i].n;
        if (value<bestValue) {bestValue=value; bestIndex=[i]; continue;}
        if (value==bestValue) {bestIndex.push(i);}
      }
      if (bestIndex.length==1) {
        next=bestIndex[0];
      } else {
        next=bestIndex[Math.floor(Math.random()*bestIndex.length)];
      }
    }

    this._sendClient(simulator,client,this.nextSimElements[next],0);
  }
}


/**
 * Simulation duplicate station
 */
class SimDuplicate extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1) return language.builderDuplicate.edge;

    this._initStatistics(globalStatistics,1,{n: new statcore.Counter()});

    return null;
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    this.statistics.n.add();
    this._sendClient(simulator,client,this.nextSimElements[0],0);

    for (let i=1;i<this.nextSimElements.length;i++) {
      const newClient=new Client();
      newClient.w=client.w;
      newClient.s=client.s;
      this.n+=1;
      this._sendClient(simulator,newClient,this.nextSimElements[i],0);
    }
  }
}


/**
 * Simulation counter station
 */
class SimCounter extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1) return language.builderDuplicate.edge;

    this._initStatistics(globalStatistics,1,{n: new statcore.Counter()});

    return null;
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    this.statistics.n.add();
    this._sendClient(simulator,client,this.nextSimElements[0],0);
  }
}


/**
 * Simulation dispose station
 */
class SimDispose extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    this._initStatistics(globalStatistics,1,{W: new statcore.Values(), S: new statcore.Values(), V: new statcore.Values(), n: new statcore.Counter()});

    return null;
  }

  /**
   * Records the data from a client object in statistics.
   * @param {Object} client Client object
   */
  #processClientForStatistics(client) {
    if (typeof(client.sub)!='undefined') {
      for (let sub of client.sub) {
        sub.w+=client.w;
        sub.s+=client.s;
        this.#processClientForStatistics(sub);
      }
    } else {
      const statistics=this.statistics;
      const w=client.w;
      const s=client.s;
      statistics.W.add(w);
      statistics.S.add(s);
      statistics.V.add(w+s);
      statistics.n.add();
    }
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    this.#processClientForStatistics(client);

    this.n=0;
    if (simulator.withAnimation) simulator.animateStaticClients[this.id]=0;
  }
}


/**
 * Simulation batch station
 */
class SimBatch extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
    this.queue=[];
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderBatch.edge;

    this.b=getPositiveInt(this.editElement.setup.b);
    if (this.b==null) return language.builderBatch.b;

    this._initStatistics(globalStatistics,2,{W: new statcore.Values(), N: new statcore.States()});

    return null;
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    /* Kunden an Station erfassen */
    this.statistics.N.set(simulator.time,this.n);

    /* Kunde an Warteschlange anstellen */
    this.queue.push(client);
    client.startWaiting=simulator.time;

    /* Prüfen, ob ein Batch gebildet werden kann */
    if (this.queue.length>=this.b) {
      const newClient=new Client();
      newClient.sub=[];
      for (let i=0;i<this.b;i++) {
        const c=this.queue.shift();
        const delta=simulator.time-c.startWaiting;
        c.w+=delta;
        this.statistics.W.add(delta);
        newClient.sub.push(c);
      }
      this._sendClient(simulator,newClient,this.nextSimElements[0],0);
      this.n=this.n-this.b+1;
      if (simulator.withAnimation) simulator.animateStaticClients[this.id]=this.n;
    }
  }

  /**
   * Processes a client leaving this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processLeave(simulator, client) {
    this.statistics.N.set(simulator.time,this.n);
  }
}


/**
 * Simulation separate station
 */
class SimSeparate extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderSeparate.edge;

    return null;
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    /* Is the current client a batch? */
    if (typeof(client.sub)=='undefined') {
      /* If no, just forward the client. */
      this._sendClient(simulator,client,this.nextSimElements[0],0);
      return;
    }

    /* Transfer waiting and processing times to subordinate clients */
    for (let i=0;i<client.sub.length;i++) {
      client.sub[i].w+=client.w;
      client.sub[i].s+=client.s;
    }

    /* Update client at this station counter */
    this.n=this.n-1+client.sub.length;

    /* Forward subordinate clients */
    for (let i=0;i<client.sub.length;i++) {
      this._sendClient(simulator,client.sub[i],this.nextSimElements[0],0);
    }
  }
}


/**
 * Simulation signal station
 */
class SimSignal extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
    this.nr=editElement.nr;
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderSeparate.edge;

    return null;
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    simulator.fireSignal(this.nr);
    this._sendClient(simulator,client,this.nextSimElements[0],0);
  }
}


/**
 * Simulation barrier station
 */
class SimBarrier extends SimElement {
  /**
   * Constructor
   * @param {Object} editElement Corresponding editor model element
   */
  constructor(editElement) {
    super(editElement);
    this.queue=[];
    this.nq=0;
  }

  /**
   * Initializes this simulation station from the editor model station (specified in the constructor).
   * @param {Object} globalStatistics Statistic object to be connected with this station
   * @param {Array} allElements List of all editor stations
   * @returns Error message or null in case of success
   */
  build(globalStatistics, allElements) {
    const superError=super.build(globalStatistics,allElements);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderSeparate.edge;

    const setup=this.editElement.setup;

    this.release=getNotNegativeInt(setup.release);
    if (this.release==null) return language.builderProcess.release;

    if (setup.signal=='') {
      const signalNumbers=allElements.filter(element=>element.type=='Signal').map(element=>element.nr);
      if (signalNumbers.length>0) setup.signal=signalNumbers[0];
    }
    this.signalNr=getPositiveInt(setup.signal);
    if (this.signalNr==null) return language.builderProcess.signal;

    this.storeStignals=setup.storeSignals;

    this._initStatistics(globalStatistics,2,{W: new statcore.Values(), NQ: new statcore.States(), n: new statcore.Counter()});

    return null;
  }

  /**
   * Is called at the end of the simulation to complete the statistic data.
   * @param {Object} simulator Simulator object
   */
  doneStatistics(simulator) {
    this.statistics.NQ.set(simulator.time,this.nq);
  }

  /**
   * Processes a client arrival at this station.
   * @param {Object} simulator Simulator object
   * @param {Object} client Client object
   */
  processArrival(simulator, client) {
    const time=simulator.time;
    const statistics=this.statistics;
    statistics.n.add();

    /* Add client to queue */
    this.queue.push(client);
    this.nq++;
    statistics.NQ.set(time,this.nq);
    client.startWaiting=time;

    /* Test if a client can be released */
    this.#testRelease(simulator);
  }

  /**
   * Notifies the station that a signal has been fired.
   * @param {Object} simulator Simulator object
   * @param {Number} nr Number of the signal
   */
  signal(simulator, nr) {
    if (nr!=this.signalNr) return;
    this.release++; /* Increase release counter */
    this.#testRelease(simulator);
    if (!this.storeStignals) this.release=0;
  }

  /**
   * Test if a client can be released (and releases the client in this case)
   * @param {Object} simulator Simulator object
   */
  #testRelease(simulator) {
    /* Release possible? */
    if (this.queue.length==0 || this.release==0) return;
    this.release--; /* Decrease release counter */

    const statistics=this.statistics;
    const time=simulator.time;

    /* Remove client from queue */
    const client=this.queue.shift();

    /* Record statistics for client and for station */
    const W=time-client.startWaiting;
    statistics.W.add(W);
    client.w+=W;

    /* Setup forwarding */
    this._sendClient(simulator,client,this.nextSimElements[0],0);

    /* Record queue length */
    this.nq--;
    statistics.NQ.set(time,this.nq);
  }
}
