// Every player gets a cute animal name derived from their anonymous visitor
// hash: nothing to type, nothing to moderate, and the same person is always
// the same animal. Never stored — recomputed wherever it's shown.
export const ADJECTIVES = [
  'Cute', 'Fluffy', 'Sleepy', 'Tiny', 'Bouncy', 'Cheeky', 'Snuggly', 'Wobbly', 'Giggly', 'Fuzzy',
  'Sunny', 'Dozy', 'Plucky', 'Squishy', 'Zippy', 'Humble', 'Chubby', 'Dreamy', 'Jolly', 'Perky',
  'Peppy', 'Cosy', 'Dainty', 'Merry', 'Nifty', 'Silly', 'Sparkly', 'Toasty', 'Wiggly', 'Bubbly',
  'Cuddly', 'Dizzy', 'Frisky', 'Gentle', 'Happy', 'Lucky', 'Mellow', 'Nimble', 'Rosy', 'Sprightly',
] as const;

export const ANIMALS = [
  'Panda', 'Hedgehog', 'Otter', 'Bunny', 'Penguin', 'Kitten', 'Duckling', 'Koala', 'Fox', 'Hamster',
  'Seal', 'Lamb', 'Owl', 'Axolotl', 'Capybara', 'Quokka', 'Red Panda', 'Corgi', 'Puppy', 'Piglet',
  'Fawn', 'Chick', 'Sloth', 'Squirrel', 'Raccoon', 'Hippo', 'Llama', 'Alpaca', 'Chinchilla', 'Ferret',
  'Gecko', 'Turtle', 'Frog', 'Bee', 'Ladybug', 'Koi', 'Puffin', 'Wombat', 'Meerkat', 'Lemur',
] as const;

const index = (hex: string, size: number) => {
  const n = parseInt(hex, 16);
  return Number.isNaN(n) ? 0 : n % size;
};

export function animalName(hash: string): string {
  return `${ADJECTIVES[index(hash.slice(0, 4), ADJECTIVES.length)]} ${ANIMALS[index(hash.slice(4, 8), ANIMALS.length)]}`;
}
