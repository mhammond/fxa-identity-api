const { XPCOMUtils } = ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetters(this, {
  "Services": "resource://gre/modules/Services.jsm",
  "fxAccounts": "resource://gre/modules/FxAccounts.jsm",
  "UIState": "resource://services-sync/UIState.jsm",
});

const { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

const {
  EventEmitter,
  EventManager,
} = ExtensionCommon;

let observer = new class extends EventEmitter {
  constructor() {
    super();
  }

  observe(subject, topic, data) {
    const state = UIState.get();
    let loggedIn = state.status != UIState.STATUS_NOT_CONFIGURED;
    console.log("emitting SignInChanged", loggedIn);
    this.emit("SignInChanged", loggedIn);
  }
}();

let listenerCount = 0;
const decrementListeners = () => {
  listenerCount -= 1;
  if (!listenerCount) {
    Services.obs.removeObserver(observer, "sync-ui-state:update");
  }
};

const incrementListeners = () => {
  listenerCount++;
  if (listenerCount == 1) {
    Services.obs.addObserver(observer, "sync-ui-state:update");
  }
};

this.fxa = class extends ExtensionAPI {
  getAPI(context) {
    return {
      fxa: {
        async openAccountPrefs() {
          const browser = Services.wm.getMostRecentBrowserWindow();
          browser.gSync.openPrefs("fxa-api");
        },

        async getProfileUserInfo() {
          try {
            let user = await fxAccounts.getSignedInUser();
            if (!user) {
              return null;
            }
            let profile = await fxAccounts.getSignedInUserProfile();
            if (user.uid != profile.uid) {
              console.error("we seem to be in a login/logout race?");
              return null;
            }
            return {
              email: user.email,
              issuer: Services.prefs.getStringPref("identity.fxaccounts.remote.root", ""),
              verified: user.verified,
              displayName: profile.displayName,
              avatar: profile.avatar,
            };
          } catch (ex) {
            console.error("Failed to get profile info", ex);
          }
        },

        onSignInChanged: new EventManager({
          context,
          name: "fxa.onSignInChanged",
          register: fire => {
            let listener = (event, signedIn) => {
              fire.sync(signedIn);
            };

            observer.on("SignInChanged", listener);
            incrementListeners();
            return () => {
              observer.off("SignInChanged", listener);
              decrementListeners();
            };
          },
        }).api(),
      },
    }
  }
}
