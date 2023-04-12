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

class Client {
  constructor() {
    this.w=0;
    this.s=0;
  }
}



class SimElement {
  constructor(editElement) {
    this.editElement=editElement;
    this.nextSimElements=[];
    this.n=0;
  }

  get id() {
    return this.editElement.id;
  }

  get name() {
    return this.editElement.name;
  }

  addEdgeOut(nextSimElement) {
    this.nextSimElements.push(nextSimElement);
  }

  build(globalStatistics) {
    return null;
  }

  initStatistics(globalStatistics, priority, fields) {
    this.statistics={priority: priority};
    for (let name in fields) this.statistics[name]=fields[name];
    globalStatistics[this.name]=this.statistics;
  }

  doneStatistics(simulator) {
  }

  generateInitialEvents(simulator) {
  }

  processArrival(simulator, client) {
  }

  processLeave(simulator, client) {
  }

  sendClient(simulator, client, destination, delta=0) {
    SendEvent.sendClient(simulator, this, destination, client, delta);
  }

  signal(simulator, nr) {
  }
}



class SimSource extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
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

  generateInitialEvents(simulator) {
    ArrivalEvent.scheduleNext(simulator,this);
  }

  processArrival(simulator, client) {
    const b=this.b;
    this.n=b;
    for (let i=1;i<=b;i++) {
      this.sendClient(simulator,new Client(),this.nextSimElements[0]);
    }
    simulator.arrivalCount++;
  }
}



class SimDelay extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length!=1) return language.builderSource.edge;

    const setup=this.editElement.setup;

    const ES=getPositiveFloat(setup.ES);
    if (ES==null) return language.builderDelay.ES;
    const CVS=getNotNegativeFloat(setup.CVS);
    if (CVS==null) return language.builderDelay.CVS;
    this.distS=distributionBuilder(ES,CVS);

    this.initStatistics(globalStatistics,2,{S: new statcore.Values(), N: new statcore.States(), n: new statcore.Counter()});

    return null;
  }

  doneStatistics(simulator) {
    this.statistics.N.set(simulator.time,this.n);
  }

  processArrival(simulator, client) {
    const statistics=this.statistics;

    statistics.n.add();

    const delta=this.distS();
    client.s+=delta;

    statistics.S.add(delta);
    statistics.N.set(simulator.time,this.n);

    this.sendClient(simulator,client,this.nextSimElements[0],delta);
  }

  processLeave(simulator, client) {
    this.statistics.N.set(simulator.time,this.n);
  }
}



class SimProcess extends SimElement {
  constructor(editElement) {
    super(editElement);
    this.queue=[];
    this.nq=0;
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
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

    this.initStatistics(globalStatistics,2,{W: new statcore.Values(), S: new statcore.Values(), NQ: new statcore.States(), N: new statcore.States(), cBusy: new statcore.States(), n: new statcore.Counter()});

    return null;
  }

  doneStatistics(simulator) {
    this.statistics.N.set(simulator.time,this.n);
    this.statistics.NQ.set(simulator.time,this.nq);
    this.statistics.cBusy.set(simulator.time,this.c-this.freeC);
  }

  processArrival(simulator, client) {
    const time=simulator.time;
    const statistics=this.statistics;
    statistics.n.add();

    /* Kunden an Station erfassen */
    statistics.N.set(time,this.n);

    /* Kunde an Warteschlange anstellen */
    this.queue.push(client);
    this.nq++;
    statistics.NQ.set(time,this.nq);
    client.startWaiting=time;

    /* Wenn nötig, Abbruch-Ereignis anlegen */
    if (this.nextCancel!=null) {
      const wt=this.distWT();
      const cancelEvent=new WaitingCancelEvent(time+wt,this,client);
      client.cancelEvent=cancelEvent;
      simulator.addEvent(cancelEvent);
    }

    /* Prüfen, ob eine Bedienung beginnen kann */
    this.testStartService(simulator);
  }

  processLeave(simulator, client) {
    this.statistics.N.set(simulator.time,this.n);
  }

  serviceEnded(simulator) {
    /* Bediener als "frei" vermerken */
    this.freeC++;
    this.statistics.cBusy.set(simulator.time,this.c-this.freeC);

    /* Prüfen, ob eine Bedienung beginnen kann */
    this.testStartService(simulator);
  }

  testStartService(simulator) {
    const b=this.b;
    if (this.queue.length<b || this.freeC==0) return;

    const statistics=this.statistics;
    const time=simulator.time;

    const delta=this.distS();

    for (let i=1;i<=b;i++) {
      /* Kunde aus Warteschlange entnehmen */
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

      /* Statistik für Station und Kunde erfassen */
      const W=time-client.startWaiting;
      statistics.W.add(W);
      statistics.S.add(delta);
      client.w+=W;
      client.s+=delta;

      /* Weiterleitung konfigurieren */
      this.sendClient(simulator,client,this.nextSuccess,delta);

      /* Wenn nötig, Abbruch-Ereigniss löschen */
      if (typeof(client.cancelEvent)!='undefined' && client.cancelEvent!=null) {
        simulator.removeEvent(client.cancelEvent);
        client.cancelEvent=null;
      }
    }

    /* Warteschlangenlänge erfassen */
    this.nq-=b;
    statistics.NQ.set(time,this.nq);

    /* Bediener als "belegt" vermerken */
    this.freeC--;
    statistics.cBusy.set(time,this.c-this.freeC);

    /* Ereignis für "Bedeinung zuende" anlegen */
    simulator.addEvent(new ServiceDoneEvent(time+delta,this));
  }

  cancelWaiting(simulator, client) {
    /* Kunde aus Warteschlange entfernen */
    const index=this.queue.indexOf(client);
    this.queue.splice(index,1);
    this.nq--;
    this.statistics.NQ.set(simulator.time,this.nq);

    /* Statistik für Station und Kunde erfassen */
    const W=simulator.time-client.startWaiting;
    this.statistics.W.add(W);
    client.w+=W;

    /* Weiterleiten */
    this.sendClient(simulator,client,this.nextCancel,0);
  }
}



class SimDecide extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
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

    this.initStatistics(globalStatistics,1,{n: new statcore.Counter()});

    return null;
  }

  processArrival(simulator, client) {
    this.statistics.n.add();

    let next=0;

    if (this.mode==0) {
      /* Zufällig */
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

    this.sendClient(simulator,client,this.nextSimElements[next],0);
  }
}



class SimDuplicate extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1) return language.builderDuplicate.edge;

    this.initStatistics(globalStatistics,1,{n: new statcore.Counter()});

    return null;
  }

  processArrival(simulator, client) {
    this.statistics.n.add();
    this.sendClient(simulator,client,this.nextSimElements[0],0);

    for (let i=1;i<this.nextSimElements.length;i++) {
      const newClient=new Client();
      newClient.w=client.w;
      newClient.s=client.s;
      this.n+=1;
      this.sendClient(simulator,newClient,this.nextSimElements[i],0);
    }
  }
}



class SimCounter extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1) return language.builderDuplicate.edge;

    this.initStatistics(globalStatistics,1,{n: new statcore.Counter()});

    return null;
  }

  processArrival(simulator, client) {
    this.statistics.n.add();
    this.sendClient(simulator,client,this.nextSimElements[0],0);
  }
}



class SimDispose extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    this.initStatistics(globalStatistics,1,{W: new statcore.Values(), S: new statcore.Values(), V: new statcore.Values(), n: new statcore.Counter()});

    return null;
  }

  processClientForStatistics(client) {
    if (typeof(client.sub)!='undefined') {
      for (let sub of client.sub) {
        sub.w+=client.w;
        sub.s+=client.s;
        this.processClientForStatistics(sub);
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

  processArrival(simulator, client) {
    this.processClientForStatistics(client);

    this.n=0;
    if (simulator.withAnimation) simulator.animateStaticClients[this.id]=0;
  }
}



class SimBatch extends SimElement {
  constructor(editElement) {
    super(editElement);
    this.queue=[];
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderBatch.edge;

    this.b=getPositiveInt(this.editElement.setup.b);
    if (this.b==null) return language.builderBatch.b;

    this.initStatistics(globalStatistics,2,{W: new statcore.Values(), N: new statcore.States()});

    return null;
  }

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
      this.sendClient(simulator,newClient,this.nextSimElements[0],0);
      this.n=this.n-this.b+1;
      if (simulator.withAnimation) simulator.animateStaticClients[this.id]=this.n;
    }
  }

  processLeave(simulator, client) {
    this.statistics.N.set(simulator.time,this.n);
  }
}



class SimSeparate extends SimElement {
  constructor(editElement) {
    super(editElement);
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderSeparate.edge;

    return null;
  }

  processArrival(simulator, client) {
    /* Handelt es sich überhaupt um einen Batch-Kunden? */
    if (typeof(client.sub)=='undefined') {
      this.sendClient(simulator,client,this.nextSimElements[0],0);
      return;
    }

    /* Warte- und Bedienzeit auf die untergeordneten Kunden übertragen */
    for (let i=0;i<client.sub.length;i++) {
      client.sub[i].w+=client.w;
      client.sub[i].s+=client.s;
    }

    /* Zählung anpassen */
    this.n=this.n-1+client.sub.length;

    /* Untergeordnete Kunden weiterleiten */
    for (let i=0;i<client.sub.length;i++) {
      this.sendClient(simulator,client.sub[i],this.nextSimElements[0],0);
    }
  }
}



class SimSignal extends SimElement {
  constructor(editElement) {
    super(editElement);
    this.nr=editElement.nr;
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderSeparate.edge;

    return null;
  }

  processArrival(simulator, client) {
    simulator.fireSignal(this.nr);
    this.sendClient(simulator,client,this.nextSimElements[0],0);
  }
}



class SimBarrier extends SimElement {
  constructor(editElement) {
    super(editElement);
    this.queue=[];
    this.nq=0;
  }

  build(globalStatistics) {
    const superError=super.build(globalStatistics);
    if (superError!=null) return superError;

    if (this.nextSimElements.length<1 || this.nextSimElements.length>2) return language.builderSeparate.edge;

    const setup=this.editElement.setup;

    this.release=getNotNegativeInt(setup.release);
    if (this.release==null) return language.builderProcess.release;

    this.signalNr=getPositiveInt(setup.signal);
    if (this.signalNr==null) return language.builderProcess.signal;

    this.initStatistics(globalStatistics,2,{W: new statcore.Values(), NQ: new statcore.States(), n: new statcore.Counter()});

    return null;
  }

  doneStatistics(simulator) {
    this.statistics.NQ.set(simulator.time,this.nq);
  }

  processArrival(simulator, client) {
    const time=simulator.time;
    const statistics=this.statistics;
    statistics.n.add();

    /* Kunde an Warteschlange anstellen */
    this.queue.push(client);
    this.nq++;
    statistics.NQ.set(time,this.nq);
    client.startWaiting=time;

    /* Prüfen, ob eine Freigabe erfolgen kann */
    this.testRelease(simulator);
  }

  signal(simulator, nr) {
    if (nr!=this.signalNr) return;
    this.release++; /* Freigabezähler erhöhen */
    console.log("Release!");
    this.testRelease(simulator);
  }

  testRelease(simulator) {
    /* Freigabe möglich? */
    if (this.queue.length==0 || this.release==0) return;
    this.release--; /* Freigabezähler verringern */

    const statistics=this.statistics;
    const time=simulator.time;

    /* Kunden Warteschlange entnehmen */
    const client=this.queue.shift();

    /* Statistik für Station und Kunde erfassen */
    const W=time-client.startWaiting;
    statistics.W.add(W);
    client.w+=W;

    /* Weiterleitung konfigurieren */
    this.sendClient(simulator,client,this.nextSimElements[0],0);

    /* Warteschlangenlänge erfassen */
    this.nq--;
    statistics.NQ.set(time,this.nq);
  }
}