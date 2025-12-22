var clientsKey="clickc_clients";var statsKey="retro_stats";var authKey="clickc_auth";var themeKey="retro_theme";var editSlug=null;
console.log("admin.js carregado");
function applyTheme(t){var root=document.body;root.classList.remove("theme-light","theme-dark");root.classList.add("theme-light");localStorage.setItem(themeKey,"light")}
function setToggleIcon(el,t){if(!el)return;el.setAttribute('data-dark',String(t==="dark"))}
function saveAuth(v){localStorage.setItem(authKey,JSON.stringify(v))}
function getAuth(){var r=localStorage.getItem(authKey);return r?safeParse(r,{ok:false}):{ok:false}}
function login(u,p){var user=u.trim().toLowerCase();var pass=p.trim();var ok=(user==="ola.clickc@gmail.com".toLowerCase())&&pass==="MC@0818";saveAuth({ok:ok});return ok}
function getSb(){return {url:localStorage.getItem("sb_url")||"",key:localStorage.getItem("sb_key")||"",bucket:localStorage.getItem("sb_bucket")||""}}
function setSb(u,k,b){localStorage.setItem("sb_url",u);localStorage.setItem("sb_key",k);localStorage.setItem("sb_bucket",b)}
function blobFromFileWebp(file,maxW,maxH,quality){return new Promise(function(res,rej){var img=new Image();img.onload=function(){var w=img.width;var h=img.height;var r=Math.min(maxW/w||1,maxH/h||1,1);var cw=Math.round(w*r);var ch=Math.round(h*r);var c=document.createElement("canvas");c.width=cw;c.height=ch;var g=c.getContext("2d");g.drawImage(img,0,0,cw,ch);c.toBlob(function(b){if(!b)rej(new Error("toBlob"));else res(b)},"image/webp",quality)};img.src=URL.createObjectURL(file)})}
function dataUrlToBlob(url){var parts=url.split(",");var mime=(parts[0].match(/data:(.*?);/)||[])[1]||"application/octet-stream";var bstr=atob(parts[1]||"");var n=bstr.length;var u8=new Uint8Array(n);for(var i=0;i<n;i++)u8[i]=bstr.charCodeAt(i);return new Blob([u8],{type:mime})}
async function sbUpload(blob,slug){var sb=getSb();if(!sb.url||!sb.key||!sb.bucket)return null;var path="logos/"+slug+".webp";var u=sb.url.replace(/\/$/,"")+"/storage/v1/object/"+encodeURIComponent(sb.bucket)+"/"+path;var r=await fetch(u,{method:"POST",headers:{Authorization:"Bearer "+sb.key,"x-upsert":"true","Content-Type":"image/webp"},body:blob});if(!r.ok)return null;var publicUrl=sb.url.replace(/\/$/,"")+"/storage/v1/object/public/"+encodeURIComponent(sb.bucket)+"/"+path;return publicUrl}
async function sbUploadJson(obj,slug){var sb=getSb();if(!sb.url||!sb.key||!sb.bucket)return {ok:false,status:0};var path="logos/"+slug+".json";var u=sb.url.replace(/\/$/,"")+"/storage/v1/object/"+encodeURIComponent(sb.bucket)+"/"+path;var r=await fetch(u,{method:"POST",headers:{Authorization:"Bearer "+sb.key,"x-upsert":"true","Content-Type":"application/json"},body:JSON.stringify(obj)});return {ok:r.ok,status:r.status}}
function publicUrl(path){var sb=getSb();if(!sb.url||!sb.bucket)return "";return sb.url.replace(/\/$/,"")+"/storage/v1/object/public/"+encodeURIComponent(sb.bucket)+"/"+path}
async function checkPublic(slug){var jsonUrl=publicUrl("logos/"+slug+".json");var logoUrl=publicUrl("logos/"+slug+".webp");var okJson=false, okLogo=false, statusJson=0, statusLogo=0;try{var rj=await fetch(jsonUrl,{method:"GET"});statusJson=rj.status;okJson=rj.ok}catch(_){okJson=false}
  try{var rl=await fetch(logoUrl,{method:"GET"});statusLogo=rl.status;okLogo=rl.ok}catch(_){okLogo=false}
  var it=findBySlug(slug);if(it){if(okJson){it.synced=true;it.sync_error=""}else{it.synced=false;it.sync_error="Metadados não públicos (HTTP "+statusJson+")"}updateClient(slug,it)}
  var msg=document.getElementById("syncMsg");if(msg){if(okJson){msg.className="alert success";msg.textContent="✔ Publicado: "+jsonUrl}else{msg.className="alert error";msg.textContent="⚠ Metadados não acessíveis (HTTP "+statusJson+")"}msg.classList.remove("hidden")}
  return {okJson:okJson, okLogo:okLogo, statusJson:statusJson, statusLogo:statusLogo}
function safeParse(str,fb){try{return JSON.parse(str)}catch(_){return fb}}
function getClients(){var raw=localStorage.getItem(clientsKey);return raw?safeParse(raw,[]):[]}
function setClients(list){localStorage.setItem(clientsKey,JSON.stringify(list))}
function addClient(c){var list=getClients();var exists=list.some(function(i){return i.slug===c.slug});if(exists)return false;var item={name:c.name,slug:c.slug,color:c.color,logo:c.logo,active:true,synced:!!c.synced,sync_error:c.sync_error||""};list.push(item);setClients(list);return true}
function findBySlug(sl){var list=getClients();for(var i=0;i<list.length;i++){if(list[i].slug===sl)return list[i]}return null}
function updateClient(oldSlug,c){var list=getClients();var idx=-1;for(var i=0;i<list.length;i++){if(list[i].slug===oldSlug){idx=i;break}}if(idx<0)return false;if(c.slug!==oldSlug){for(var j=0;j<list.length;j++){if(list[j].slug===c.slug)return false}}var prev=list[idx];var next={name:c.name,slug:c.slug,color:c.color,logo:(c.logo||prev.logo),active:(typeof c.active==="boolean"?c.active:(typeof prev.active==="boolean"?prev.active:true)),synced:(typeof c.synced==="boolean"?c.synced:(typeof prev.synced==="boolean"?prev.synced:false)),sync_error:(typeof c.sync_error==="string"?c.sync_error:(prev.sync_error||""))};list[idx]=next;setClients(list);return true}
function deleteClient(sl){var list=getClients();var next=list.filter(function(i){return i.slug!==sl});var changed=next.length!==list.length;if(changed)setClients(next);return changed}
function toggleActive(sl){var list=getClients();var changed=false;for(var i=0;i<list.length;i++){if(list[i].slug===sl){var cur=list[i].active;list[i].active=!cur;changed=true;break}}if(changed)setClients(list);return changed}
function toDataUrl(file){return new Promise(function(res,rej){var fr=new FileReader();fr.onload=function(){res(fr.result)};fr.onerror=rej;fr.readAsDataURL(file)})}
function renderList(){
  var box=document.getElementById("clientList");
  box.innerHTML="";
  var list=getClients();
  var qEl=document.getElementById("clientSearch");
  var q=qEl?String(qEl.value||"").trim().toLowerCase():"";
  if(q){list=list.filter(function(i){var n=(i.name||"").toLowerCase();var s=(i.slug||"").toLowerCase();return n.indexOf(q)>=0||s.indexOf(q)>=0})}
  for(var i=0;i<list.length;i++){
    var it=list[i];
    var row=document.createElement("div");row.className="client-item";
    var img=document.createElement("img");img.className="logo";img.src=it.logo||"";
    var meta=document.createElement("div");meta.className="meta";
    var name=document.createElement("div");name.textContent=it.name+" • "+it.slug;
    var status=document.createElement("div");status.className="status";
    if(it.synced){var ok=document.createElement("span");ok.className="status-ok";ok.textContent="✔";status.appendChild(ok)}else if(it.sync_error){var er=document.createElement("span");er.className="status-err";er.textContent="⚠";status.appendChild(er)}
    var stats=safeParse(localStorage.getItem(statsKey)||"{}",{});
    var count=stats[it.slug]||0;
    var stat=document.createElement("div");stat.style.color="var(--muted)";stat.textContent="Visualizações: "+count;
    meta.appendChild(name);meta.appendChild(status);if(it.active===false){var badge=document.createElement("span");badge.className="badge";badge.textContent="Desativado";meta.appendChild(badge)}meta.appendChild(stat);
    if(it.synced){status.title="Sincronizado"}else if(it.sync_error){status.title=it.sync_error}
    var actions=document.createElement("div");actions.className="actions";
    var kebab=document.createElement("button");kebab.className="kebab";kebab.textContent="⋯";kebab.setAttribute("aria-label","Opções");
    var menu=document.createElement("div");menu.className="menu hidden";
    function addItem(text,fn,disabled,kind){var b=document.createElement("button");b.className="menu-item";if(kind==="danger")b.classList.add("danger");b.textContent=text;if(disabled){b.classList.add("disabled")}else{b.onclick=fn}menu.appendChild(b)}
    var href=(location.hostname==="localhost"?"index.html#/":"https://retro.clickc.com.br/")+it.slug;
    addItem("Abrir link",function(){window.open(href,"_blank")},it.active===false);
    addItem("Copiar link",function(){navigator.clipboard.writeText(href)},it.active===false);
    addItem("Verificar publicação",function(){checkPublic(it.slug)},false);
    addItem("Editar",function(){var cli=findBySlug(it.slug);if(!cli)return;document.getElementById("clientName").value=cli.name;document.getElementById("clientSlug").value=cli.slug;document.getElementById("clientColor").value=cli.color||"#6a5acd";editSlug=it.slug;document.getElementById("saveClient").textContent="Atualizar"},false);
    addItem((it.active===false?"Ativar":"Desativar"),function(){toggleActive(it.slug);renderList()},false);
    addItem("Excluir",function(){var ok=true;try{ok=confirm("Excluir "+it.slug+"?")}catch(_){}if(!ok)return;deleteClient(it.slug);renderList()},false,"danger");
    kebab.onclick=function(e){try{document.querySelectorAll(".menu").forEach(function(m){if(m!==menu)m.classList.add("hidden")})}catch(_){var all=document.querySelectorAll(".menu");for(var i2=0;i2<all.length;i2++){var m2=all[i2];if(m2!==menu)m2.classList.add("hidden")}}
      menu.classList.toggle("hidden");e.stopPropagation()};
    actions.appendChild(kebab);actions.appendChild(menu);
    row.appendChild(img);row.appendChild(meta);row.appendChild(actions);
    box.appendChild(row)
  }
}
function attempt(){var u=document.getElementById("admUser").value;var p=document.getElementById("admPass").value;console.log("attempt()",u,p);var ok=login(u,p);document.getElementById("loginError").classList.toggle("hidden",ok);if(ok){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden");renderList()}}
var init=function(){console.log("init()");var a=getAuth();if(a.ok){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden");renderList()}
  var loginBtn=document.getElementById("loginBtn");if(loginBtn)loginBtn.addEventListener("click",attempt);
  var admUser=document.getElementById("admUser");if(admUser)admUser.addEventListener("keydown",function(e){if(e.key==="Enter")attempt()});
  var admPass=document.getElementById("admPass");if(admPass)admPass.addEventListener("keydown",function(e){if(e.key==="Enter")attempt()});
  var openSb=function(){var sb=getSb();var m=document.getElementById("sbModal");var sbUrlEl=document.getElementById("sbUrl");var sbKeyEl=document.getElementById("sbKey");var sbBucketEl=document.getElementById("sbBucket");if(sbUrlEl)sbUrlEl.value=sb.url;if(sbKeyEl)sbKeyEl.value=sb.key;if(sbBucketEl)sbBucketEl.value=sb.bucket;m.classList.remove("hidden")};
  var closeSb=function(){var m=document.getElementById("sbModal");m.classList.add("hidden")};
  var gear=document.getElementById("sbBtn");if(gear)gear.addEventListener("click",function(){console.log("openSb");openSb()});
  var sbClose=document.getElementById("sbClose");if(sbClose)sbClose.addEventListener("click",closeSb);
  var sbBackdrop=document.querySelector("#sbModal .modal-backdrop");if(sbBackdrop)sbBackdrop.addEventListener("click",closeSb);
  var save=document.getElementById("saveSb");if(save)save.addEventListener("click",function(){console.log("saveSb");var sbUrlEl=document.getElementById("sbUrl");var sbKeyEl=document.getElementById("sbKey");var sbBucketEl=document.getElementById("sbBucket");setSb(sbUrlEl.value.trim(),sbKeyEl.value.trim(),sbBucketEl.value.trim());document.getElementById("sbMsg").classList.remove("hidden")});
  var search=document.getElementById("clientSearch");if(search)search.addEventListener("input",renderList);
  var sync=document.getElementById("syncSb");if(sync)sync.addEventListener("click",async function(){console.log("syncSb");var sb=getSb();var msg=document.getElementById("syncMsg");if(!sb.url||!sb.key||!sb.bucket){if(msg){msg.className="alert error";msg.textContent="⚠ Configure o Supabase (URL, Anon Key e Bucket)";msg.classList.remove("hidden")}try{var gear=document.getElementById("sbBtn");if(gear)gear.click()}catch(_){}return}
    var list=getClients();var okCount=0;var errCount=0;var errSlugs=[];for(var i=0;i<list.length;i++){var it=list[i];try{var logo=it.logo||"";if(logo && logo.indexOf("data:")===0){var blob=dataUrlToBlob(logo);var up=await sbUpload(blob,it.slug);if(up){it.logo=up}else{it.sync_error="Falha ao enviar logo"}}
      var meta={name:it.name,slug:it.slug,color:it.color,logo:(it.logo||"")};var res=await sbUploadJson(meta,it.slug);if(res.ok){it.synced=true;it.sync_error="";okCount++}else{it.synced=false;it.sync_error="Falha ao publicar metadados (HTTP "+res.status+")";errCount++;errSlugs.push(it.slug)}updateClient(it.slug,it)}catch(e){it.synced=false;it.sync_error="Erro de rede";updateClient(it.slug,it);errCount++;errSlugs.push(it.slug)}}renderList();if(msg){if(errCount>0){msg.className="alert error";msg.textContent="⚠ "+errCount+" com erro ("+errSlugs.join(", ")+"), "+okCount+" sincronizados";msg.classList.remove("hidden")}else{msg.className="alert success";msg.textContent="✔ "+okCount+" sincronizados";msg.classList.remove("hidden")}}});
  document.getElementById("saveClient").addEventListener("click",async function(){console.log("saveClient");var name=document.getElementById("clientName").value.trim();var slug=document.getElementById("clientSlug").value.trim().toLowerCase();var color=document.getElementById("clientColor").value;var file=document.getElementById("clientLogo").files[0];var logo=null;var msg=document.getElementById("saveMsg");if(!name||!slug){if(msg){msg.textContent="Preencha nome e slug";msg.classList.remove("hidden")}return}try{if(file){var blob=await blobFromFileWebp(file,1200,1200,.82);logo=await sbUpload(blob,slug);if(!logo)logo=await toDataUrl(file)}}catch(_){if(file)logo=await toDataUrl(file)}var ok=false;if(editSlug){var prev=findBySlug(editSlug);if(!logo&&prev)logo=prev.logo;ok=updateClient(editSlug,{name:name,slug:slug,color:color,logo:logo});msg.textContent=ok?"Cliente atualizado":"Slug já existe";if(ok){editSlug=null;document.getElementById("saveClient").textContent="Salvar"}}else{ok=addClient({name:name,slug:slug,color:color,logo:logo});msg.textContent=ok?"Cliente salvo":"Slug já existe"}msg.classList.toggle("hidden",!ok);renderList();
    try{var sb=getSb();if(sb.url&&sb.key&&sb.bucket){var meta={name:name,slug:slug,color:color,logo:(logo||"")};var res=await sbUploadJson(meta,slug);if(res.ok){updateClient(slug,{name:name,slug:slug,color:color,logo:logo,synced:true,sync_error:""})}else{updateClient(slug,{name:name,slug:slug,color:color,logo:logo,synced:false,sync_error:"Falha ao publicar metadados (HTTP "+res.status+")"});var m=document.getElementById("syncMsg");if(m){m.className="alert error";m.textContent="⚠ Falha ao publicar metadados para "+slug}}}}catch(_){var m=document.getElementById("syncMsg");if(m){m.className="alert error";m.textContent="⚠ Erro de rede ao publicar "+slug}}}
  );
}
function preloadSb(){try{var has=localStorage.getItem("sb_url");if(!has){fetch("sb-config.json").then(function(r){return r.ok?r.json():null}).then(function(cfg){if(!cfg)return;setSb(cfg.url||"",cfg.anon_key||"",cfg.bucket||"imagens");var sb=getSb();var sbUrlEl=document.getElementById("sbUrl");var sbKeyEl=document.getElementById("sbKey");var sbBucketEl=document.getElementById("sbBucket");if(sbUrlEl)sbUrlEl.value=sb.url;if(sbKeyEl)sbKeyEl.value=sb.key;if(sbBucketEl)sbBucketEl.value=sb.bucket}).catch(function(){})}}catch(_){}} 
if(document.readyState!=="loading"){applyTheme("light");preloadSb();document.addEventListener("click",function(e){var tgt=e.target;if(tgt && (tgt.classList && tgt.classList.contains("kebab")))return;try{document.querySelectorAll(".menu").forEach(function(m){m.classList.add("hidden")})}catch(_){var all=document.querySelectorAll(".menu");for(var i=0;i<all.length;i++){all[i].classList.add("hidden")}}});init()}else{document.addEventListener("DOMContentLoaded",function(){applyTheme("light");preloadSb();document.addEventListener("click",function(e){var tgt=e.target;if(tgt && (tgt.classList && tgt.classList.contains("kebab")))return;try{document.querySelectorAll(".menu").forEach(function(m){m.classList.add("hidden")})}catch(_){var all=document.querySelectorAll(".menu");for(var i=0;i<all.length;i++){all[i].classList.add("hidden")}}});init()})}
