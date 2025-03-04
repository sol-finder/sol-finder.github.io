const footer = document.createElement("div");
footer.className = "footer";

const lm = document.createElement("p");
lm.innerHTML = "<a href='/why-mine'>Learn more about how we monetize this website, without serving you advertisements.</a>";

const cc = document.createElement("p");
cc.innerText = "© Adam ryan " + new Date().getFullYear() + ", all rights reserved.";

footer.appendChild(lm);
footer.appendChild(cc);

document.body.appendChild(footer);