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
    if (isDesktopApp) Neutralino.init();

function parseFloatStrict(value) {
  if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) return Number(value);
  return NaN;
}

function getFloat(value) {
  if (typeof(value)=='string') value=value.replace(',','.');
  const num=parseFloatStrict(value);
  if (isNaN(num)) return null;
  return num;
}

function getPositiveFloat(value) {
  const result=getFloat(value);
  if (result==null) return null;
  if (result<=0) return null;
  return result;
}

function getNotNegativeFloat(value) {
  const result=getFloat(value);
  if (result==null) return null;
  if (result<0) return null;
  return result;
}

function parseIntStrict(value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
  return NaN;
}

function getInt(value) {
  const num=parseIntStrict(value);
  if (isNaN(num)) return null;
  return num;
}

function getPositiveInt(value) {
  const result=getInt(value);
  if (result==null) return null;
  if (result<=0) return null;
  return result;
}

function getNotNegativeInt(value) {
  const result=getInt(value);
  if (result==null) return null;
  if (result<0) return null;
  return result;
}