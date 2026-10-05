/* ══════════════════════════════════════════════════════════════════════
   CARD WORDS — the printed words of each occasion's card, the parts the
   sender does not write themselves (components/greetings/CardBook.js):

   cover   — the big title on the front, and the small line under it
   kicker  — the small capitals above the verse page's title
   title   — the verse page's title
   verse   — the verse itself, then a short closing couplet
   wish    — the small capitals above "Dear …," on the message page

   All written for Welcvm. Kept short on purpose: four lines and a
   couplet fit the page on a phone without shrinking the type.
   ══════════════════════════════════════════════════════════════════════ */

export const CARD_WORDS = {
  christmas: {
    cover: ["Merry Christmas", "& a happy new year"],
    kicker: "The season of joy", title: "A little Christmas wish",
    verse: [
      "May twinkling lights fill every window,",
      "and warm hands find every cup,",
      "may laughter carry through the evenings",
      "and the year end looking up.",
    ],
    close: ["Here's to the people who make it home,", "this Christmas and always."],
    wish: "A Christmas wish for you",
  },
  "new-year": {
    cover: ["Happy New Year", "here's to what comes next"],
    kicker: "A fresh page", title: "A wish for the year ahead",
    verse: [
      "May the year ahead be gentle,",
      "with good news at the door,",
      "with old friends close beside you",
      "and adventures still in store.",
    ],
    close: ["Here's to brave beginnings", "and every happy ending."],
    wish: "A new year wish for you",
  },
  diwali: {
    cover: ["Happy Diwali", "may your home glow bright"],
    kicker: "The festival of lights", title: "A little Diwali wish",
    verse: [
      "May every diya you light tonight",
      "chase a worry far away,",
      "may sweets and stories fill the house",
      "and blessings come to stay.",
    ],
    close: ["Light within, light all around,", "this Diwali and always."],
    wish: "A Diwali wish for you",
  },
  onam: {
    cover: ["Happy Onam", "a harvest of happiness"],
    kicker: "The festival of harvest", title: "A little Onam wish",
    verse: [
      "May your pookalam bloom in every colour,",
      "may the sadya never end,",
      "may Maveli find your home full",
      "of family and friends.",
    ],
    close: ["Abundance on your table,", "and joy in every heart."],
    wish: "An Onam wish for you",
  },
  pongal: {
    cover: ["Happy Pongal", "may it overflow with joy"],
    kicker: "The festival of harvest", title: "A little Pongal wish",
    verse: [
      "As the pot boils over with sweetness,",
      "may your days do just the same,",
      "with sunshine on the fields you sow",
      "and good fortune in your name.",
    ],
    close: ["Pongalo Pongal!", "A sweet and golden year to you."],
    wish: "A Pongal wish for you",
  },
  "raksha-bandhan": {
    cover: ["Happy Raksha Bandhan", "a thread that never breaks"],
    kicker: "A bond like no other", title: "For my favourite sibling",
    verse: [
      "Through every fight and every secret,",
      "every laugh we couldn't hide,",
      "you've been my first best friend",
      "and always on my side.",
    ],
    close: ["One small thread,", "a lifetime of love."],
    wish: "A Rakhi wish for you",
  },
  eid: {
    cover: ["Eid Mubarak", "peace, joy and blessings"],
    kicker: "A blessed celebration", title: "A little Eid wish",
    verse: [
      "May the crescent bring you peace,",
      "may your prayers all be heard,",
      "may your table be full of loved ones",
      "and your heart full of kind words.",
    ],
    close: ["Wishing you and yours", "a joyful, blessed Eid."],
    wish: "An Eid wish for you",
  },
  holi: {
    cover: ["Happy Holi", "life in every colour"],
    kicker: "The festival of colours", title: "A little Holi wish",
    verse: [
      "May pink bring you laughter,",
      "may yellow bring you sun,",
      "may green bring something new to grow",
      "and blue bring calm when day is done.",
    ],
    close: ["Bura na mano, Holi hai!", "A bright and colourful year to you."],
    wish: "A Holi wish for you",
  },
  "birthday-wish": {
    cover: ["Happy Birthday", "today is all about you"],
    kicker: "Another trip around the sun", title: "A little birthday wish",
    verse: [
      "May your cake be extra sweet,",
      "may your wishes all come true,",
      "may this year bring all the happiness",
      "you so often give others too.",
    ],
    close: ["Here's to you,", "and everything still to come."],
    wish: "A birthday wish for you",
  },
  "anniversary-wish": {
    cover: ["Happy Anniversary", "here's to the two of you"],
    kicker: "Another year together", title: "A little anniversary wish",
    verse: [
      "For every morning shared,",
      "every storm you've weathered through,",
      "may love keep finding new ways",
      "to surprise the two of you.",
    ],
    close: ["Here's to the years behind you", "and all the ones ahead."],
    wish: "An anniversary wish for you",
  },
  "thank-you": {
    cover: ["Thank You", "from the bottom of my heart"],
    kicker: "With gratitude", title: "A little thank-you",
    verse: [
      "For the kindness you didn't have to give,",
      "the help you never weighed,",
      "for showing up when it mattered,",
      "and every difference you made.",
    ],
    close: ["Some people make the world softer.", "You are one of them."],
    wish: "A note of thanks for you",
  },
  "get-well": {
    cover: ["Get Well Soon", "sending you all my love"],
    kicker: "Thinking of you", title: "A little get-well wish",
    verse: [
      "Rest up and take it slowly,",
      "let the days be calm and kind,",
      "with warm tea, good books and sunshine",
      "and nothing on your mind.",
    ],
    close: ["Feel better soon.", "We're all rooting for you."],
    wish: "A get-well wish for you",
  },
  congratulations: {
    cover: ["Congratulations", "you did it"],
    kicker: "A moment worth celebrating", title: "A little note of cheer",
    verse: [
      "All the work and all the waiting,",
      "every late night on the way,",
      "led you here to something wonderful.",
      "Take a bow, it's your day.",
    ],
    close: ["So proud of you,", "and so excited for what's next."],
    wish: "A note of cheer for you",
  },
  farewell: {
    cover: ["Farewell", "until we meet again"],
    kicker: "A new chapter", title: "A little goodbye",
    verse: [
      "It won't be quite the same without you,",
      "the laughs, the chats, the cheer,",
      "but wherever the road takes you,",
      "you'll always have friends here.",
    ],
    close: ["Go well, go far,", "and keep in touch."],
    wish: "A farewell wish for you",
  },
};

export function cardWords(slug, name = "") {
  return CARD_WORDS[slug] || {
    cover: [name || "With love", "a little something for you"],
    kicker: "Thinking of you", title: "A little wish",
    verse: [
      "May today bring a reason to smile,",
      "and tomorrow bring two more,",
      "may the good things find you easily",
      "and kindness meet you at the door.",
    ],
    close: ["With love,", "today and always."],
    wish: "A wish just for you",
  };
}
