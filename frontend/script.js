document.addEventListener("DOMContentLoaded", () => {
    const detectButton = document.getElementById("detect-button");
    const loginLink = document.querySelector(".navbar-links li a[href='/user/login']");
    
    // Fetch login status
    fetch("/api/login-status")
        .then(response => response.json())
        .then(data => {
            if (data.isLoggedIn) {
                // User is logged in
                detectButton.textContent = "Detect Now";
                detectButton.removeEventListener('click', redirectToRegister); // Remove any conflicting listener
                detectButton.addEventListener('click', () => {
                    window.location.href = 'prediction.html';
                });

                loginLink.textContent = `${data.email} - logout`;
                loginLink.href = "/";
                loginLink.addEventListener("click", () => {
                    const userConfirmed = confirm("Are you sure you want to log out?");
                    if (userConfirmed) {
                        fetch("/user/logout", { method: "POST" })
                            .then(response => response.json())
                            .then(data => {
                                alert(data.message); // Notify user
                                // Reset UI after logout
                                loginLink.textContent = "Login";
                                loginLink.href = "/user/login";
                                detectButton.textContent = "Get Started";
                                detectButton.removeEventListener('click', redirectToStreamlit);
                                detectButton.addEventListener('click', redirectToRegister);
                            })
                            .catch(error => console.error("Error logging out:", error));
                    }
                });
            } else {
                // User is not logged in
                detectButton.textContent = "Get Started";
                detectButton.removeEventListener('click', redirectToStreamlit); // Remove any conflicting listener
                detectButton.addEventListener('click', redirectToRegister);

                loginLink.textContent = "Login";
                loginLink.href = "/user/login";
            }
        })
        .catch(error => console.error("Error fetching login status:", error));

    function redirectToStreamlit() {
        window.location.href = 'https://plant-easy-care.streamlit.app';
    }

    function redirectToRegister() {
        window.location.href = '/user/register';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.about-us, .our-services');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Add 'visible' when in view
            } else {
                entry.target.classList.remove('visible'); // Remove 'visible' when out of view
            }
        });
    }, { threshold: 0.5 }); // Adjust threshold if needed

    sections.forEach(section => observer.observe(section)); // Observe both sections
});