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

export {isDesktopApp, getPositiveFloat, getNotNegativeFloat, getPositiveInt, getNotNegativeInt};

const isDesktopApp=(typeof(NL_OS)!='undefined');
if (isDesktopApp) {
  Neutralino.init();
  Neutralino.events.on("windowClose",()=>Neutralino.app.exit());
}

/**
 * Converts a string to a floating point number.
 * A comma has to be used a decimal separator.
 * @param {String} value String value to be converted to a floating point number
 * @returns {Number} Floating point number or NaN if the string could not be interpreted as a number
 */
function parseFloatStrict(value) {
  if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) return Number(value);
  return NaN;
}

/**
 * Converts a number given as a string to a floating point number.
 * @param {String} id String value to be converted to a floating point number
 * @returns Floating point number or null if the string in the input field could not be interpreted as a number
 */
function getFloat(value) {
  if (typeof(value)=='string') value=value.replace(',','.');
  const num=parseFloatStrict(value);
  if (isNaN(num)) return null;
  return num;
}

/**
 * Converts a positive number given as a string to a floating point number.
 * @param {String} id String value to be converted to a floating point number
 * @returns Floating point number or null if the string in the input field could not be interpreted as a positive number
 */
function getPositiveFloat(value) {
  const result=getFloat(value);
  if (result==null) return null;
  if (result<=0) return null;
  return result;
}

/**
 * Converts a not negative number given as a string to a floating point number.
 * @param {String} id String value to be converted to a floating point number
 * @returns Floating point number or null if the string in the input field could not be interpreted as a not negative number
 */
function getNotNegativeFloat(value) {
  const result=getFloat(value);
  if (result==null) return null;
  if (result<0) return null;
  return result;
}

/**
 * Converts a string to an integer number.
 * @param {String} value String value to be converted to an integer number
 * @returns {Number} Integer number or NaN if the string could not be interpreted as a number
 */
function parseIntStrict(value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
  return NaN;
}

/**
 * Converts a number given as a string to an integer number.
 * @param {String} id String value to be converted to an integer number
 * @returns Integer number or null if the string in the input field could not be interpreted as a number
 */
function getInt(value) {
  const num=parseIntStrict(value);
  if (isNaN(num)) return null;
  return num;
}

/**
 * Converts a positive number given as a string to an integer number.
 * @param {String} id String value to be converted to an integer number
 * @returns Integer number or null if the string in the input field could not be interpreted as a positive number
 */
function getPositiveInt(value) {
  const result=getInt(value);
  if (result==null) return null;
  if (result<=0) return null;
  return result;
}

/**
 * Converts a not negative number given as a string to an integer number.
 * @param {String} id String value to be converted to an integer number
 * @returns Integer number or null if the string in the input field could not be interpreted as a not negative number
 */
function getNotNegativeInt(value) {
  const result=getInt(value);
  if (result==null) return null;
  if (result<0) return null;
  return result;
}