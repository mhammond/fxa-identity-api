# FxA Browser API sample

This is a proof-of-concept for what a `browser.fxa` Web Extension API might
look like.

It has 2 parts:

* An experimental Web Extension API, modelled on Chrome's `chrome.identity`
  API, although the data returned by the various methods have been tweaked
  to better support Firefox Accounts.

* A trivial Web Extension which uses the new API in a simple popup.

Because this embeds an experimental API, you will not be able to install or
run this from AMO. Instead you must:

* Grab the sources to a local directory.
* In a Nightly Firefox, visit `about:debugging`, select "This Nightly", then
  "Load Temporary Add-on...". A file chooser dialog will appear - select
  `manifest.json` from this add-on's source directory.

You should notice a new toolbar icon with a stylized head-and-shoulders
outline. Clicking on that will show a popup, the contents of which depend on
the signed in state in the browser.
