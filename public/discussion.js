let offset = 0;
const limit = 20;
let currentSort = 'timestamp';


async function loadDiscussionPosts() {
    document.getElementById("loading").style.display = "block";
    const response = await fetch ('/getDiscussionPosts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentSort })
    });
    const posts = await response.json();
    console.log("Posts: " + JSON.stringify(posts));
    
    renderPosts(posts);
    document.getElementById("loading").style.display = "none";
}


function renderPosts(posts) {
    const postList = document.getElementById("post-list");
    //postList.innerHTML = '';
    

    posts.discussions.forEach(post => {
        const postDiv = document.createElement('li');
        postDiv.className = 'post';

        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'replies-container';

        postDiv.innerHTML = `
            <h3 class="post-subject">${post.subject || 'Untitled Post'}</h3>
            <p class="post-description">${post.description || 'No description available.'}</p>
            <div class="post-footer">
                <small class="timestamp">Posted on ${new Date(post.timestamp).toLocaleString()}</small>
                <div class="post-interactions">
                    <span class="likes">${post.likes} Likes</span>
                    <span class="dislikes">${post.dislikes} Dislikes</span>
                    <button class="reply-button" data-post-id="${post.post_uid}"> Reply</button>
                    <button class="view-replies-button" data-post-id="${post.post_uid}"> View Replies</button>
                </div>
            </div>
        `;

        //postDiv.appendChild(repliesContainer);
        postList.appendChild(postDiv);

    });
}





/*

document.getElementById("sortOptions").addEventListener("change", (e) => {
    currentSort = e.target.value;
    offset = 0;
    document.getElementById("post-list").innerHTML = '';
    loadDiscussionPosts();
})
*/

loadDiscussionPosts();



