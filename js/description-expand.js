document.addEventListener('DOMContentLoaded', function() {
    const descriptions = document.querySelectorAll('.tab-description-below');
    
    descriptions.forEach(description => {
        description.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
});