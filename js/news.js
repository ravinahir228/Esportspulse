// =====================================================
// ESPORTSPULSE — LIVE NEWS DISPLAY
// Reads news from data/news.json
// =====================================================

document.addEventListener("DOMContentLoaded", loadEsportsNews);

async function loadEsportsNews() {

  const newsGrid = document.querySelector(".news-grid");

  if (!newsGrid) {
    console.error("EsportsPulse: .news-grid not found.");
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
      `data/news.json?cache=${Date.now()}`
    );

    if (!response.ok) {
      throw new Error("Unable to load news.json");
    }

    const data = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error("Invalid news data");
    }

    const articles = data.articles
      .filter(article => article.title && article.url)
      .slice(0, 12);

    if (articles.length === 0) {

      newsGrid.innerHTML = `
        <div class="news-error">
          <h3>No news available</h3>
          <p>Please check again shortly.</p>
        </div>
      `;

      return;
    }

    newsGrid.innerHTML = articles
      .map(createNewsCard)
      .join("");

  } catch (error) {

    console.error(
      "EsportsPulse News Error:",
      error
    );

    newsGrid.innerHTML = `
      <div class="news-error">
        <h3>News temporarily unavailable</h3>
        <p>Please try refreshing the page.</p>
      </div>
    `;
  }
}


// =====================================================
// CREATE NEWS CARD
// =====================================================

function createNewsCard(article) {

  const title = escapeHTML(
    article.title || "Latest Esports News"
  );

  const description = escapeHTML(
    article.description ||
    "Read the latest esports update from the original publisher."
  );

  const source = escapeHTML(
    article.source?.name ||
    "Esports Source"
  );

  const image = article.urlToImage;

  const date = formatDate(
    article.publishedAt
  );

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
          ${
            image
              ? `style="background-image:url('${escapeAttribute(image)}')"`
              : ""
          }
        >

          <div class="live-news-overlay"></div>

          <span class="news-live-badge">
            LIVE
          </span>

          <span class="news-source-badge">
            ${source}
          </span>

          ${
            !image
              ? `<div class="news-image-placeholder">🎮</div>`
              : ""
          }

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
              ${date}
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

  if (Number.isNaN(date.getTime())) {
    return "Latest";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


// =====================================================
// SECURITY HELPERS
// =====================================================

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttribute(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
