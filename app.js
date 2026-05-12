document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEYS = { posts: "autopub_posts", connections: "autopub_connections" };
  const defaultConnections = { facebook: false, instagram: false, linkedin: false };

  let posts = JSON.parse(localStorage.getItem(STORAGE_KEYS.posts)) || [];
  let connections = JSON.parse(localStorage.getItem(STORAGE_KEYS.connections)) || defaultConnections;
  let editId = null;

  const form = document.getElementById("scheduleForm");
  const postsList = document.getElementById("postsList");
  const emptyState = document.getElementById("emptyState");
  const scheduledCount = document.getElementById("scheduledCount");
  const statusEls = {
    facebook: document.getElementById("facebookStatus"),
    instagram: document.getElementById("instagramStatus"),
    linkedin: document.getElementById("linkedinStatus")
  };

  function saveState() {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
    localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections));
  }

  function updateConnectionUI() {
    Object.keys(statusEls).forEach(plat => {
      const isConnected = connections[plat];
      statusEls[plat].textContent = isConnected ? "Connecté" : "Non connecté";
      statusEls[plat].className = `status ${isConnected ? "on" : "off"}`;
      const btn = document.querySelector(`[data-platform="${plat}"]`);
      if(btn) {
        btn.textContent = isConnected ? "Déconnecter" : "Connecter";
        btn.className = isConnected ? "btn btn-secondary connect-btn" : "btn connect-btn";
      }
    });
  }

  function renderPosts() {
    postsList.innerHTML = "";
    scheduledCount.textContent = posts.length;
    if (!posts.length) { emptyState.style.display = "block"; return; }
    emptyState.style.display = "none";

    posts.sort((a,b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .forEach(post => {
      const template = document.getElementById("postTemplate");
      const clone = template.content.cloneNode(true);
      clone.querySelector(".post-title").textContent = post.campaignName || "Sans nom";
      clone.querySelector(".post-content").textContent = post.content;
      clone.querySelector(".post-date").textContent = `Prévu le ${post.date} à ${post.time}`;

      const mediaEl = clone.querySelector(".post-media");
      if (post.mediaUrl) {
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(post.mediaUrl);
        if (isImage) {
          mediaEl.innerHTML = `<img src="${post.mediaUrl}" class="post-preview-img" style="width:100%; border-radius:10px; margin-top:10px;">`;
        } else {
          mediaEl.textContent = `Lien : ${post.mediaUrl}`;
        }
      }

      clone.querySelector(".delete-btn").onclick = () => {
        posts = posts.filter(p => p.id !== post.id);
        saveState(); renderPosts();
      };
      
      postsList.appendChild(clone);
    });
  }

  // Simulation Connexion
  document.querySelectorAll(".connect-btn").forEach(btn => {
    btn.onclick = () => {
      const p = btn.dataset.platform;
      connections[p] = !connections[p];
      saveState(); updateConnectionUI();
    };
  });

  // Formulaire
  form.onsubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: crypto.randomUUID(),
      content: document.getElementById("content").value,
      mediaUrl: document.getElementById("mediaUrl").value,
      campaignName: document.getElementById("campaignName").value,
      date: document.getElementById("publishDate").value,
      time: document.getElementById("publishTime").value,
      platforms: [...document.querySelectorAll('input[name="platforms"]:checked')].map(cb => cb.value)
    };
    posts.push(newPost);
    saveState(); renderPosts(); form.reset();
  };

  // Export JSON
  document.getElementById("exportBtn")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(posts, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup_autopub.json';
    a.click();
  });

  updateConnectionUI();
  renderPosts();
});
