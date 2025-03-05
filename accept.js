if (getCookie("allowance") !== "ac") {
    const acceptE = document.createElement("div");
    acceptE.className = "ac";
    const buttons = document.createElement("div");
    const acceptNMine = document.createElement("button");
    acceptNMine.innerText = "Accept";
    const deny = document.createElement("button");
    deny.innerText = "Deny";
    deny.className = "lightButton";
    acceptNMine.onclick = () => {
        document.querySelector(".ac").style.display = "none";
        setCookie("allowance", "ac");
        setCookie("allowanceMine", "m");
        mine();
    }
    deny.onclick = () => {
        document.querySelector(".ac").style.display = "none";
    }
    buttons.appendChild(deny);
    buttons.appendChild(acceptNMine);
    const title = document.createElement("h2");
    title.innerText = "Your Solfinder Settings";
    title.style.textAlign = "center";
    const tos = document.createElement("p");
    tos.innerHTML = "By using this website you agree to our <a href='/tos.html'>TOS</a> We use cookies to enhance your experience on Solfinder. You can choose to decline them, but some features may not work as intended. By clicking 'Accept', you allow us to use cookies to improve functionality. By clicking 'Accept', you also support our site through responsible web mining, which helps keep our services running smoothly, and deliver an ad free experience <a href='/why-mine'>Learn more about why we do this here.</a>";
    tos.style.padding = "0 5%";

    acceptE.appendChild(title);
    acceptE.appendChild(tos);
    acceptE.appendChild(buttons);

    document.body.appendChild(acceptE);
} else if (getCookie("allowanceMine") === "m") {
    mine();
}