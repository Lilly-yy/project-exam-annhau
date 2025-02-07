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

    fetchBlogPost();
    loadComments();


    if (modal) {
        modal.classList.remove("active");
    }
    setupModal();
});

function setupModal() {
    const modal = document.getElementById("image-modal");
    const modalImage = document.getElementById("modal-image");

    if (!modal || !modalImage) {
        console.error("Modal elements not found.");
        return;
    }

    modal.classList.remove("active");
    modalImage.src = "";

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("blog-image")) {
            modal.classList.add("active");
            modalImage.src = event.target.src;
        }
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target === modalImage) {
            modal.classList.remove("active");
            modalImage.src = "";
        }
    });
}
async function fetchBlogPost() {
    try {
        const response = await fetch(`https://annhau.no/blog/wp-json/wp/v2/posts/${postId}?_embed`);
        if (!response.ok) throw new Error("Failed to fetch the blog post");

        const post = await response.json();

        document.title = `${post.title.rendered} | Into the Woods`;

        renderBlogPost(post);

        await fetchAdjacentPosts(post.date);
    } catch (error) {
        console.error("Error fetching blog post:", error);
        blogPostContainer.innerHTML = `<p>Failed to load the blog post. Please try again later.</p>`;
    }
}
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

async function loadComments() {
    const wpComments = await fetchWPComments();

    const allComments = wpComments.map(c => ({
        name: c.author_name,
        text: c.content.rendered
    }));

    displayComments(allComments);
}

function displayComments(comments) {
    commentsList.innerHTML = ""; 
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
        displayTemporaryComment(newComment); 
        await saveWPComment(newComment); 
        commentName.value = "";
        commentText.value = "";
        loadComments(); 
    }
});

function displayTemporaryComment(comment) {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${comment.name}</strong>: ${comment.text}`;
    li.classList.add("temporary-comment");
    commentsList.appendChild(li);
}

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
    } 
    catch (error) {
        document.getElementById("error-messages").innerHTML = 
            "<p>Could not save comment. Please try again later.</p>";
    }
    
}
