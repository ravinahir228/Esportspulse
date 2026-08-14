// =====================================================
// ESPORTSPULSE — LIVE NEWS LOADER
// =====================================================

const NEWS_API_URL = "https://newsapi.org/v2/everything";

const NEWS_QUERY =
  '"PUBG Mobile" OR BGMI OR PMWC OR "Esports World Cup" OR ' +
  'VALORANT OR "Dota 2" OR "Mobile Legends" OR "FC Mobile" OR ' +
  '"esports chess" OR "GTA esports"';

async function loadEsportsNews() {

  const newsGrid = document.querySelector(".news-grid");

  if (!newsGrid) {
    console.error("News grid not found.");
    return;
  }

  newsGrid.innerHTML = `
    <div class="news-loading">
      <div class="loading-spinner"></div>
      <p>Loading latest esports news...</p>
    </div>
  `;

  try {

    const response = await fetch(
      `${NEWS_API_URL}?q=${encodeURIComponent(NEWS_QUERY)}&language=en&sortBy=publishedAt&pageSize=12`
    );

    if (!response.ok) {
      throw new Error("News API request failed.");
    }

    const data = await response.json();

    if (data.status !== "ok") {
      throw new Error(data.message || "Unable to load news.");
    }

    const articles = data.articles || [];

    if (articles.length === 0) {
      newsGrid.innerHTML = `
        <div class="news-error">
          <h3>No latest news found.</h3>
          <p>Please check again shortly.</p>
        </div>
      `;
      return;
    }

    newsGrid.innerHTML = articles
      .filter(article => article.title && article.url)
      .map(article => createNewsCard(article))
      .join("");

  } catch (error) {

    console.error("EsportsPulse News Error:", error);

    newsGrid.innerHTML = `
      <div class="news-error">
        <h3>News temporarily unavailable</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}


// =====================================================
// CREATE NEWS CARD
// =====================================================

function createNewsCard(article) {

  const title = escapeHTML(article.title || "Latest Esports News");

  const description = escapeHTML(
    article.description ||
    "Read the latest esports update from the original publisher."
  );

  const source = escapeHTML(
    article.source?.name || "News Source"
  );

  const image = article.urlToImage
    ? article.urlToImage
    : "";

  const publishedTime = formatDate(article.publishedAt);

  return `
    <article class="news-card live-news-card">

      <a
        href="${article.url}"
        target="_blank"
        rel="noopener noreferrer"
        class="news-link"
      >

        <div
          class="news-image live-news-image"
          ${image ? `style="background-image:url('${image}')"` : ""}
        >

          <div class="live-news-overlay"></div>

          <span class="news-live-badge">
            LIVE
          </span>

          <span class="news-source-badge">
            ${source}
          </span>

        </div>

        <div class="news-body">

          <span class="tag">
            ESPORTS NEWS
          </span>

          <h3>
            ${title}
          </h3>

          <p>
            ${description}
          </p>

          <div class="news-meta">

            <span>
              ${source}
            </span>

            <span>
              ${publishedTime}
            </span>

          </div>

        </div>

      </a>

    </article>
  `;
}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(dateString) {

  if (!dateString) {
    return "Latest";
  }

  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


// =====================================================
// SECURITY — ESCAPE TEXT
// =====================================================

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =====================================================
// START
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  loadEsportsNews
);
