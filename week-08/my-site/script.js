const button = document.querySelector("#action");
const output = document.querySelector("#output");

button.addEventListener("click", function () {
  const message = "Ketel Marte hits a single!";
  output.textContent = message;
  console.log(message);
});
