(()=>{"use strict";class t{constructor(t,e,n,o){this.context=t,this.original=e,this.faceGraphic=n,this.dummyTranslation=o}}let e;async function n(){const t=document.getElementById("input").files[0],n=await t.text();e=JSON.parse(n),function(){if(null==e)throw new Error("trans is not loaded");let t=document.createElement("ul");Object.keys(e.project.files).forEach((n=>{const r=document.createElement("a");r.href="#",r.innerText=n,r.onclick=t=>{t.preventDefault(),function(t){if(null==e)throw new Error("trans is not loaded");let n="<table border>";n+="<tr><th>テキストID</th><th>テキスト</th><th>顔グラ情報</th><th>仮翻訳</th></tr>";for(const e of o(t))n+=`<tr><td>${e.context}</td><td>${e.original}</td><td>${e.faceGraphic}</td><td>${e.dummyTranslation}</td></tr>`;n+="</table>";const r=document.getElementById("preview");r.innerHTML=n;const l=document.createElement("button");l.innerText="TSVをダウンロード",l.onclick=()=>function(t){let e="";for(const n of o(t)){const t=n.original.replace(/"/g,'""'),o=n.dummyTranslation.replace(/"/g,'""');e+=`${n.context}\t"${t}"\t${n.faceGraphic}\t"${o}"\n`}const n=t.match(/.*\/([^\/.]+).*$/);if(null==n||n.length<2)throw new Error("failed to parse file id");const r=n[1],l=document.createElement("a"),c=new Blob([e],{type:"text/tsv"}),i=window.URL.createObjectURL(c);l.href=i,l.download=`${r}.tsv`,document.body.appendChild(l),l.click(),document.body.removeChild(l),window.URL.revokeObjectURL(i)}(t),r.insertBefore(l,r.firstChild)}(n)};const l=document.createElement("li");l.appendChild(r),t.appendChild(l)})),document.getElementById("mapList").replaceChildren(t)}()}function*o(n){if(null==e)throw new Error("trans is not loaded");const o=e.project.files[n];if(null==o)throw new Error(`${n} does not exist`);for(let e=0;e<o.data.length;++e){const n=o.data[e][0],r=o.data[e][1];if(null!=n)for(let l=0;l<o.context[e].length;++l){const c=o.context[e][l],i=o.parameters[e];let a="";null!=i&&null!=i[l]&&(a=JSON.stringify(i[l].p)),yield new t(c,n,a,r)}}}document.addEventListener("DOMContentLoaded",(()=>{document.getElementById("input").onchange=n}))})();