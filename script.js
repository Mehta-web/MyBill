document.getElementById("billButton").onclick = function () {
  window.location.href = "bill.html";
};
let selectedRating = 0;

const stars = document.querySelectorAll(".stars span");

stars.forEach((star, index) => {
  star.addEventListener("click", () => {
    selectedRating = index + 1;

    stars.forEach((s, i) => {
      s.classList.toggle("active", i < selectedRating);
    });

    document.getElementById("rating-text").textContent =
      selectedRating + " out of 5 stars";
  });
});

function submitRating() {
  if (selectedRating === 0) {
    alert("Please select a rating first!");
  } else {
    alert("Thank you for rating MyBill " + selectedRating + "/5!");
  }
}
