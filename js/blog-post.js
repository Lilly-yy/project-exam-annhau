const blogPostContainer = document.getElementById("blog-post");
const mainImage = document.getElementById("main-image");
const introText = document.getElementById("intro-text");
const additionalContent = document.getElementById("additional-content");
const modal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

const commentForm = document.getElementById("comment-form");
const commentName = document.getElementById("comment-name");
const commentText = document.getElementById("comment-text");
const commentsList = document.getElementById("comments");

const WP_API_URL = "https://annhau.no/blog/wp-json/wp/v2/comments";
const WP_CUSTOM_COMMENT_URL = "https://annhau.no/blog/wp-json/custom/v1/comment";

document.addEventListener("DOMContentLoaded", () => {
    // Load blog post and comments
    fetchBlogPost();
    loadComments();

    // Ensure modal is inactive on page load
    if (modal) {
        modal.classList.remove("active");
    }
    setupModal();
});

// 🟢 Setup image modal
function setupModal() {
    const modal = document.getElementById("image-modal");
    const modalImage = document.getElementById("modal-image");

    if (!modal || !modalImage) {
        console.error("Modal elements not found.");
        return;
    }

    // Hide modal on page load
    modal.classList.remove("active");
    modalImage.src = "";

    // Event delegation for all images
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("blog-image")) {
            modal.classList.add("active");
            modalImage.src = event.target.src;
        }
    });

    // Close modal on click outside the image
    modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target === modalImage) {
            modal.classList.remove("active");
            modalImage.src = "";
        }
    });
}

// 🟢 Fetch blog post data
async function fetchBlogPost() {
    try {
        const response = await fetch(`https://annhau.no/blog/wp-json/wp/v2/posts/${postId}?_embed`);
        if (!response.ok) throw new Error("Failed to fetch the blog post");

        const post = await response.json();

        // Update page title
        document.title = `${post.title.rendered} | Into the Woods`;

        // Render the blog post
        renderBlogPost(post);

        // Fetch adjacent posts by date
        await fetchAdjacentPosts(post.date);
    } catch (error) {
        console.error("Error fetching blog post:", error);
        blogPostContainer.innerHTML = `<p>Failed to load the blog post. Please try again later.</p>`;
    }
}

// 🟢 Render the blog post
function renderBlogPost(post) {
    const image = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
    blogPostContainer.innerHTML = `
        <h1>${post.title.rendered}</h1>
        <p><strong>Published:</strong> ${new Date(post.date).toLocaleDateString()}</p>
        ${image ? `<img src="${image}" alt="${post.title.rendered}" class="blog-image">` : ""}
        <div class="blog-content">${post.content.rendered}</div>
    `;

    const contentImages = blogPostContainer.querySelectorAll("img");
    contentImages.forEach((img) => {
        img.classList.add("blog-image");
    });
}

// 🟢 Fetch next and previous posts by date
async function fetchAdjacentPosts(currentPostDate) {
    try {
        const [previousPosts, nextPosts] = await Promise.all([
            fetch(`https://annhau.no/blog/wp-json/wp/v2/posts?before=${currentPostDate}&orderby=date&order=desc&per_page=1`).then(res => res.json()),
            fetch(`https://annhau.no/blog/wp-json/wp/v2/posts?after=${currentPostDate}&orderby=date&order=asc&per_page=1`).then(res => res.json())
        ]);

        const previousPost = previousPosts.length > 0 ? previousPosts[0] : null;
        const nextPost = nextPosts.length > 0 ? nextPosts[0] : null;

        renderAdjacentPostLinks(previousPost, nextPost);
    } catch (error) {
        console.error("Error fetching adjacent posts:", error);
    }
}

// 🟢 Render previous and next post links
function renderAdjacentPostLinks(previousPost, nextPost) {
    const adjacentLinksContainer = document.createElement("div");
    adjacentLinksContainer.classList.add("adjacent-links");

    if (previousPost) {
        const previousLink = document.createElement("a");
        previousLink.href = `blog-post.html?id=${previousPost.id}`;
        previousLink.textContent = `← ${previousPost.title.rendered}`;
        adjacentLinksContainer.appendChild(previousLink);
    }

    if (nextPost) {
        const nextLink = document.createElement("a");
        nextLink.href = `blog-post.html?id=${nextPost.id}`;
        nextLink.textContent = `${nextPost.title.rendered} →`;
        adjacentLinksContainer.appendChild(nextLink);
    }

    blogPostContainer.appendChild(adjacentLinksContainer);
}

// 🟢 Fetch comments from WordPress
async function fetchWPComments() {
    try {
        const response = await fetch(`${WP_API_URL}?post=${postId}`);
        if (!response.ok) throw new Error("Failed to fetch comments from WordPress");
        return await response.json();
    } catch (error) {
        console.error("Error fetching WP comments:", error);
        return [];
    }
}

// 🟢 Load and display comments
async function loadComments() {
    const wpComments = await fetchWPComments();

    // Convert comments to displayable format
    const allComments = wpComments.map(c => ({
        name: c.author_name,
        text: c.content.rendered
    }));

    displayComments(allComments);
}

// 🟢 Display comments in the UI
function displayComments(comments) {
    commentsList.innerHTML = ""; // Clear list before reloading
    comments.forEach((comment) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${comment.name}</strong>: ${comment.text}`;
        li.classList.add("comment");
        commentsList.appendChild(li);
    });
}

// 🟢 Handle comment submission
commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newComment = {
        name: commentName.value.trim(),
        text: commentText.value.trim(),
    };

    if (newComment.name && newComment.text) {
        displayTemporaryComment(newComment); // Show immediately
        await saveWPComment(newComment); // Save to WordPress
        commentName.value = "";
        commentText.value = "";
        loadComments(); // Reload comments
    }
});

// 🟢 Show temporary comment while saving to WordPress
function displayTemporaryComment(comment) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${comment.name}</strong>: ${comment.text}`;
    li.classList.add("temporary-comment");
    commentsList.appendChild(li);
}

// 🟢 Save comment to WordPress
async function saveWPComment(comment) {
    try {
        const response = await fetch(WP_CUSTOM_COMMENT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                post: postId,
                author_name: comment.name,
                content: comment.text,
            }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to save the comment in WordPress");

        console.log("Comment successfully saved in WordPress");
    } catch (error) {
        console.error("Error while saving comment in WordPress:", error);
    }
}
