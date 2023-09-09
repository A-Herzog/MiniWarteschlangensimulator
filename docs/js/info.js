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
closeButton.onclick=()=>{if (isDesktopApp) Neutralino.window.hide(); else window.close();};

const pages={
  "qt": "info_qt",
  "glossary" : "info_glossary"
};

const id=window.location.search;
if (id.startsWith('?')) {
  const page=pages[id.substring(1)];
  if (typeof(page)!='undefined') fetch('./js/'+page+'_'+document.documentElement.lang+'.html').then(response=>response.text().then(text=>{
    content.innerHTML=text;
    if (isDesktopApp) for (let link of document.querySelectorAll("a")) {
      const href=link.href;
      link.onclick=()=>{Neutralino.os.open(href); return false;}
    }
  }));
}