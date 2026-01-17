var tabs = [];
var activeTab = null;

function injectBaseTarget(iframe) {
  try {
    const doc = iframe.contentDocument;
    if (!doc || !doc.head) return;
    let base = doc.querySelector("base");
    if (!base) {
      base = doc.createElement("base");
      doc.head.appendChild(base);
    }
    base.target = iframe.name;
  } catch (e) {}
}

function openTab(url) {
  var iframe = document.createElement("iframe");
  iframe.name = "browserframe_" + tabs.length;
  iframe.src = url;
  iframe.style.display = "none";

  iframe.onload = function () {
    injectBaseTarget(iframe);
    updateTabTitle(tabs[tabs.length - 1]);
    updateUrlInput(activeTab);
    fetchFavicon(url).then(function (iconUrl) {
      if (iconUrl) {
        activeTab.tab.querySelector(".tab-icon").src =
          "https://www.google.com/s2/favicons?sz=64&domain=" +
          decode(decodeURIComponent(iconUrl.split("/@/")[1])).replace(
            /^https?:\/\//,
            ""
          );
      } else {
        activeTab.tab.querySelector(".tab-icon").src =
          "https://www.google.com/s2/favicons?sz=64&domain=e";
      }
    });
  };

  document.querySelector(".browser-window").appendChild(iframe);

  var tab = document.createElement("div");
  tab.classList.add("tab");

  var tabIcon = document.createElement("img");
  tabIcon.classList.add("tab-icon");
  tabIcon.src = "https://www.google.com/s2/favicons?sz=64&domain=e";

  var tabTitle = document.createElement("span");
  tabTitle.classList.add("tab-title");
  tabTitle.textContent = "Blank Page";

  var tabClose = document.createElement("span");
  tabClose.classList.add("tab-close");
  tabClose.textContent = "×";

  tab.appendChild(tabIcon);
  tab.appendChild(tabTitle);
  tab.appendChild(tabClose);

  tab.addEventListener("click", function (event) {
    if (event.target.classList.contains("tab-close")) {
      closeTab(tab);
    } else {
      switchTab(tab);
    }
  });

  document.querySelector(".tab-bar").appendChild(tab);

  tabs.push({ tab, iframe });
  switchTab(tab);
}

function closeTab(tab) {
  var index = tabs.findIndex(t => t.tab === tab);
  if (index === -1) return;

  var tabObj = tabs[index];
  tabObj.iframe.remove();
  tab.remove();
  tabs.splice(index, 1);

  if (activeTab && activeTab.tab === tab) {
    if (tabs.length > 0) {
      switchTab(tabs[Math.max(index - 1, 0)].tab);
    } else {
      activeTab = null;
      updateUrlInput();
    }
  }
}

function switchTab(tab) {
  if (activeTab) {
    activeTab.tab.classList.remove("active");
    activeTab.iframe.style.display = "none";
  }

  activeTab = tabs.find(t => t.tab === tab);
  activeTab.tab.classList.add("active");
  activeTab.iframe.style.display = "block";
  updateUrlInput(activeTab);

  activeTab.iframe.onload = function () {
    injectBaseTarget(activeTab.iframe);
    updateTabTitle(activeTab);
    updateUrlInput(activeTab);
  };
}

function updateTabTitle(tabObj) {
  try {
    tabObj.tab.querySelector(".tab-title").textContent =
      tabObj.iframe.contentDocument.title || "New Tab";
  } catch (e) {}
}

function updateUrlInput(tabObj) {
  var urlInput = document.querySelector(".url-input");
  if (!tabObj) {
    urlInput.value = "";
    urlInput.setAttribute("readonly", true);
    return;
  }

  let url = tabObj.iframe.src.split("/@/")[1];
  const decodedPath = decode(decodeURIComponent(url || "")).replace(
    /^https?:\/\//,
    ""
  );
  urlInput.value = decodedPath !== "uldgfkngd" ? decodedPath : "";
  urlInput.removeAttribute("readonly");
}

function fetchFavicon(url) {
  return new Promise(resolve => {
    var faviconUrl =
      "https://www.google.com/s2/favicons?sz=64&domain=" + url;
    var img = new Image();
    img.onload = () => resolve(faviconUrl);
    img.onerror = () => resolve(null);
    img.src = faviconUrl;
  });
}

document.querySelector(".url-input").addEventListener("keyup", function (e) {
  if (e.keyCode !== 13 || !activeTab) return;

  let url = this.value;
  let isUrl = url.includes(".");

  if (!url.startsWith("http")) url = "http://" + url;

  if (!isUrl) {
    url = "https://duckduckgo.com/?q=" + encodeURIComponent(this.value);
  }

  navigator.serviceWorker
    .register("/szvy/sw.js", { scope: __uv$config.prefix })
    .then(() => {
      activeTab.iframe.src =
        __uv$config.prefix + __uv$config.encodeUrl(url);
    });
});

document.querySelector(".new-tab-button").addEventListener("click", () => {
  openTab("home.html");
});

document.getElementById("backButton").addEventListener("click", () => {
  if (activeTab) activeTab.iframe.contentWindow.history.back();
});

document.getElementById("forwardButton").addEventListener("click", () => {
  if (activeTab) activeTab.iframe.contentWindow.history.forward();
});

document.getElementById("reloadButton").addEventListener("click", () => {
  if (activeTab) activeTab.iframe.contentWindow.location.reload();
});

function decode(str) {
  if (!str) return str;
  return str
    .split("")
    .map((c, i) => (i % 2 ? String.fromCharCode(c.charCodeAt() ^ 2) : c))
    .join("");
}

const urlParams = new URLSearchParams(window.location.search);
const encodedUrl = urlParams.get("u");
openTab(encodedUrl || "home.html");
