const namePopup = document.getElementById("namePopup");
  const teaserSection = document.getElementById("teaser");
  const enterNameBtn = document.getElementById("enterNameBtn");
  const userNameInput = document.getElementById("userNameInput");
  const nameDisplay = document.getElementById("nameDisplay");
  const openInvitationBtn = document.getElementById("openInvitationBtn");

  function capitalizeFirstLetter(str) {
    if(!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  enterNameBtn.addEventListener("click", () => {
    let name = userNameInput.value.trim();
    if(name){
      name = capitalizeFirstLetter(name);
      nameDisplay.innerHTML = `<p class="text-xl md:text-2xl georgia font-semibold mb-2">To:<br>${name}</p>`;
      namePopup.style.display = "none";
      teaserSection.classList.remove("hidden");
    }
  });

  userNameInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter"){ enterNameBtn.click(); }
  });

  function preloadImages() {
    return new Promise((resolve) => {
      const urls = [
        'public/images/bg.png','public/images/leftfloralimage.png','public/images/rightfloralimage.png',
        'public/images/halfdec.png','public/images/cardbg.png','public/images/B&G standing.png',
        'public/images/B&Gnew.png'
      ];
      let loaded = 0;
      
      if (urls.length === 0) {
        resolve();
        return;
      }
      
      urls.forEach(url => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = img.onerror = () => { 
          if(++loaded === urls.length) resolve(); 
        };
        img.src = url;
      });
    });
  }

  function waitForFonts() {
    return document.fonts.ready.then(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });
  }

  function waitForAnimations() {
    return new Promise(resolve => {
      setTimeout(resolve, 2800); // Wait for all animations to complete
    });
  }

  async function waitForCardImages(card) {
    const images = Array.from(card.querySelectorAll("img"));
    await Promise.all(images.map(async (img) => {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      }
      if (typeof img.decode === "function") {
        try { await img.decode(); } catch (_) {}
      }
    }));
  }

  async function openInvitation() {
    if (openInvitationBtn.disabled) return;
    openInvitationBtn.disabled = true;
    teaserSection.classList.add("hidden");
    document.getElementById("weddingCardWrapper").classList.remove("hidden");
    
    try {
      // Wait for everything to be ready
      await Promise.all([
        preloadImages(), 
        waitForFonts(),
        waitForAnimations()
      ]);
      
      // Additional short delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const card = document.getElementById("weddingCard");
      await waitForCardImages(card);
      // Allow one extra paint cycle so borders/backgrounds are fully visible.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      
      // Force final visual state during capture for consistent output.
      card.classList.add("capture-mode");

      const dataUrl = await htmlToImage.toPng(card, {
        cacheBust: false,
        pixelRatio: 2,
        backgroundColor: null
      });

      card.classList.remove("capture-mode");
      
      const link = document.createElement('a');
      link.download = 'Engagement-invitation.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      const card = document.getElementById("weddingCard");
      card.classList.remove("capture-mode");
      console.error("Error generating invitation:", err);
      alert("Unable to generate invitation, please try again.");
    } finally {
      openInvitationBtn.disabled = false;
    }
  }

  openInvitationBtn.addEventListener('click', openInvitation);