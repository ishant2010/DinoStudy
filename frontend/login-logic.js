let userEmail = ""; // Keep track of the email globally within this script

async function handleSendOTP() {
    const emailInput = document.getElementById('email-input').value;
    const errorMessage = document.getElementById('error-message');

    if (!emailInput) {
        errorMessage.innerText = "Please enter an email address.";
        return;
    }

    errorMessage.innerText = "Sending OTP..."; // Loading state

    try {
        const response = await fetch('http://localhost:5000/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput })
        });

        const data = await response.json();

        if (data.success) {
            userEmail = emailInput; // Store email for the verification step

            // Toggle the UI elements
            document.getElementById('email-section').style.display = 'none';
            document.getElementById('otp-section').style.display = 'block';
            errorMessage.innerText = "";
            errorMessage.style.color = "red"; // Reset color
        } else {
            errorMessage.innerText = data.message || "Failed to send email.";
        }
    } catch (err) {
        errorMessage.innerText = "Error connecting to server.";
        console.error(err);
    }
}

async function handleVerifyOTP() {
    const otpInput = document.getElementById('otp-input').value;
    const errorMessage = document.getElementById('error-message');

    if (!otpInput) {
        errorMessage.innerText = "Please enter the OTP.";
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail, otp: otpInput })
        });

        const data = await response.json();

        if (data.success) {
            errorMessage.style.color = "green";
            errorMessage.innerText = "Success! Redirecting to DinoStudy...";

            // Redirect the user to the main dashboard after a 1 second delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            errorMessage.innerText = data.message;
        }
    } catch (err) {
        errorMessage.innerText = "Error connecting to server.";
        console.error(err);
    }
}