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

/* Sprachauswahl */

function selectLanguageFile(file) {
  if (window.location.href.endsWith(file)) return;
  window.location.href='./'+file;
}

function selectLanguage(languages) {
  let selectedLanguage=localStorage.getItem('selectedLanguage');

  if (selectedLanguage==null) {
    const userLang=(navigator.language || navigator.userLanguage).toLocaleLowerCase();
    let preferredFile=languages.find(language=>language.name=='default').file;
    for (let language of languages) if (userLang.startsWith(language.name)) {preferredFile=language.file; break;}
    selectLanguageFile(preferredFile);
  } else {
    selectLanguageFile(languages.find(language=>language.name==selectedLanguage).file);
  }
}

/* Umgang mit Zahlen */

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