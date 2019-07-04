browser.fxa.onSignInChanged.addListener(function callback(signedIn) {
    console.log("addon got notification of signin change", signedIn);
    setup();
});

async function setup() {
    let info = await browser.fxa.getProfileUserInfo();
    console.log("user info", info);
    if (info == null) {
        document.getElementById("no-user").hidden = false;
        document.getElementById("have-user").hidden = true;
        document.getElementById("signin").addEventListener("click", () => {
            browser.fxa.openAccountPrefs();
        });
    } else {
        document.getElementById("no-user").hidden = true;
        document.getElementById("have-user").hidden = false;
        document.getElementById("avatar").src = info.avatar;
        document.getElementById("displayName").innerText = info.displayName;
        document.getElementById("email").innerText = info.email;
        document.getElementById("connect").addEventListener("click", () => {
            alert('connected! (not really)')
        });
    }
}

setup();
