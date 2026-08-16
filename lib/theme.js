export const C = {
  ink: "#1B1116",
  plum: "#3B0A2A",
  plumDeep: "#26061B",
  maroon: "#5B1226",
  marigold: "#E8912D",
  gold: "#C8A24A",
  goldSoft: "#EBD5A0",
  peacock: "#0E5C63",
  ivory: "#FDF6EA",
  paper: "#FFFFFF",
  line: "#E9DCC9",
  muted: "#8C7B70",
  green: "#3F7D53",
  red: "#B8443F",
};

export const PLANS = {
  BASIC: { label: "Essential", price: 4999, mrp: 8999, guests: "Up to 200 guest links", sites: "1 invitation website" },
  STANDARD: { label: "Complete", price: 9999, mrp: 17999, guests: "Up to 800 guest links", sites: "3 invitation websites" },
  PREMIUM: { label: "Signature", price: 24999, mrp: 44999, guests: "Unlimited guest links", sites: "Custom-designed website" },
};

export const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
