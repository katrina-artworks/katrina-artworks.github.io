// Success Popup Functionality
const successPopup = document.getElementById("successPopup");
const showSuccessBtn = document.getElementById("showSuccessPopup");
const closeSuccessBtn = document.getElementById("closeSuccess");

// Show success popup when button is clicked
showSuccessBtn.addEventListener("click", () => {
    successPopup.style.display = "flex";
});

// Close success popup when close button is clicked
closeSuccessBtn.addEventListener("click", () => {
    successPopup.style.display = "none";
});
