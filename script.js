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
        'public/images/halfdec.png','public/images/cardbg.png','public/images/B&G standing.png'
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

  async function openInvitation() {
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
      
      // Use html2canvas with better configuration for text rendering
      const canvas = await html2canvas(card, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: null,
        logging: false,
        onclone: function(clonedDoc) {
          // Force all animations to complete in the cloned document
          const clonedCard = clonedDoc.getElementById('weddingCard');
          if (clonedCard) {
            const animatedElements = clonedCard.querySelectorAll('.animate-fadeInUp');
            animatedElements.forEach(el => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
              el.style.animation = 'none';
            });
          }
        }
      });
      
      const link = document.createElement('a');
      link.download = 'wedding-invitation.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Error generating invitation:", err);
      alert("Unable to generate invitation, please try again.");
    }
  }

  openInvitationBtn.addEventListener('click', openInvitation);