const button = document.querySelector("#action");
const nextButton = document.querySelector("#nextAtBat");
const output = document.querySelector("#output");

button.addEventListener("click", function () {
  const roll = Math.random();

  let message = "Ketel Marte strikes out!";

  if (roll < 0.25) {
    message = "Ketel Marte singles!";
  } else if (roll < 0.5) {
    message = "Ketel Marte doubles!";
  } else if (roll < 0.7) {
    message = "Ketel Marte triples!";
  }

  output.textContent = message;
  console.log(message);
});

nextButton.addEventListener("click", function () {
  const message = "Next at-bat: Ketel Marte steps back in.";
  output.textContent = message;
  console.log(message);
});
