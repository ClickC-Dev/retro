var clientsKey="clickc_clients";var statsKey="retro_stats";var authKey="clickc_auth";var themeKey="retro_theme";var editSlug=null;
function applyTheme(t){var root=document.body;root.classList.remove("theme-light","theme-dark");root.classList.add(t==="dark"?"theme-dark":"theme-light");localStorage.setItem(themeKey,t)}
function setToggleIcon(el,t){if(!el)return;el.setAttribute('data-dark',String(t==="dark"))}
function saveAuth(v){localStorage.setItem(authKey,JSON.stringify(v))}
function getAuth(){var r=localStorage.getItem(authKey);return r?safeParse(r,{ok:false}):{ok:false}}
function login(u,p){var user=u.trim().toLowerCase();var pass=p.trim();var ok=(user==="clickc.oficial"||user==="clickc")&&pass==="MC@20032020";saveAuth({ok:ok});return ok}
function getSb(){return {url:localStorage.getItem("sb_url")||"",key:localStorage.getItem("sb_key")||"",bucket:localStorage.getItem("sb_bucket")||""}}
function setSb(u,k,b){localStorage.setItem("sb_url",u);localStorage.setItem("sb_key",k);localStorage.setItem("sb_bucket",b)}
function blobFromFileWebp(file,maxW,maxH,quality){return new Promise(function(res,rej){var img=new Image();img.onload=function(){var w=img.width;var h=img.height;var r=Math.min(maxW/w||1,maxH/h||1,1);var cw=Math.round(w*r);var ch=Math.round(h*r);var c=document.createElement("canvas");c.width=cw;c.height=ch;var g=c.getContext("2d");g.drawImage(img,0,0,cw,ch);c.toBlob(function(b){if(!b)rej(new Error("toBlob"));else res(b)},"image/webp",quality)},img.src=URL.createObjectURL(file)})}
async function sbUpload(blob,slug){var sb=getSb();if(!sb.url||!sb.key||!sb.bucket)return null;var path="logos/"+slug+".webp";var u=sb.url.replace(/\/$/,"")+"/storage/v1/object/"+encodeURIComponent(sb.bucket)+"/"+path;var r=await fetch(u,{method:"POST",headers:{Authorization:"Bearer "+sb.key,"x-upsert":"true","Content-Type":"image/webp"},body:blob});if(!r.ok)return null;var publicUrl=sb.url.replace(/\/$/,"")+"/storage/v1/object/public/"+encodeURIComponent(sb.bucket)+"/"+path;return publicUrl}
function safeParse(str,fb){try{return JSON.parse(str)}catch(_){return fb}}
function getClients(){var raw=localStorage.getItem(clientsKey);return raw?safeParse(raw,[]):[]}
function setClients(list){localStorage.setItem(clientsKey,JSON.stringify(list))}
function addClient(c){var list=getClients();var exists=list.some(function(i){return i.slug===c.slug});if(exists)return false;list.push(c);setClients(list);return true}
function findBySlug(sl){var list=getClients();for(var i=0;i<list.length;i++){if(list[i].slug===sl)return list[i]}return null}
function updateClient(oldSlug,c){var list=getClients();var idx=-1;for(var i=0;i<list.length;i++){if(list[i].slug===oldSlug){idx=i;break}}if(idx<0)return false;if(c.slug!==oldSlug){for(var j=0;j<list.length;j++){if(list[j].slug===c.slug)return false}}list[idx]=c;setClients(list);return true}
function toDataUrl(file){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result)};fr.onerror=rej;fr.readAsDataURL(file)})}
function renderList(){
  var box=document.getElementById("clientList");
  box.innerHTML="";
  var list=getClients();
  for(var i=0;i<list.length;i++){
    var it=list[i];
    var row=document.createElement("div");row.className="client-item";
    var img=document.createElement("img");img.className="logo";img.src=it.logo||"";
    var meta=document.createElement("div");meta.className="meta";
    var name=document.createElement("div");name.textContent=it.name+" • "+it.slug;
    var stats=safeParse(localStorage.getItem(statsKey)||"{}",{});
    var count=stats[it.slug]||0;
    var stat=document.createElement("div");stat.style.color="var(--muted)";stat.textContent="Visualizações: "+count;
    meta.appendChild(name);meta.appendChild(stat);
    var actions=document.createElement("div");actions.className="actions";
    var link=document.createElement("a");link.className="ghost";link.href=(location.hostname==="localhost"?"index.html#/":"https://retro.clickc.com.br/")+it.slug;link.target="_blank";link.textContent="Abrir link";
    var copy=document.createElement("button");copy.className="ghost";copy.textContent="Copiar link";copy.onclick=function(h){return function(){navigator.clipboard.writeText(h)}}(link.href);
    var edit=document.createElement("button");edit.className="ghost";edit.textContent="Editar";edit.onclick=function(sl){return function(){var cli=findBySlug(sl);if(!cli)return;document.getElementById("clientName").value=cli.name;document.getElementById("clientSlug").value=cli.slug;document.getElementById("clientColor").value=cli.color||"#6a5acd";editSlug=sl;document.getElementById("saveClient").textContent="Atualizar"}}(it.slug);
    actions.appendChild(link);actions.appendChild(copy);actions.appendChild(edit);
    row.appendChild(img);row.appendChild(meta);row.appendChild(actions);
    box.appendChild(row)
  }
}
function init(){var a=getAuth();if(a.ok){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden");renderList()}function attempt(){var u=document.getElementById("admUser").value;var p=document.getElementById("admPass").value;var ok=login(u,p);document.getElementById("loginError").classList.toggle("hidden",ok);if(ok){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden")}}
  document.getElementById("loginBtn").addEventListener("click",attempt);
  document.getElementById("admUser").addEventListener("keydown",function(e){if(e.key==="Enter")attempt()});
  document.getElementById("admPass").addEventListener("keydown",function(e){if(e.key==="Enter")attempt()});
  var sb=getSb();var sbUrlEl=document.getElementById("sbUrl");var sbKeyEl=document.getElementById("sbKey");var sbBucketEl=document.getElementById("sbBucket");if(sbUrlEl)sbUrlEl.value=sb.url;if(sbKeyEl)sbKeyEl.value=sb.key;if(sbBucketEl)sbBucketEl.value=sb.bucket;var sbBtn=document.getElementById("saveSb");if(sbBtn)sbBtn.addEventListener("click",function(){setSb(sbUrlEl.value.trim(),sbKeyEl.value.trim(),sbBucketEl.value.trim());document.getElementById("sbMsg").classList.remove("hidden")});
  document.getElementById("saveClient").addEventListener("click",async function(){var name=document.getElementById("clientName").value.trim();var slug=document.getElementById("clientSlug").value.trim().toLowerCase();var color=document.getElementById("clientColor").value;var file=document.getElementById("clientLogo").files[0];var logo=null;try{if(file){var blob=await blobFromFileWebp(file,1200,1200,.82);logo=await sbUpload(blob,slug);if(!logo)logo=await toDataUrl(file)}}catch(_){if(file)logo=await toDataUrl(file)}if(!name||!slug){return}var msg=document.getElementById("saveMsg");var ok=false;if(editSlug){var prev=findBySlug(editSlug);if(!logo&&prev)logo=prev.logo;ok=updateClient(editSlug,{name:name,slug:slug,color:color,logo:logo});msg.textContent=ok?"Cliente atualizado":"Slug já existe";if(ok){editSlug=null;document.getElementById("saveClient").textContent="Salvar"}}else{ok=addClient({name:name,slug:slug,color:color,logo:logo});msg.textContent=ok?"Cliente salvo":"Slug já existe"}msg.classList.toggle("hidden",!ok);renderList()})
}
document.addEventListener("DOMContentLoaded",function(){var t=localStorage.getItem(themeKey)||"light";applyTheme(t);var tg=document.getElementById("themeToggle");setToggleIcon(tg,t);if(tg){tg.onclick=function(){t=t==="dark"?"light":"dark";applyTheme(t);setToggleIcon(tg,t)}}
  (function preloadSb(){try{var has=localStorage.getItem("sb_url");if(!has){fetch("sb-config.json").then(function(r){return r.ok?r.json():null}).then(function(cfg){if(!cfg)return;setSb(cfg.url||"",cfg.anon_key||"",cfg.bucket||"imagens");var sb=getSb();var sbUrlEl=document.getElementById("sbUrl");var sbKeyEl=document.getElementById("sbKey");var sbBucketEl=document.getElementById("sbBucket");if(sbUrlEl)sbUrlEl.value=sb.url;if(sbKeyEl)sbKeyEl.value=sb.key;if(sbBucketEl)sbBucketEl.value=sb.bucket}).catch(function(){})}}catch(_){}})();
  init()
});
