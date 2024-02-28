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

/* Language selection */

/**
 * Ensures the current location is the location for the right language.
 * @param {String} file
 */
function selectLanguageFile(file) {
  if (window.location.pathname.endsWith(file)) return;
  window.location.href='./'+file+window.location.search;
}

/**
 * Selects the language of the web app by the preferred browser language or the user selection (via local storage)
 * @param {Array} languages Object containing the language ids and the names of the web app main files per language
 */
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