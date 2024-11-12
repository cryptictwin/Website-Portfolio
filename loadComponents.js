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
    loadComponent('home', '/Website-Portfolio/components/home/home.html');
    loadComponent('header', '/Website-Portfolio/components/header/header.html');
    loadComponent('footer', '/Website-Portfolio/components/footer/footer.html');
    loadComponent('skills', '/Website-Portfolio/components/skills/skills.html');
    loadComponent('projects', '/Website-Portfolio/components/projects/projects.html');
    loadComponent('contact', '/Website-Portfolio/components/contact/contact.html');
    loadComponent('side-nav', '/Website-Portfolio/components/side-nav/side_nav.html');
}
