export const getTitleSitename = () => [
    {property: "og:title", content: document.title},
    {property: "og:type", content: "website"},
    {property: "og:url", content: window.location.href},
    {property: "og:site_name", content: "CSHub"},
];

export const getTitleSitenameImage = () => [
    ...getTitleSitename(),
    {property: "og:image", content: `${window.location.origin}/img/icons/favicon-192x192.png`},
];

export const getTitleSitenameImageDescription = () => [
    ...getTitleSitenameImage(),
    {property: "og:description", content: "CSHub is a place where everyone can create, view and edit summaries. Join now and help create them!"},
];
