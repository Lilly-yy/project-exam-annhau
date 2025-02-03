document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const errorMessages = [];

    // Name validation
    if (name.length <= 5) {
        errorMessages.push('Name must be more than 5 characters long.');
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMessages.push('Please enter a valid email address.');
    }

    // Subject validation
    if (subject.length <= 15) {
        errorMessages.push('Subject must be more than 15 characters long.');
    }

    // Message validation
    if (message.length <= 25) {
        errorMessages.push('Message content must be more than 25 characters long.');
    }

    // Display error messages
    const errorContainer = document.getElementById('error-messages');
    errorContainer.innerHTML = '';

    if (errorMessages.length > 0) {
        errorMessages.forEach(msg => {
            const error = document.createElement('p');
            error.textContent = msg;
            error.style.color = "red";
            errorContainer.appendChild(error);
        });
        return;
    }

    // Prepare form data for submission
    const formData = {
        name: name,
        email: email,
        subject: subject,
        message: message,
    };

    try {
        const response = await fetch("https://annhau.no/blog/wp-json/custom/v1/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Message sent successfully!");
            document.getElementById('contactForm').reset();
        } else {
            alert(result.message || "An error occurred.");
        }
    } catch (error) {
        alert("Failed to send message. Please try again later.");
    }
});
