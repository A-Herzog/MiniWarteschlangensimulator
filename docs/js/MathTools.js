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

export {loadMathJs, complileCondition};


/** Is math.js already loaded? */
let mathJsLoaded=false;

/**
 * Loaded math.js (if not already loaded) and then executes a lambda expression.
 * @param {Function} then Will be executed when math.js is available.
 */
function loadMathJs(then) {
  if (mathJsLoaded) {
    then();
    return;
  }

  mathJsLoaded=true;

  const script=document.createElement("script");
  script.src="./libs/math.js";
  script.async=false;
  script.onload=then;
  document.head.appendChild(script);
}

/**
 * Prepares and compiles an entered expression.
 * @param {String} condition Entered condition
 * @param {Object} math Math.js object to be used
 * @returns Compiled condition
 */
function complileCondition(condition, math) {
    condition=condition.replaceAll(",",".");
    return math.compile(condition);
}