function loadComponent(elementId, filePath) {
    console.log(`Attempting to load component: ${elementId} from ${filePath}`);
    return fetch(filePath)
        .then(response => { 
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
            }
            console.log(`Successfully loaded ${filePath}`);
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            console.log(`Inserted content for ${elementId}`);
        })
        .catch(error => console.error('Error loading component:', error));
}

window.onload = function () {
    console.log('Window loaded, starting to load components');
    Promise.all([
        loadComponent('home', '/Website-Portfolio/components/home/home.html'),
        loadComponent('header', '/Website-Portfolio/components/header/header.html'),
        loadComponent('footer', '/Website-Portfolio/components/footer/footer.html'),
        loadComponent('skills', '/Website-Portfolio/components/skills/skills.html'),
        loadComponent('projects', '/Website-Portfolio/components/projects/projects.html'),
        loadComponent('contact', '/Website-Portfolio/components/contact/contact.html'),
        loadComponent('side-nav', '/Website-Portfolio/components/side-nav/side_nav.html')
    ]).then(() => {
        console.log('All components loaded, initializing Materialize components');
        var modals = document.querySelectorAll('.modal');
        M.Modal.init(modals);
        
        // Initialize other Materialize components if needed
        // For example, for dropdowns:
        // var dropdowns = document.querySelectorAll('.dropdown-trigger');
        // M.Dropdown.init(dropdowns);
    }).catch(error => console.error('Error in loading components:', error));
}; // Add this closing brace and semicolon

console.log('loadComponents.js fully loaded');