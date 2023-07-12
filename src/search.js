async function buildIndex(indexList) {
  const localIndex = {
    pixivManga: {},
  };

  for (const indexURL of indexList) {
    const index = await (await fetch(indexURL)).json();
    for (const entry of index) {
      if (entry.type === "pixiv-manga") {
        localIndex.pixivManga[entry.id] = entry.manifest;
      }
    }
  }

  return localIndex;
}

function searchIndex(index, url) {
  if (url.hostname === "www.pixiv.net") {
    const id = url.pathname.match(/artworks\/(\d+)/);
    if (id) return index.pixivManga[id[1]];
  }
}

async function searchAndApply(indexList) {
  const index = await buildIndex(indexList);
  const manifestURL = searchIndex(index, window.location);
  if (manifestURL) await apply(manifestURL);
}
