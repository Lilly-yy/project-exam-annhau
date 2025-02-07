const blogContainer = document.getElementById('blog-container');
const loadMoreButton = document.getElementById('load-more');
const filters = document.querySelectorAll('.filters button');

let posts = [];
let visiblePosts = 10; 
let currentCategory = ''; 

async function fetchBlogPosts() {
    try {
        const response = await fetch('https://annhau.no/blog/wp-json/wp/v2/posts?per_page=100&_embed');
        posts = await response.json();
        renderPosts(); 
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        blogContainer.innerHTML = `<p>Failed to load blog posts. Please try again later.</p>`;
    }
}

function renderPosts() {
    blogContainer.innerHTML = ''; 
    const filteredPosts = currentCategory
        ? posts.filter(post => post.categories.includes(parseInt(currentCategory))) 
        : posts; 

    const postsToShow = filteredPosts.slice(0, visiblePosts); 

    postsToShow.forEach(post => {
        const image = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
        const postHTML = `
            <a href="blog-post.html?id=${post.id}" class="blog-post">
                <img src="${image}" alt="${post.title.rendered}">
                <h2>${post.title.rendered}</h2>
            </a>
        `;
        blogContainer.innerHTML += postHTML;
    });

    if (visiblePosts >= filteredPosts.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'block';
    }
}


loadMoreButton.addEventListener('click', () => {
    visiblePosts += 6; 
    renderPosts();
});


filters.forEach(filter => {
    filter.addEventListener('click', () => {
        currentCategory = filter.dataset.category === '15' ? '' : filter.dataset.category; // 'All' viser alt
        visiblePosts = 10; 
        filters.forEach(btn => btn.classList.remove('active')); 
        filter.classList.add('active'); 
        renderPosts();
    });
});

fetchBlogPosts();
