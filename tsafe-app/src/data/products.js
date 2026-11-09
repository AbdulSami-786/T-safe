// Static product content (copy, images, colours). Prices & stock are overridden
// by the "Products" sheet when the Google Sheet backend is connected.

export const FREE_DELIVERY_FROM = 999;
export const DELIVERY_FEE = 200;

export const PAYMENT_METHODS = [
  { id: 'easypaisa', name: 'Easypaisa', number: '03303166153', holder: 'Muhammad Ahmed', cls: 'w-green', icon: 'wallet' },
  { id: 'jazzcash', name: 'Jazzcash', number: '03303166153', holder: 'Muhammad Ahmed', cls: 'w-red', icon: 'wallet' },
  {
    id: 'meezan',
    name: 'Meezan Bank',
    holder: 'MUHAMMAD AHMED (Asaan A/C)',
    iban: 'PK89 MEZN 0001 2201 1586 0693',
    account: '01220115860693',
    cls: 'w-purple bank',
    icon: 'bank',
  },
];

export const STATUS_STEPS = [
  { key: 'Order Placed', icon: 'clipboard', sub: 'We’ve received your order' },
  { key: 'Payment Verified', icon: 'wallet', sub: 'Proof of payment confirmed' },
  { key: 'Packed', icon: 'box', sub: 'Carefully packed and sealed' },
  { key: 'Out For Delivery', icon: 'truck', sub: 'On its way to you' },
  { key: 'Delivered', icon: 'smile', sub: 'Enjoy your new smile' },
];

export const PRODUCTS = {
  nano: {
    id: 'nano',
    name: 'Nano Toothbrush With Travel Case',
    series: 'Value-Saver Series',
    mrp: 900,
    price: 450,
    thumb: '/assets/nano-case-black.jpeg',
    colors: [
      { name: 'White', hex: '#ffffff', thumb: '/assets/nano-case-black.jpeg' },
      { name: 'Black', hex: '#111111', thumb: '/assets/nano-case-black.jpeg' },
      { name: 'Green', hex: '#a8bfa2', thumb: '/assets/nano-case-black.jpeg' },
      { name: 'Pink', hex: '#f4a9c0', thumb: '/assets/nano-case-black.jpeg' },
    ],
    desc: {
      title: 'Experience a New Standard of Everyday Oral Care.',
      paras: [
        'Elevate your daily brushing routine with the T-Safe Nano Toothbrush, designed for those who appreciate comfort, precision, and effortless oral care. Featuring a dense, finely crafted bristle design and a convenient travel case, it delivers a thorough brushing experience while helping remove plaque and food particles from your teeth.',
        'Whether you’re starting your day at home or freshening up on the go, the T-Safe Nano Toothbrush keeps your oral care routine convenient and organized. The included travel case helps protect your toothbrush while travelling, commuting, or staying overnight.',
      ],
      whyTitle: 'Why Choose T-Safe Nano Toothbrush?',
      why: [
        ['Ultra-Fine Bristles:', 'Designed to provide a gentle, thorough brushing experience for your daily oral care routine.'],
        ['Comfortable Brushing Experience:', 'Features soft bristles designed to be gentle on gums while providing comfortable everyday cleaning.'],
        ['Travel-Friendly:', 'Comes with a convenient travel case to keep your toothbrush covered and easy to carry when travelling, commuting, or staying overnight.'],
        ['Thoughtful Design:', 'Features an ultra-compact design for convenient handling and easy storage.'],
        ['Everyday Convenience:', 'Built for better oral health, making it a practical choice for your daily oral care routine at home or on the go.'],
      ],
      quote: 'A Small Change. A Big Difference.',
      closing: 'Make every brushing experience count with T-Safe Nano Toothbrush — where thoughtful design meets everyday dental care.',
    },
  },
  tongue: {
    id: 'tongue',
    name: 'Essential Tongue Cleaner',
    series: 'Value-Saver Series',
    mrp: 999,
    price: 500,
    thumb: '/assets/tongue-cleaner.jpeg',
    colors: [],
    desc: {
      title: 'Essential Care. Exceptional Value.',
      paras: [
        'Make tongue cleaning a simple part of your daily oral care routine with the T-Safe Essential Tongue Cleaner. Designed for everyday convenience, it helps remove bacteria, residue, and surface buildup from the tongue, leaving your mouth feeling cleaner and fresher.',
        'Practical, easy to use, and budget-friendly, the T-Safe Essential Tongue Cleaner combines everyday functionality with excellent value for money.',
      ],
      whyTitle: 'Why Choose T-Safe Essential Tongue Cleaner?',
      why: [
        ['Effective Tongue Cleaning:', 'Helps remove bacteria, residue, and surface buildup from the tongue for a cleaner mouth.'],
        ['Fresher Breath:', 'Helps reduce tongue buildup that can contribute to bad breath.'],
        ['Easy to Use:', 'Designed for a simple and convenient daily tongue-cleaning routine.'],
        ['Supports Better Oral Health:', 'Complements your daily oral hygiene routine by helping keep your tongue clean.'],
        ['Value for Money:', 'Enjoy essential oral care at an affordable price without compromising on everyday convenience.'],
        ['Everyday Essential:', 'A practical addition to your daily oral hygiene routine, designed for gentle and safe use when used as directed.'],
      ],
      quote: 'Small Habit. Big Difference.',
      closing: 'Small steps can make a difference to your oral hygiene routine. Make tongue cleaning a daily habit with the T-Safe Essential Tongue Cleaner.',
    },
  },
  aura: {
    id: 'aura',
    name: 'Soft Aura 15K Toothbrush',
    series: 'LUXE-Premium Series',
    mrp: 1999,
    price: 999,
    thumb: '/assets/luxe-brush-black.jpeg',
    colors: [
      { name: 'Jazz White', hex: '#ffffff', thumb: '/assets/luxe-brush-white.jpeg' },
      { name: 'Attitude Black', hex: '#0b0b0d', thumb: '/assets/luxe-brush-black.jpeg' },
    ],
    desc: {
      title: 'Experience the Softness. Discover the Difference.',
      paras: [
        'Transform your daily brushing routine with the T-Safe Soft Aura 15K Toothbrush, designed for those who appreciate a gentle, comfortable, and refined oral care experience.',
        'Featuring an impressive 15,000+ ultra-soft bristles, this toothbrush offers a dense brushing surface designed to provide extensive contact with your teeth and gums. Its exceptionally soft bristles help remove plaque and food particles while delivering a smooth brushing experience.',
        'Combining thoughtful design with daily functionality, Soft Aura 15K brings a new level of comfort and sophistication to your oral care routine.',
      ],
      whyTitle: 'Why Choose Soft Aura 15K?',
      why: [
        ['15,000+ Ultra-Soft Bristles:', 'A densely packed bristle surface designed for gentle, thorough daily cleaning.'],
        ['Gentle on Gums:', 'Soft bristles provide a comfortable brushing experience when used with proper technique.'],
        ['Enhanced Surface Coverage:', 'The dense bristle arrangement helps provide extensive contact with tooth surfaces.'],
        ['Ergonomic Handle:', 'Designed to provide a comfortable grip and better handling during brushing.'],
        ['Daily Oral Care:', 'Designed to make your daily brushing routine more comfortable and enjoyable.'],
      ],
      quote: 'Advanced Oral Care. Refined.',
      closing: 'Give your daily oral care routine the attention it deserves with the T-Safe Soft Aura 15K Toothbrush. Discover the beauty of ultra-soft brushing, where thoughtful design meets daily dental care.',
    },
  },
  bundle: {
    id: 'bundle',
    name: 'Brush + Clean Bundle',
    series: 'Bundle Packages',
    mrp: 1900,
    price: 900,
    thumb: '/assets/nano-tray.jpeg',
    colors: [
      { name: 'White', hex: '#ffffff', thumb: '/assets/nano-tray.jpeg' },
      { name: 'Black', hex: '#111111', thumb: '/assets/nano-tray.jpeg' },
      { name: 'Green', hex: '#a8bfa2', thumb: '/assets/nano-tray.jpeg' },
      { name: 'Pink', hex: '#f4a9c0', thumb: '/assets/nano-tray.jpeg' },
    ],
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export const REVIEW_PLACEHOLDERS = [
  { id: 'p1', rating: 5, title: 'Very Good', text: '', name: 'Verified Customer' },
  { id: 'p2', rating: 5, title: 'Very Good', text: '', name: 'Verified Customer' },
  { id: 'p3', rating: 4, title: 'Good', text: '', name: 'Verified Customer' },
];
