document.addEventListener('DOMContentLoaded', function() {
    const descriptions = document.querySelectorAll('.tab-description-below');
    
    descriptions.forEach(description => {
        // Store the original height for collapsing
        const originalHeight = '6.5em';
        
        description.addEventListener('click', function() {
            if (this.classList.contains('expanded')) {
                // Collapse
                this.classList.remove('expanded');
                this.style.height = originalHeight;
            } else {
                // Expand
                this.classList.add('expanded');
                this.style.height = 'auto';
                const fullHeight = this.scrollHeight + 'px';
                this.style.height = fullHeight;
            }
        });
    });
});