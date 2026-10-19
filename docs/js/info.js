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

import {language} from './Language.js';
import {isDesktopApp} from "./Tools.js";

let selectedColorMode=localStorage.getItem('selectedColorMode');
if (selectedColorMode==null) selectedColorMode=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?"dark":"light";
document.documentElement.dataset.bsTheme=selectedColorMode;

closeButton.innerHTML=" "+language.dialog.CloseWindow;
closeButton.onclick=()=>{
  localStorage.removeItem("results-html");
  localStorage.removeItem("results-text");
  if (isDesktopApp) Neutralino.window.hide(); else window.close();
};

const pages={
  "qt": {file: "info_qt", parent: "content"},
  "glossary" : {file: "info_glossary", parent: "content"},
  "tutorial": {file: "info_tutorial", parent: "content"},
  "results": {file: "info_results", parent: "main", load: loadSimResults, allLanguage: true}
};

const id=window.location.search;
if (id.startsWith('?')) {
  const page=pages[id.substring(1)];
  if (typeof(page)!='undefined') {
    const nameAddon=(page.allLanguage)?"":('_'+document.documentElement.lang);
    fetch('./js/'+page.file+nameAddon+'.html').then(response=>response.text().then(text=>{
      if (page.parent=='content') {
        content.innerHTML=text;
        if (isDesktopApp) for (let link of document.querySelectorAll("a")) {
          const href=link.href;
          link.onclick=()=>{Neutralino.os.open(href); return false;}
        }
      }
      if (page.parent=='main') {
          document.getElementsByTagName("main")[0].innerHTML=text;
          page.load();
      }
    }));
  }
}

/**
 * Downloads some string as a file.
 * @param {String} content Content for the file download
 * @param {String} filename Destination file name
 */
function downloadText(content, filename) {
  const a=document.createElement('a');
  const blob=new Blob([content], {type: 'text/plain'});
  a.href=window.URL.createObjectURL(blob);
  a.download=filename;
  a.click();
}

function loadSimResults() {
  simResults.innerHTML=localStorage.getItem("results-html");

  const textShort=localStorage.getItem("results-short");
  const textDetails=localStorage.getItem("results-text");
  const textTable=localStorage.getItem("results-table");

  copyButton.innerHTML=" "+language.tabAnimation.copy;
  copyButton1.innerHTML=language.tabAnimation.exportCopyShort;
  copyButton1.onclick=()=>navigator.clipboard.writeText(textShort);
  copyButton2.innerHTML=language.tabAnimation.exportCopyLong;
  copyButton2.onclick=()=>navigator.clipboard.writeText(textDetails);
  copyButton3.innerHTML=language.tabAnimation.exportCopyTable;
  copyButton3.onclick=()=>navigator.clipboard.writeText(textTable);

  saveButton.innerHTML=" "+language.tabAnimation.save;
  saveButton1.innerHTML=language.tabAnimation.exportSaveShort;
  saveButton1.onclick=()=>downloadText(textShort,language.tabAnimation.resultsFile);
  saveButton2.innerHTML=language.tabAnimation.exportSaveLong;
  saveButton2.onclick=()=>downloadText(textDetails,language.tabAnimation.resultsFile);
  saveButton3.innerHTML=language.tabAnimation.exportSaveTable;
  saveButton3.onclick=()=>downloadText(textTable,language.tabAnimation.resultsFile);

  infoColumn.innerHTML=language.statisticsInfo.infoColumn;
}
