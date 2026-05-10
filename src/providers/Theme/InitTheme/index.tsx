'use client'

import { useServerInsertedHTML } from 'next/navigation'

import { defaultTheme, themeLocalStorageKey } from '../ThemeSelector/types'

export const InitTheme: React.FC = () => {
  useServerInsertedHTML(() => (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `(function(){
  function getImplicitPreference(){
    var mql=window.matchMedia('(prefers-color-scheme: dark)');
    if(typeof mql.matches==='boolean') return mql.matches?'dark':'light';
    return null;
  }
  function themeIsValid(t){ return t==='light'||t==='dark'; }
  var t='${defaultTheme}';
  var p=window.localStorage.getItem('${themeLocalStorageKey}');
  if(themeIsValid(p)){ t=p; }
  else{ var i=getImplicitPreference(); if(i) t=i; }
  document.documentElement.setAttribute('data-theme',t);
})();`,
      }}
    />
  ))
  return null
}
