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

export {statcore};

/**
 * StatCore base object containing all exported classes as properties.
 */
const statcore={};


/**
 * Converts a number to a locale string with one digit
 * @param {Number} num Number to be formated as a locale string
 * @returns Number as locale string with one digit
 */
statcore.formatShorter=function(num) {
  return (Math.round(num*10)/10).toLocaleString();
}


/**
 * Keeps a value
 */
statcore.Value=class Value {
  /**
   * Constructor
   * @param {Number} value Initial value, optional, default: 0
   */
  constructor(value=0) {
    this.fieldValue=value;
  }

  /**
   * Returns the current value.
   */
  get value() {
    return this.fieldValue;
  }

  /**
   * Sets the value to a new value.
   */
  set value(value) {
    this.fieldValue=value;
  }
}


/**
 * A simple counter
 */
statcore.Counter=class Counter {
  /**
   * Constructor
   */
  constructor() {
    this.fieldCount=0;
  }

  /**
   * Resets the counter
   */
  reset() {
    this.fieldCount=0;
  }

  /**
   * Adds n to counter.
   * @param {Number} n Number to be added to the counter (default: 1)
   */
  add(n=1) {
    this.fieldCount+=n;
  }

  /**
   * Gets the value of the counter.
   */
  get count() {
    return this.fieldCount;
  }

  toString() {
    return this.count;
  }

  /**
   * Generates an object only containing fields.
   * @return Object only containing fields
   */
  makePlain() {
    return {
	    count: this.count
	  };
  }

  /**
   * Adds data from some other statistics object.
   * @param {Object} otherCounter Data to be added
   */
  addPartial(otherCounter) {
    this.fieldCount+=otherCounter.count;
  }
}


/**
 * Collects individual values (like waiting times of clients)
 */
statcore.Values=class Values {
  /**
   * Constructor
   */
  constructor() {
    this.fieldCount=0;
    this.fieldSum=0;
    this.fieldSum2=0;
    this.fieldMin=Number.MAX_SAFE_INTEGER;
    this.fieldMax=0;
  }

  /**
   * Resets collected data
   */
  reset() {
    this.fieldCount=0;
    this.fieldSum=0;
    this.fieldSum2=0;
    this.fieldMin=Number.MAX_SAFE_INTEGER;
    this.fieldMax=0;
  }

  /**
   * Adds a value to the statistics
   * @param {Number} value  Value to record
   */
  add(value) {
    this.fieldCount++;
    this.fieldSum+=value;
    this.fieldSum2+=value*value;
    if (value<this.fieldMin) this.fieldMin=value;
    if (value>this.fieldMax) this.fieldMax=value;
  }

  /**
   * Number of recorded values
   */
  get count() {
    return this.fieldCount;
  }

  /**
   * Sum of all recorded values
   */
  get sum() {
    return this.fieldSum;
  }

  /**
   * Minimal value of all recorded values
   */
  get min() {
    return this.fieldMin;
  }

  /**
   * Maximal value of all recorded values
   */
  get max() {
    return this.fieldMax;
  }

  /**
   * Average value
   */
  get mean() {
    if (this.fieldCount==0) return 0;
    return this.fieldSum/this.fieldCount;
  }

  /**
   * Standard deviation of the values
   */
  get sd() {
    if (this.fieldCount<2) return 0;
		const v=this.fieldSum2/(this.fieldCount-1)-(this.fieldSum*this.fieldSum)/this.fieldCount/(this.fieldCount-1);
		return Math.sqrt(Math.max(0,v));
  }

  /**
   * Coefficient of variation of the values
   */
  get cv() {
    const m=this.mean;
    if (m==0) return 0;
    return this.sd/Math.abs(m);
  }

  toString() {
    if (this.count==0) return "count=0";
    if (this.sum==0) return "count="+statcore.formatShorter(this.count)+", sum=0";
    return "count="+statcore.formatShorter(this.count)+", sum="+statcore.formatShorter(this.sum)+", mean="+statcore.formatShorter(this.mean)+", sd="+statcore.formatShorter(this.sd)+", cv="+statcore.formatShorter(this.cv)+", min="+statcore.formatShorter(this.min)+", max="+statcore.formatShorter(this.max);
  }

    /**
   * Generates an object only containing fields.
   * @return Object only containing fields
   */
  makePlain() {
    return {
	    count: this.count,
	    sum: this.sum,
	    sum2: this.fieldSum2,
	    min: this.min,
	    max: this.max,
	    mean: this.mean,
	    sd: this.sd,
	    cv: this.cv
	  };
  }

  /**
   * Adds data from some other statistics object.
   * @param {Object} otherValues Data to be added
   */
  addPartial(otherValues) {
    this.fieldCount+=otherValues.count;
    this.fieldSum+=otherValues.sum;
    this.fieldSum2+=otherValues.sum2;
    this.fieldMin=Math.min(this.fieldMin,otherValues.min);
    this.fieldMax=Math.max(this.fieldMax,otherValues.max);
  }
}


/**
 * Records some state that changes over time (like number of clients in system)
 */
statcore.States=class States {
  /**
   * Constructor
   */
  constructor() {
    this.lastTime=-1;
    this.lastState=-1;

    this.fieldTimeSum=0.0;
    this.fieldStateSum=0.0;
    this.fieldMin=Number.MAX_SAFE_INTEGER;
    this.fieldMax=0;
  }

  /**
   * Resets collected data
   */
  reset() {
    this.lastTime=-1;
    this.lastState=-1;

    this.fieldTimeSum=0;
    this.fieldStateSum=0;
    this.fieldMin=Number.MAX_SAFE_INTEGER;
    this.fieldMax=0;
  }

  /**
   * Informs the collector of a state change
   * @param {Number} time Time at which the state change happend
   * @param {Number} state  New state that gets active at the given time
   */
  set(time,state) {
    if (this.lastTime>=0 && time>this.lastTime) this.#add(time-this.lastTime,this.lastState);
    this.lastTime=time;
    this.lastState=state;
  }

  #add(timeDelta,state) {
    this.fieldTimeSum+=timeDelta;
    this.fieldStateSum+=timeDelta*state;
    if (state<this.fieldMin) this.fieldMin=state;
    if (state>this.fieldMax) this.fieldMax=state;
  }

  /**
   * Length of time for which the state was recorded
   */
  get time() {
    return this.fieldTimeSum;
  }

  /**
   * Minimum recorded state
   */
  get min() {
    return this.fieldMin;
  }

  /**
   * Maximum recorded state
   */
  get max() {
    return this.fieldMax;
  }

  /**
   * Average state over the time
   */
  get mean() {
    if (this.fieldTimeSum<=0.0) return 0;
    const result=this.fieldStateSum/this.fieldTimeSum;
    return isNaN(result)?0:result;
  }

  /**
   * Current state
   */
  get current() {
    return this.lastState;
  }

  toString() {
    return "time="+statcore.formatShorter(this.time)+", mean="+statcore.formatShorter(this.mean)+", min="+statcore.formatShorter(this.min)+", max="+statcore.formatShorter(this.max);
  }

  /**
   * Generates an object only containing fields.
   * @return Object only containing fields
   */
  makePlain() {
    return {
	    time: this.time,
	    sum: this.fieldStateSum,
	    min: this.min,
	    max: this.max,
	    mean: this.mean
	  };
  }

  /**
   * Adds data from some other statistics object.
   * @param Object otherStates Data to be added
   */
  addPartial(otherStates) {
    this.fieldTimeSum+=otherStates.time;
    this.fieldStateSum+=otherStates.sum;
    this.fieldMin=Math.min(this.fieldMin,otherStates.min);
    this.fieldMax=Math.max(this.fieldMax,otherStates.max);
  }
}


/**
 * Statistics collector base class
 */
statcore.Statistics=class Statistics {
  constructor() {
    this.allNames=[];
    this.allObjs=[];
  }

  /**
   * Adds an individual statistics recorder to this object
   * @param {String} name Name of the statistics indicator
   * @param {Object} obj Collector object
   */
  add(name,obj) {
    this.allNames.push(name);
    this.allObjs.push(obj);
  }

  /**
   * Resets collected data
   */
  reset() {
    for (let i=0;i<this.allObjs.length;i++) this.allObjs[i].reset();
  }

  toString() {
    let info="";
    for (let i=0;i<this.allObjs.length;i++) info+=this.allNames[i]+": "+this.allObjs[i].toString()+"\n";
    return info;
  }

  /**
   * Generates an object only containing fields.
   * @return {Object} only containing fields
   */
  makePlain() {
	const result={};
	for (let i=0;i<this.allObjs.length;i++) result[this.allNames[i]]=this.allObjs[i].makePlain();
	return result;
  }

  /**
   * Adds data from some other statistics object.
   * @param Object partialData Data to be added
   */
  addPartial(partialData) {
	  for (let i=0;i<this.allObjs.length;i++) this.allObjs[i].addPartial(partialData[this.allNames[i]]);
  }
}