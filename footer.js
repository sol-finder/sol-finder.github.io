const footer = document.createElement("div");
footer.className = "footer";

const lm = document.createElement("p");
lm.innerHTML = "<a href='/why-mine'>Learn more about how we monetize this website, without serving you advertisements.</a>";

const tos = document.createElement("p");
tos.innerHTML = "<a href='/tos.html'>By using this website you accept, and fully acknowledge our TOS.</a>";

const cc = document.createElement("p");
cc.innerText = "© Adam Ryan " + new Date().getFullYear() + ", all rights reserved.";

footer.appendChild(lm);
footer.appendChild(tos);
footer.appendChild(cc);

document.body.appendChild(footer);