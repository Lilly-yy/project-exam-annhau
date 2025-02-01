// Fetch and display WordPress blog posts
const blogContainer = document.getElementById('blog-posts'); // Your container for blog posts

async function fetchBlogPosts() {
  try {
    const response = await fetch('https://annhau.no/blog/wp-json/wp/v2/posts?per_page=5&_embed');
    const posts = await response.json();

    // Dynamically generate HTML for each post
    blogContainer.innerHTML = posts
      .map(post => {
        const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        return `
          <article class="blog-post">
            ${image ? `<img src="${image}" alt="${post.title.rendered}" class="post-image">` : ''}
            <h2>${post.title.rendered}</h2>
            <p>${post.excerpt.rendered}</p>
            <a href="${post.link}" target="_blank">Read More</a>
          </article>
        `;
      })
      .join('');
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    blogContainer.innerHTML = `<p>Failed to load blog posts. Please try again later.</p>`;
  }
}

fetchBlogPosts();
