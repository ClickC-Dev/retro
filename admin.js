var clientsKey="clickc_clients";var statsKey="retro_stats";var authKey="clickc_auth";var themeKey="retro_theme";var editSlug=null;
function applyTheme(t){var root=document.body;root.classList.remove("theme-light","theme-dark");root.classList.add(t==="dark"?"theme-dark":"theme-light");localStorage.setItem(themeKey,t)}
function setToggleIcon(el,t){if(!el)return;el.textContent=t==="dark"?"🌙":"☀️"}
function saveAuth(v){localStorage.setItem(authKey,JSON.stringify(v))}
function getAuth(){var r=localStorage.getItem(authKey);return r?JSON.parse(r):{ok:false}}
function login(u,p){var ok=u.trim().toLowerCase()==="clickc"&&p.trim().length>=4;saveAuth({ok:ok});return ok}
function getClients(){var raw=localStorage.getItem(clientsKey);return raw?JSON.parse(raw):[]}
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
    var stats=JSON.parse(localStorage.getItem(statsKey)||"{}");
    var count=stats[it.slug]||0;
    var stat=document.createElement("div");stat.style.color="var(--muted)";stat.textContent="Visualizações: "+count;
    meta.appendChild(name);meta.appendChild(stat);
    var actions=document.createElement("div");actions.className="actions";
    var link=document.createElement("a");link.className="ghost";link.href="index.html#/"+it.slug;link.target="_blank";link.textContent="Abrir link";
    var copy=document.createElement("button");copy.className="ghost";copy.textContent="Copiar link";copy.onclick=function(h){return function(){navigator.clipboard.writeText(h)}}(link.href);
    var edit=document.createElement("button");edit.className="ghost";edit.textContent="Editar";edit.onclick=function(sl){return function(){var cli=findBySlug(sl);if(!cli)return;document.getElementById("clientName").value=cli.name;document.getElementById("clientSlug").value=cli.slug;document.getElementById("clientColor").value=cli.color||"#6a5acd";editSlug=sl;document.getElementById("saveClient").textContent="Atualizar"}}(it.slug);
    actions.appendChild(link);actions.appendChild(copy);actions.appendChild(edit);
    row.appendChild(img);row.appendChild(meta);row.appendChild(actions);
    box.appendChild(row)
  }
}
function init(){var a=getAuth();if(a.ok){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden");renderList()}document.getElementById("loginBtn").addEventListener("click",function(){var u=document.getElementById("admUser").value;var p=document.getElementById("admPass").value;var ok=login(u,p);document.getElementById("loginError").classList.toggle("hidden",ok);if(ok){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden")}});
  document.getElementById("saveClient").addEventListener("click",async function(){var name=document.getElementById("clientName").value.trim();var slug=document.getElementById("clientSlug").value.trim().toLowerCase();var color=document.getElementById("clientColor").value;var file=document.getElementById("clientLogo").files[0];var logo=null;if(file){logo=await toDataUrl(file)}if(!name||!slug){return}var msg=document.getElementById("saveMsg");var ok=false;if(editSlug){var prev=findBySlug(editSlug);if(!logo&&prev)logo=prev.logo;ok=updateClient(editSlug,{name:name,slug:slug,color:color,logo:logo});msg.textContent=ok?"Cliente atualizado":"Slug já existe";if(ok){editSlug=null;document.getElementById("saveClient").textContent="Salvar"}}else{ok=addClient({name:name,slug:slug,color:color,logo:logo});msg.textContent=ok?"Cliente salvo":"Slug já existe"}msg.classList.toggle("hidden",!ok);renderList()})}
document.addEventListener("DOMContentLoaded",function(){var t=localStorage.getItem(themeKey)||"light";applyTheme(t);var tg=document.getElementById("themeToggle");setToggleIcon(tg,t);if(tg){tg.onclick=function(){t=t==="dark"?"light":"dark";applyTheme(t);setToggleIcon(tg,t)}}init()});
