let lastClickedLink = null;

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (lastClickedLink) {
            lastClickedLink.style.color = '';
        }
        link.style.color = '#7ebbd7';
        lastClickedLink = link;
    });
});