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

export {SendEvent, ArrivalEvent, ServiceDoneEvent, WaitingCancelEvent};

import {Event} from "./SimCore.js";


/**
 * Sending a client from a origin to a destination station
 */
class SendEvent extends Event {
  /**
   * Constructor
   * @param {Number} time Simulation time at which the event is to be executed
   * @param {Object} sourceStation Origin station
   * @param {Object} destinationStation Destination station
   * @param {Object} client Client to be sent
   */
  constructor(time, sourceStation, destinationStation, client) {
    super(time);
    this.sourceStation=sourceStation;
    this.destinationStation=destinationStation;
    this.client=client;
  }

  execute(simulator) {
    const client=this.client;
    const sourceStation=this.sourceStation;
    const destinationStation=this.destinationStation;

    sourceStation.n--;
    destinationStation.n++;
    if (simulator.withAnimation) {
      simulator.animateMoveClients.push({from: sourceStation.id, to: destinationStation.id});
      simulator.animateStaticClients[sourceStation.id]=sourceStation.n;
      simulator.animateStaticClients[destinationStation.id]=destinationStation.n;
    }
    sourceStation.processLeave(simulator,client);
    destinationStation.processArrival(simulator,client);
  }

  /**
   * Generates a send event and adds it to the simulator
   * @param {Object} simulator Simulator object
   * @param {Object} sourceStation Origin station
   * @param {Object} destinationStation Destination station
   * @param {Object} client Client to be sent
   * @param {Number} delta When to execute the event (0 means now)
   */
  static sendClient(simulator, sourceStation, destinationStation, client, delta) {
    const time=simulator.time;
    simulator.addEvent(new SendEvent(time+delta,sourceStation,destinationStation,client));
  }
}


/**
 * Arrival of a client at a source station
 */
class ArrivalEvent extends Event {
  /**
   * Constructor
   * @param {Number} time Simulation time at which the event is to be executed
   * @param {Object} station Station at which the arrival will occur
   */
  constructor(time, station) {
    super(time);
    this.station=station;
  }

  execute(simulator) {
    const station=this.station;
    station.processArrival(simulator,null);
    ArrivalEvent.scheduleNext(simulator,station);
  }

  /**
   * Schedules the next client arrival event
   * @param {Object} simulator Simulator object
   * @param {Object} station Station at which the arrival will occur
   */
  static scheduleNext(simulator, station) {
    const time=simulator.time;
    const delta=station.distI();
    simulator.addEvent(new ArrivalEvent(time+delta,station));
  }
}


/**
 * This event is executed when a service process at a process station is finished.
 */
class ServiceDoneEvent extends Event {
  /**
   * Constructor
   * @param {Number} time Simulation time at which the event is to be executed
   * @param {Object} station Station at which the service process is finished
   */
  constructor(time, station) {
    super(time);
    this.station=station;
  }

  execute(simulator) {
    this.station.serviceEnded(simulator);
  }
}


/**
 * This event is executed when the waiting time tolerance of the client is exceeded.
 */
class WaitingCancelEvent extends Event {
  /**
   * Constructor
   * @param {Number} time Simulation time at which the event is to be executed
   * @param {Object} station Station at which the client is waiting
   * @param {Object} client Waiting client
   */
  constructor(time, station, client) {
    super(time);
    this.station=station;
    this.client=client;
  }

  execute(simulator) {
    this.station.cancelWaiting(simulator,this.client);
  }
}
