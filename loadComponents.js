function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => { 
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            return response.text(); // Convert the response to text (HTML content)
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

window.onload = function () {
    loadComponent('home', '/components/home/home.html');
    loadComponent('header', '/components/header/header.html');
    loadComponent('footer', '/components/footer/footer.html');
    loadComponent('skills', '/components/skills/skills.html');
    loadComponent('projects', '/components/projects/projects.html');
    loadComponent('contact', '/components/contact/contact.html');
}
