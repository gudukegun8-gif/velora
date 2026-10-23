// Adsterra configuration — codes provided by the user 2026-10-23.
// Empty values render NOTHING (no placeholder, no layout shift).
//
// Zones received (all under the user's Adsterra account):
// - Native Banner (invoke.js + container div)
// - Social Bar (single script, site-wide)
// - Smart Link (direct URL for a labeled sponsored CTA)
// - Banners (iframe/atOptions format, served from bauval.org):
//   leaderboard 728x90, full banner 468x60, mobile banner 320x50,
//   skyscraper 160x600, half-skyscraper 160x300 (held in reserve),
//   medium rectangle 300x250.
export const ADSTERRA = {
  nativeSrc: "https://bauval.org/21/ee3e3acc93c0d46948af5174a46b9d8c",
  nativeKey: "ee3e3acc93c0d46948af5174a46b9d8c",
  socialBarSrc: "https://bauval.org/14/5b661444c3853a042dc90756bc878651",
  smartLinkUrl: "https://araplhn.org/4/0957a1be1cb0d254876946dae6f7ae50",
  banners: {
    leaderboard728x90: {
      key: "06ec68667c9c74b40cdfac5df467427d",
      src: "https://bauval.org/22/06ec68667c9c74b40cdfac5df467427d",
      width: 728,
      height: 90,
    },
    fullBanner468x60: {
      key: "52a1362b552df8b67780a91f037aac64",
      src: "https://bauval.org/22/52a1362b552df8b67780a91f037aac64",
      width: 468,
      height: 60,
    },
    mobileBanner320x50: {
      key: "0e8e62e2452fd6777f28a8fba33ea0c6",
      src: "https://bauval.org/22/0e8e62e2452fd6777f28a8fba33ea0c6",
      width: 320,
      height: 50,
    },
    skyscraper160x600: {
      key: "37d15a6efde4f9665a66d6b0ee1ae190",
      src: "https://bauval.org/22/37d15a6efde4f9665a66d6b0ee1ae190",
      width: 160,
      height: 600,
    },
    rectangle300x250: {
      key: "e517954db93023dd61ce74ab058f591c",
      src: "https://bauval.org/22/e517954db93023dd61ce74ab058f591c",
      width: 300,
      height: 250,
    },
  },
};

export const adsEnabled = Boolean(ADSTERRA.nativeSrc && ADSTERRA.nativeKey);
export const socialBarEnabled = Boolean(ADSTERRA.socialBarSrc);
