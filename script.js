const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const PLUGIN_FILE = "plugins.min.json";
const BASE_URL = "https://ichijoutranslations.com";

// Scrapear novelas del home
async function getNovelas() {
  const { data } = await axios.get(BASE_URL);
  const $ = cheerio.load(data);

  let novelas = [];
  $(".entry-title a").each((i, el) => {
    const name = $(el).text().trim();
    const url = $(el).attr("href");
    if (url && name.length > 5) {
      novelas.push({ name, url });
    }
  });
  return novelas;
}

// Scrapear capítulos de cada novela
async function getCapitulos(urlNovela) {
  const { data } = await axios.get(urlNovela);
  const $ = cheerio.load(data);

  let capitulos = [];
  $(".entry-content a").each((i, el) => {
    const title = $(el).text().trim();
    const link = $(el).attr("href");
    if (link && title.length > 2) {
      capitulos.push({ name: title, url: link });
    }
  });
  return capitulos;
}

// Generar JSON estilo repo LNReader oficial
async function main() {
  const novelas = await getNovelas();
  for (let novela of novelas) {
    novela.capitulos = await getCapitulos(novela.url);
  }

  const plugin = [
    {
      name: "Ichijou Translations",
      id: "ichijou",
      language: "es",
      search_url: "https://ichijoutranslations.com/?s=%s",
      chapters_url: "%s",
      novelas: novelas
    }
  ];

  fs.writeFileSync(PLUGIN_FILE, JSON.stringify(plugin, null, 2));
  console.log("JSON actualizado 😎🔥");
}

main();