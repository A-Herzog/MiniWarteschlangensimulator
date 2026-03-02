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

function loadSimResults() {
  simResults.innerHTML=localStorage.getItem("results-html");
  const text=localStorage.getItem("results-text");
  copyButton.onclick=()=>navigator.clipboard.writeText(text);
  copyButton.innerHTML=" "+language.tabAnimation.copy;
  saveButton.onclick=()=>{
    const a=document.createElement('a');
    const blob=new Blob([text], {type: 'text/plain'});
    a.href=window.URL.createObjectURL(blob); a.download=language.tabAnimation.resultsFile;
    a.click();
  };
  saveButton.innerHTML=" "+language.tabAnimation.save;
  infoColumn.innerHTML=language.statisticsInfo.infoColumn;
}
