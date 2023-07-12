const GLOBALS = {};

function registerMutationObserver(f) {
  if (GLOBALS.mutationObserver) {
    GLOBALS.mutationObserver.disconnect();
  }

  // Changes to attributes must not be observed.
  GLOBALS.mutationObserver = new MutationObserver(f);
  GLOBALS.mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function registerElements(f) {
  if (GLOBALS.elements) {
    for (const element of GLOBALS.elements) {
      element.remove();
    }
  }

  GLOBALS.elements = [];
  return f((tag) => {
    const element = document.createElement(tag);
    GLOBALS.elements.push(element);
    return element;
  });
}

function applyOverlayToImageElement(image, overlaySrc) {
  if (image !== null && !image.style.backgroundImage) {
    image.style.backgroundImage = `url(${image.src})`;
    image.style.backgroundSize = "cover";
    image.src = overlaySrc;
  }
}

function applyPixivManga(manifest) {
  registerElements((create) => {
    const warning = create("div");
    warning.style.color = "#856404";
    warning.style.backgroundColor = "#fff3cd";
    warning.style.border = "1px solid #ffeeba";
    warning.style.borderRadius = "0.25rem";
    warning.style.textAlign = "center";
    warning.style.padding = "1rem";

    warning.innerText = [
      "Support the artist by liking or favoriting this work or by following them.",
      "Please do not post comments unless the artist has officially endorsed this scanlation.",
    ].join("\n");

    [...document.querySelectorAll("h2")]
      .find((node) => node.textContent.includes("Comments"))
      .parentElement.insertAdjacentElement("afterbegin", warning);
  });

  const onMutation = () => {
    const applyOverlay = (image, page) => {
      if (Object.hasOwn(manifest.pages, page)) {
        applyOverlayToImageElement(image, manifest.pages[page]);
      }
    };

    // Overlay images in book view.
    const originalImageLinks = {};
    const links = document.querySelectorAll("a[data-page]");
    for (const link of links) {
      const page = link.dataset.page;
      const image = link.querySelector("img");
      applyOverlay(image, page);
      originalImageLinks[link.href] = page;
    }

    // Overlay images in zoom view.
    for (const [href, page] of Object.entries(originalImageLinks)) {
      for (const image of document.querySelectorAll(`[src="${href}"]`)) {
        applyOverlay(image, page);
      }
    }
  };

  onMutation();
  registerMutationObserver(onMutation);
}

async function apply(manifestURL) {
  const manifest = await (await fetch(manifestURL)).json();
  if (manifest.type === "pixiv-manga") applyPixivManga(manifest);
}
