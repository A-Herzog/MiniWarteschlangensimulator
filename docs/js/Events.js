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

class SendEvent extends simcore.Event {
  constructor(time, sourceStation, destinationStation, client, changeNumbers) {
    super(time);
    this.sourceStation=sourceStation;
    this.destinationStation=destinationStation;
    this.client=client;
    this.changeNumbers=changeNumbers;
  }

  execute(simulator) {
    const client=this.client;
    const sourceStation=this.sourceStation;
    const destinationStation=this.destinationStation;
    if (this.changeNumbers) {
      sourceStation.n--;
      destinationStation.n++;
      if (simulator.withAnimation) {
        simulator.animateMoveClients.push({from: sourceStation.id, to: destinationStation.id});
        simulator.animateStaticClients[sourceStation.id]=sourceStation.n;
        simulator.animateStaticClients[destinationStation.id]=destinationStation.n;
      }
    }
    sourceStation.processLeave(simulator,client);
    destinationStation.processArrival(simulator,client);
  }

  static sendClient(simulator, sourceStation, destinationStation, client, delta) {
    const time=simulator.time;
    simulator.addEvent(new SendEvent(time+delta,sourceStation,destinationStation,client,delta>0));
    if (delta==0) {
      sourceStation.n--;
      destinationStation.n++;
      if (simulator.withAnimation) {
        simulator.animateMoveClients.push({from: sourceStation.id, to: destinationStation.id});
        simulator.animateStaticClients[sourceStation.id]=sourceStation.n;
        simulator.animateStaticClients[destinationStation.id]=destinationStation.n;
      }
    }
  }
}



class ArrivalEvent extends simcore.Event {
  constructor(time, station) {
    super(time);
    this.station=station;
  }

  execute(simulator) {
    const station=this.station;
    station.processArrival(simulator,null);
    ArrivalEvent.scheduleNext(simulator,station);
  }

  static scheduleNext(simulator, station) {
    const time=simulator.time;
    const delta=station.distI();
    simulator.addEvent(new ArrivalEvent(time+delta,station));
  }
}



class ServiceDoneEvent extends simcore.Event {
  constructor(time, station) {
    super(time);
    this.station=station;
  }

  execute(simulator) {
    this.station.serviceEnded(simulator);
  }
}



class WaitingCancelEvent extends simcore.Event {
  constructor(time, station, client) {
    super(time);
    this.station=station;
    this.client=client;
  }

  execute(simulator) {
    this.station.cancelWaiting(simulator,this.client);
  }
}