export function initBookingForm() {
    console.log("INIT BOOKING FORM CALLED");
    setTimeout(() => {
        const form = document.getElementById("booking-form");

        if (!form) {
            console.warn("Booking form not found");
            return;
        }

        console.log("BOOKING FORM INITED");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log("SUBMIT HANDLER ACTIVE");
            console.log("FORM SUBMITTED");

            const name = document.getElementById("name")?.value?.trim();
            const serviceEl = document.querySelector('input[name="service"]:checked');

            if (!name) {
                console.error("Name missing");
                return;
            }

            const payload = {
                name,
                service: serviceEl ? serviceEl.value : null,
                status: "pending"
            };

            try {
                const res = await fetch("/api/bookings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                console.log("SERVER RESPONSE:", data);

                alert("Booking saved!");
            } catch (err) {
                console.error("SUBMIT ERROR:", err);
            }
        });

    }, 50);
}