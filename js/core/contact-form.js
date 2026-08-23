const CONTACT_WORKER_URL =
    "https://madonna-contact-form.programshortcuts.workers.dev/";

export function initContactForm() {

    const form = document.getElementById("contactForm");

    if (!form) {
        return;
    }

    // Prevent accidentally attaching the handler twice.
    if (form.dataset.contactInitialized === "true") {
        return;
    }

    form.dataset.contactInitialized = "true";

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        // Use the existing HTML required/type rules.
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitButton =
            document.getElementById("submitBtn");

        if (!submitButton) {
            console.error("Missing #submitBtn");
            return;
        }

        const originalButtonText =
            submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        const formData = new FormData(form);

        const data = {
            firstName: String(
                formData.get("firstName") || ""
            ).trim(),

            lastName: String(
                formData.get("lastName") || ""
            ).trim(),

            email: String(
                formData.get("email") || ""
            ).trim(),

            phone: String(
                formData.get("phone") || ""
            ).trim(),

            message: String(
                formData.get("message") || ""
            ).trim()
        };

        try {

            const response = await fetch(
                CONTACT_WORKER_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.error || "Unable to send message."
                );
            }

            form.reset();

            submitButton.textContent = "Message Sent!";

            setTimeout(() => {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }, 3000);

        } catch (error) {

            console.error(
                "Contact form submission failed:",
                error
            );

            submitButton.textContent = "Try Again";

            setTimeout(() => {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }, 3000);
        }
    });
}