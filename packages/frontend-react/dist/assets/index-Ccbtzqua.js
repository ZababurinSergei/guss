(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))i(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function d(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(e){if(e.ep)return;e.ep=!0;const t=d(e);fetch(e.href,t)}})();window.addEventListener("load",()=>{setTimeout(()=>{const r=document.getElementById("loading");r&&(r.style.display="none"),document.documentElement.classList.add("loaded"),document.documentElement.style.visibility="visible"},1e3)});window.addEventListener("error",r=>{console.error("Application loading error:",r.error);const o=document.getElementById("loading");o&&(o.innerHTML=`
            <div style="text-align: center; color: #ff6b6b;">
              <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
              <h3>Loading Error</h3>
              <p>Failed to load the application. Please refresh the page.</p>
              <button onclick="window.location.reload()" style="
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 10px;
              ">Retry</button>
            </div>
          `)});
//# sourceMappingURL=index-Ccbtzqua.js.map
