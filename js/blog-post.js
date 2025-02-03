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
    const modal = document.getElementById("image-modal");
    if (modal) {
        modal.classList.remove("active");
    }
    setupModal();
});

// 🟢 Fetch blog post data
async function fetchBlogPost() {
    try {
        const response = await fetch(`https://annhau.no/blog/wp-json/wp/v2/posts/${postId}?_embed`);
        if (!response.ok) throw new Error("Failed to fetch the blog post");

        const post = await response.json();

        // Update page title
        document.title = `Into the Woods | ${post.title.rendered}`;

        renderBlogPost(post);
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

    setupModal();
}


// 🟢 Ensure modal works correctly
function setupModal() {
    const modal = document.getElementById("image-modal");
    const modalImage = document.getElementById("modal-image");

    if (!modal || !modalImage) {
        console.error("Modal elements not found.");
        return;
    }

    // Ensure modal is hidden when the page loads
    modal.classList.remove("active");
    modalImage.src = "";

    // Event listener for clicking on blog images
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("blog-image")) {
            modal.classList.add("active"); 
            modalImage.src = event.target.src;
        }
    });

    // Event listener for closing the modal
    modal.addEventListener("click", (event) => {
        if (event.target === modal || event.target === modalImage) {
            modal.classList.remove("active");
            modalImage.src = "";
        }
    });
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

// 🟢 Get comments from LocalStorage
function getLocalComments() {
    return JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
}

// 🟢 Save comment to LocalStorage
function saveLocalComment(comment) {
    let comments = getLocalComments();
    comments.push(comment);
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
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
        console.log("WP API Response:", result);

        if (!response.ok) throw new Error(result.message || "Failed to save the comment in WordPress");

        console.log("Comment successfully saved in WordPress");
    } catch (error) {
        console.error("Error while saving comment in WordPress:", error);
    }
}

// 🟢 Display all comments in the UI
function displayComments(comments) {
    commentsList.innerHTML = "";
    comments.forEach((comment) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${comment.name || comment.author_name}</strong>: ${comment.text || comment.content.rendered}`;
        commentsList.appendChild(li);
    });
}

// 🟢 Load and merge comments from both sources
async function loadComments() {
    const localComments = getLocalComments();
    const wpComments = await fetchWPComments();

    const allComments = [
        ...localComments,
        ...wpComments.map((c) => ({ name: c.author_name, text: c.content.rendered })),
    ];

    displayComments(allComments);
}

// 🟢 Handle comment submission
commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newComment = {
        name: commentName.value.trim(),
        text: commentText.value.trim(),
    };

    if (newComment.name && newComment.text) {
        saveLocalComment(newComment); 
        saveWPComment(newComment); 
        commentName.value = "";
        commentText.value = "";
        loadComments();
    }
});

// 🟢 Start loading content
document.addEventListener("DOMContentLoaded", () => {
    fetchBlogPost();
    loadComments();
});
