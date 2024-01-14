// document.addEventListener('DOMContentLoaded', () => {
//     const itemsPerPage = 6;
//     let currentPage = 1;

//     // Fetch repositories from GitHub API
//     fetch('https://api.github.com/users/KafuiEdem/repos')
//         .then(response => response.json())
//         .then(repos => {
//             const pageCount = Math.ceil(repos.length / itemsPerPage);
//             displayRepos(repos, currentPage, itemsPerPage);
//             setupPagination(pageCount, currentPage, repos, itemsPerPage);
//         });
// });

document.addEventListener('DOMContentLoaded', () => {
    const itemsPerPage = 6;
    let currentPage = 1;
    let allRepos = [];

    // Read the list of project URLs from projects.txt
    fetch('projects.txt')
        .then(response => response.text())
        .then(text => {
            const projectUrls = text.split('\n').filter(line => line.length); // Filter out empty lines
            const repoPromises = projectUrls.map(url => {
                const [username, repoName] = url.replace('https://github.com/', '').split('/');
                return fetch(`https://api.github.com/repos/${username}/${repoName}`)
                    .then(response => response.json());
            });
            return Promise.all(repoPromises);
        })
        .then(repos => {
            allRepos = repos; // Save fetched repos to use in pagination
            const pageCount = Math.ceil(repos.length / itemsPerPage);
            displayRepos(repos, currentPage, itemsPerPage);
            setupPagination(pageCount, currentPage, repos, itemsPerPage);
        })
        .catch(error => console.error('Error loading projects:', error));
});

function displayRepos(allRepos, currentPage, itemsPerPage) {
    const projectsContainer = document.getElementById('projects-container');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const reposToShow = allRepos.slice(start, end);

    projectsContainer.innerHTML = ''; // Clear previous content

    // Create cards for each repo in the current page
    reposToShow.forEach(repo => {
        // projectsContainer.appendChild(createProjectCard(repo));
        const projectCard = createProjectCard(repo);
        projectsContainer.appendChild(projectCard);
    });
}
function addReadmeImageToCard(repo, card) {
    // Fetch the README file from the GitHub API
    fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`)
      .then((response) => response.json())
      .then((readmeData) => {
        // GitHub API returns README content encoded in base64, so we need to decode it
        const readmeContent = atob(readmeData.content);
        const imageUrl = extractFirstImageUrlFromMarkdown(readmeContent);
        if (imageUrl) {
          // Create an image element and set the src attribute to the extracted image URL
          const image = document.createElement('img');
          image.src = imageUrl;
          image.alt = `${repo.name} Image`;
          image.className = 'repo-image'; // Make sure you define the CSS for this class
          card.insertBefore(image, card.firstChild); // Insert the image at the top of the card
        }
      })
      .catch((error) => console.error('Error fetching README:', error));
  }

  function extractFirstImageUrlFromMarkdown(markdown) {
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = imageRegex.exec(markdown);
    return match ? match[1] : null; // Return the first captured group, which is the URL
  } 

function setupPagination(pageCount, currentPage, allRepos, itemsPerPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.innerText = i;
        pageLink.className = `pagination-link ${i === currentPage ? 'active' : ''}`;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            updateActiveLink(currentPage);
            displayRepos(allRepos, currentPage, itemsPerPage);
        });
        paginationContainer.appendChild(pageLink);
    }
}


function updateActiveLink(activeIndex) {
    const links = document.querySelectorAll('.pagination-link');
    links.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.pagination-link:nth-child(${activeIndex})`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}


function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';

    const title = document.createElement('h2');
    title.className = 'project-title';
    title.textContent = repo.name;

    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = repo.description || "No description provided.";

    const link = document.createElement('a');
    link.href = repo.html_url;
    link.textContent = 'View on GitHub';
    link.target = '_blank';

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(link);
    addReadmeImageToCard(repo, card);
    return card;
}


document.getElementById('year').textContent = new Date().getFullYear();
