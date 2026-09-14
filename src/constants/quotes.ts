export interface Quote {
  id: number;
  quote: string;
  author: string;
  category: 'perseverance' | 'innovation' | 'mindset' | 'growth' | 'mastery';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    id: 1,
    quote: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
    category: 'perseverance',
  },
  {
    id: 2,
    quote: "It always seems impossible until it's done.",
    author: 'Nelson Mandela',
    category: 'mindset',
  },
  {
    id: 3,
    quote: 'Quality is not an act, it is a habit.',
    author: 'Aristotle',
    category: 'mastery',
  },
  {
    id: 4,
    quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    category: 'perseverance',
  },
  {
    id: 5,
    quote: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
    category: 'innovation',
  },
  {
    id: 6,
    quote: 'Do what you can, with what you have, where you are.',
    author: 'Theodore Roosevelt',
    category: 'mindset',
  },
  {
    id: 7,
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    category: 'mastery',
  },
  {
    id: 8,
    quote: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
    category: 'innovation',
  },
  {
    id: 9,
    quote: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
    category: 'growth',
  },
  {
    id: 10,
    quote: 'The only limit to our realization of tomorrow will be our doubts of today.',
    author: 'Franklin D. Roosevelt',
    category: 'mindset',
  },
  {
    id: 11,
    quote: "Focus is a matter of deciding what things you're not going to do.",
    author: 'John Carmack',
    category: 'mastery',
  },
  {
    id: 12,
    quote: "Code is like humor. When you have to explain it, it's bad.",
    author: 'Cory House',
    category: 'mastery',
  },
  {
    id: 13,
    quote: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    category: 'innovation',
  },
  {
    id: 14,
    quote: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
    category: 'growth',
  },
  {
    id: 15,
    quote: "Believe you can and you're halfway there.",
    author: 'Theodore Roosevelt',
    category: 'mindset',
  },
  {
    id: 16,
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: 'Sam Levenson',
    category: 'perseverance',
  },
  {
    id: 17,
    quote: 'Experience is simply the name we give our mistakes.',
    author: 'Oscar Wilde',
    category: 'growth',
  },
  {
    id: 18,
    quote: 'The function of good software is to make the complex appear simple.',
    author: 'Grady Booch',
    category: 'mastery',
  },
  {
    id: 19,
    quote: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    category: 'innovation',
  },
  {
    id: 20,
    quote: 'Strive not to be a success, but rather to be of value.',
    author: 'Albert Einstein',
    category: 'mindset',
  },
  {
    id: 21,
    quote: 'Continuous improvement is better than delayed perfection.',
    author: 'Mark Twain',
    category: 'growth',
  },
  {
    id: 22,
    quote: "Everything you've ever wanted is on the other side of fear.",
    author: 'George Addair',
    category: 'perseverance',
  },
  {
    id: 23,
    quote: 'There are two ways to write error-free programs; only the third one works.',
    author: 'Alan J. Perlis',
    category: 'mastery',
  },
  {
    id: 24,
    quote: 'Knowledge is power, but enthusiasm pulls the switch.',
    author: 'Ivern Ball',
    category: 'mindset',
  },
  {
    id: 25,
    quote: 'Great things are done by a series of small things brought together.',
    author: 'Vincent Van Gogh',
    category: 'growth',
  },
  {
    id: 26,
    quote: 'Clean code always looks like it was written by someone who cares.',
    author: 'Robert C. Martin',
    category: 'mastery',
  },
  {
    id: 27,
    quote: "Your time is limited, so don't waste it living someone else's life.",
    author: 'Steve Jobs',
    category: 'mindset',
  },
  {
    id: 28,
    quote: 'The future belongs to those who learn more skills and combine them in creative ways.',
    author: 'Robert Greene',
    category: 'innovation',
  },
  {
    id: 29,
    quote:
      'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
    author: 'Antoine de Saint-Exupéry',
    category: 'mastery',
  },
  {
    id: 30,
    quote: 'Doubt kills more dreams than failure ever will.',
    author: 'Suzy Kassem',
    category: 'perseverance',
  },
  {
    id: 31,
    quote:
      'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
    category: 'mastery',
  },
  {
    id: 32,
    quote: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    category: 'mindset',
  },
  {
    id: 33,
    quote: 'If you cannot do great things, do small things in a great way.',
    author: 'Napoleon Hill',
    category: 'growth',
  },
  {
    id: 34,
    quote: 'The mind is everything. What you think you become.',
    author: 'Buddha',
    category: 'mindset',
  },
  {
    id: 35,
    quote: 'Errors using inadequate data are much less than those using no data at all.',
    author: 'Charles Babbage',
    category: 'innovation',
  },
  {
    id: 36,
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: 'Zig Ziglar',
    category: 'perseverance',
  },
  {
    id: 37,
    quote: 'Wisdom is not a product of schooling but of the lifelong attempt to acquire it.',
    author: 'Albert Einstein',
    category: 'growth',
  },
  {
    id: 38,
    quote: 'A subtle thought that is in error may yet give rise to fruitful inquiry.',
    author: 'Enrico Fermi',
    category: 'innovation',
  },
  {
    id: 39,
    quote: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
    category: 'mastery',
  },
  {
    id: 40,
    quote:
      'Opportunity is missed by most people because it is dressed in overalls and looks like work.',
    author: 'Thomas Edison',
    category: 'perseverance',
  },
  {
    id: 41,
    quote:
      'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    category: 'mastery',
  },
  { id: 42, quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs', category: 'mindset' },
  {
    id: 43,
    quote: 'Failure is simply the opportunity to begin again, this time more intelligently.',
    author: 'Henry Ford',
    category: 'growth',
  },
  {
    id: 44,
    quote: 'Success usually comes to those who are too busy to be looking for it.',
    author: 'Henry David Thoreau',
    category: 'perseverance',
  },
  {
    id: 45,
    quote: 'Design is not just what it looks like and feels like. Design is how it works.',
    author: 'Steve Jobs',
    category: 'innovation',
  },
  { id: 46, quote: 'Mastery requires patience.', author: 'Robert Greene', category: 'mastery' },
  { id: 47, quote: 'Turn your wounds into wisdom.', author: 'Oprah Winfrey', category: 'growth' },
  {
    id: 48,
    quote: 'The goal is not to be better than the other man, but your previous self.',
    author: 'Dalai Lama',
    category: 'mindset',
  },
  {
    id: 49,
    quote: 'Refactoring is like cleaning up the kitchen as you cook.',
    author: 'Martin Fowler',
    category: 'mastery',
  },
  { id: 50, quote: 'What we think, we become.', author: 'Buddha', category: 'mindset' },
  {
    id: 51,
    quote:
      'To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.',
    author: 'Ralph Waldo Emerson',
    category: 'mindset',
  },
  {
    id: 52,
    quote:
      'Endurance is one of the most difficult disciplines, but it is to the one who endures that the final victory comes.',
    author: 'Buddha',
    category: 'perseverance',
  },
  {
    id: 53,
    quote: 'Ideas are easy. Implementation is hard.',
    author: 'Guy Kawasaki',
    category: 'innovation',
  },
  {
    id: 54,
    quote: "You miss 100% of the shots you don't take.",
    author: 'Wayne Gretzky',
    category: 'perseverance',
  },
  {
    id: 55,
    quote: 'Computers are fast; developers keep them slow.',
    author: 'Anonymous',
    category: 'mastery',
  },
  {
    id: 56,
    quote: 'Hard work beats talent when talent fails to work hard.',
    author: 'Tim Notke',
    category: 'perseverance',
  },
  {
    id: 57,
    quote: 'Focus on being productive instead of busy.',
    author: 'Tim Ferriss',
    category: 'mastery',
  },
  {
    id: 58,
    quote: 'Do not wait to strike till the iron is hot; but make it hot by striking.',
    author: 'William Butler Yeats',
    category: 'innovation',
  },
  {
    id: 59,
    quote: 'Consistency is what transforms average into excellence.',
    author: 'Anonymous',
    category: 'growth',
  },
  {
    id: 60,
    quote:
      'The illiterate of the 21st century will not be those who cannot read and write, but those who cannot learn, unlearn, and relearn.',
    author: 'Alvin Toffler',
    category: 'growth',
  },
  {
    id: 61,
    quote: 'Courage is resistance to fear, mastery of fear—not absence of fear.',
    author: 'Mark Twain',
    category: 'mindset',
  },
  {
    id: 62,
    quote: 'Code clean, think deep, build fast.',
    author: 'DevStream',
    category: 'mastery',
  },
  {
    id: 63,
    quote: 'The hardship you are enduring today will be the strength you feel tomorrow.',
    author: 'Anonymous',
    category: 'perseverance',
  },
  {
    id: 64,
    quote: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
    category: 'growth',
  },
  {
    id: 65,
    quote: 'Great software requires great passion.',
    author: 'Linus Torvalds',
    category: 'innovation',
  },
  {
    id: 66,
    quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Will Durant',
    category: 'mastery',
  },
  {
    id: 67,
    quote: 'Fall seven times and stand up eight.',
    author: 'Japanese Proverb',
    category: 'perseverance',
  },
  {
    id: 68,
    quote: 'Your passion is waiting for your courage to catch up.',
    author: 'Isabelle Lafleche',
    category: 'mindset',
  },
  {
    id: 69,
    quote: 'If you want to go fast, go alone. If you want to go far, go together.',
    author: 'African Proverb',
    category: 'growth',
  },
  {
    id: 70,
    quote: "The more I learn, the more I realize how much I don't know.",
    author: 'Albert Einstein',
    category: 'growth',
  },
  {
    id: 71,
    quote: 'Every genius was once an amateur.',
    author: 'Robin Sharma',
    category: 'perseverance',
  },
  {
    id: 72,
    quote: 'Simplicity is the soul of efficiency.',
    author: 'Austin Freeman',
    category: 'mastery',
  },
  {
    id: 73,
    quote: 'Patience, persistence and perspiration make an unbeatable combination for success.',
    author: 'Napoleon Hill',
    category: 'perseverance',
  },
  { id: 74, quote: 'Dream big and dare to fail.', author: 'Norman Vaughan', category: 'mindset' },
  {
    id: 75,
    quote: 'The secret to mastery is intense, focused practice.',
    author: 'Robert Greene',
    category: 'mastery',
  },
  {
    id: 76,
    quote: 'Code is a powerful medium for human expression.',
    author: 'Dan Abramov',
    category: 'innovation',
  },
  {
    id: 77,
    quote: 'Do one thing every day that scares you.',
    author: 'Eleanor Roosevelt',
    category: 'growth',
  },
  {
    id: 78,
    quote: 'Build things that matter to people.',
    author: 'Paul Graham',
    category: 'innovation',
  },
  {
    id: 79,
    quote: "Success isn't always about greatness. It's about consistency.",
    author: 'Dwayne Johnson',
    category: 'growth',
  },
  {
    id: 80,
    quote: 'The harder I work, the luckier I get.',
    author: 'Samuel Goldwyn',
    category: 'perseverance',
  },
  {
    id: 81,
    quote: 'Everything is hard before it is easy.',
    author: 'Thomas Fuller',
    category: 'growth',
  },
  {
    id: 82,
    quote: 'Learn the rules like a pro, so you can break them like an artist.',
    author: 'Pablo Picasso',
    category: 'mastery',
  },
  {
    id: 83,
    quote: 'Hustle in silence and let your success make the noise.',
    author: 'Anonymous',
    category: 'perseverance',
  },
  {
    id: 84,
    quote: 'Software is eating the world, build the tools of tomorrow.',
    author: 'Marc Andreessen',
    category: 'innovation',
  },
  {
    id: 85,
    quote: "The struggle you're in today is developing the strength you need for tomorrow.",
    author: 'Robert Tew',
    category: 'perseverance',
  },
  {
    id: 86,
    quote: 'Focus on the process, not just the outcome.',
    author: 'James Clear',
    category: 'mastery',
  },
  {
    id: 87,
    quote: "Be so good they can't ignore you.",
    author: 'Steve Martin',
    category: 'mastery',
  },
  {
    id: 88,
    quote: 'Growth begins at the end of your comfort zone.',
    author: 'Neale Donald Walsch',
    category: 'growth',
  },
  {
    id: 89,
    quote: 'Create with the heart; build with the mind.',
    author: 'Criss Jami',
    category: 'innovation',
  },
  {
    id: 90,
    quote: 'Small choices make big differences.',
    author: 'James Clear',
    category: 'growth',
  },
  {
    id: 91,
    quote: 'The only person you are destined to become is the person you decide to be.',
    author: 'Ralph Waldo Emerson',
    category: 'mindset',
  },
  {
    id: 92,
    quote: 'Never give up on a dream just because of the time it will take to accomplish it.',
    author: 'Earl Nightingale',
    category: 'perseverance',
  },
  {
    id: 93,
    quote: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
    category: 'mastery',
  },
  {
    id: 94,
    quote: 'Your attitude determines your direction.',
    author: 'Anonymous',
    category: 'mindset',
  },
  {
    id: 95,
    quote: 'Efficiency is doing things right; effectiveness is doing the right things.',
    author: 'Peter Drucker',
    category: 'mastery',
  },
  {
    id: 96,
    quote:
      "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying 'I will try again tomorrow.'",
    author: 'Mary Anne Radmacher',
    category: 'perseverance',
  },
  {
    id: 97,
    quote: 'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
    category: 'mastery',
  },
  {
    id: 98,
    quote: 'Continuous effort—not strength or intelligence—is the key to unlocking our potential.',
    author: 'Winston Churchill',
    category: 'growth',
  },
  {
    id: 99,
    quote: 'Ship fast, iterate continuously, aim for excellence.',
    author: 'NextEngine',
    category: 'innovation',
  },
  {
    id: 100,
    quote: 'You are capable of more than you know. Keep building, keep growing, keep striving.',
    author: 'DevStream Community',
    category: 'growth',
  },
];

export function getQuoteForDay(date: Date = new Date()): Quote {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}
