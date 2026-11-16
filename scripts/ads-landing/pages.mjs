// Content for the three Google Ads landing pages.
// Shared sections (trust bar, size guide, why PurpleBox, how it works, reviews,
// final CTA, contact) live in template.mjs. Only the parts the brief marks as
// "customise per page" are here: hero, unit details, targeted content, FAQs.

// All 8 units. Prices per 4 weeks, from book-unit.html.
// `slug` is the anchor on unit-details.html where online reservation starts.
export const UNITS = {
  10: { code: 'XS', price: 330, fits: 'Compact, secure & affordable', slug: 'unit-xs' },
  25: { code: 'S', price: 625, fits: 'Boxes, luggage & personal belongings', slug: 'unit-ss' },
  35: { code: 'M', price: 770, fits: 'Furniture, boxes & household items', slug: 'unit-m35' },
  50: { code: 'L', price: 975, fits: 'Furniture, boxes & household belongings', slug: 'unit-s50' },
  75: { code: 'XL', price: 1400, fits: 'Furniture, appliances & moving boxes', slug: 'unit-m75' },
  100: { code: 'XXL', price: 1650, fits: 'Furniture, appliances & household belongings', slug: 'unit-l' },
  150: { code: '3XL', price: 2700, fits: 'Full homes, villas & furniture', slug: 'unit-xl' },
  200: { code: '4XL', price: 3100, fits: 'Villas, large homes & business inventory', slug: 'unit-xxl' },
};

export const PAGES = [
  {
    file: 'self-storage-units-dubai.html',
    pageName: 'Ads LP - Self Storage Units Dubai',
    title: 'Self Storage Units in Dubai from AED 330 | PurpleBox Al Quoz',
    description:
      'Secure, air-conditioned self storage units in Dubai from 10 to 200 sq ft. 24/7 access, CCTV, pickup available. From AED 330 per 4 weeks, no setup fees.',
    storingFor: 'Personal',
    hero: {
      eyebrow: 'Self storage · ABA Avenue, Al Quoz 2',
      h1: 'Secure Self Storage Units in Dubai',
      lead: 'Air-conditioned units from 10 to 200 sq ft. Flexible 4-week billing, 24/7 access and pickup available.',
      primary: { label: 'Reserve your unit', href: '#units', track: 'reserve_click' },
      waMsg: "Hi PurpleBox, I'd like help choosing a self storage unit.",
    },
    form: { businessName: false, submit: 'Get my free quote' },
    targeted: {
      h2: 'Extra space for whatever you need to store',
      sub: 'One facility in Al Quoz, units sized from a closet to a villa.',
      cards: [
        ['Personal belongings', 'Keep your home clutter-free.'],
        ['Furniture & appliances', 'Air-conditioned, protected from Dubai heat.'],
        ['Boxes & luggage', 'Seasonal items and suitcases.'],
        ['Business inventory', 'Stock and equipment, easy access.'],
        ['Documents & supplies', 'Dry, humidity-controlled space.'],
        ['Between moves', 'Short or long term, your choice.'],
      ],
      chipsLabel: 'Sized for',
      chips: ['Studio', '1BHK', '2BHK', 'Villa', 'Office'],
    },
    units: {
      h2: 'Choose your unit',
      sizes: [10, 25, 50, 100, 200],
      bestFit: [25, 50],
    },
    faqs: [
      ['How is storage priced?', 'Every 4 weeks, by unit size. No setup or admin fees. VAT at the standard UAE rate.'],
      ['What’s the minimum period?', '1-week minimum stay, billed every 4 weeks. Cancel any time with 14 days’ notice.'],
      ['Can I access my unit at any time?', 'Yes, access is 24/7 with elevators on site.'],
      ['Are units climate-controlled?', 'All units have AC and humidity control, with 24/7 CCTV.'],
      ['Where is PurpleBox located?', 'ABA Avenue, Unit 12, 12th St, Al Quoz 2, Dubai.'],
    ],
    finalCta: { h2: 'Need extra space? Find your unit today.' },
  },

  {
    file: 'household-storage-dubai.html',
    pageName: 'Ads LP - Household Storage Dubai',
    title: 'Furniture & Household Storage in Dubai | PurpleBox Al Quoz',
    description:
      'Store your sofa, bed, appliances and boxes in air-conditioned units in Al Quoz. Pickup across Dubai, 24/7 access. From AED 330 per 4 weeks, 1-week minimum.',
    storingFor: 'Personal',
    hero: {
      eyebrow: 'Furniture & household storage · Al Quoz',
      h1: 'Furniture & Household Storage in Dubai',
      lead: 'Store your sofa, bed, appliances and boxes in air-conditioned units. Pickup available across Dubai.',
      primary: { label: 'Get my storage quote', href: '#quote', track: 'quote_click' },
      waMsg: "Hi PurpleBox, I'd like a quote to store my furniture and household items.",
    },
    form: { businessName: false, submit: 'Get my free quote' },
    targeted: {
      h2: 'Store your home, not your stress',
      sub: 'Protected from Dubai heat and humidity, for a week or a year.',
      cards: [
        ['Sofas & chairs', 'Clean, dry, air-conditioned.'],
        ['Beds & mattresses', 'Kept fresh between moves.'],
        ['Wardrobes & tables', 'Large pieces fit easily.'],
        ['Home appliances', 'Fridges, washers, TVs.'],
        ['Moving boxes', 'Stack and label with our supplies.'],
        ['Seasonal items', 'Fans, decor, sports gear.'],
      ],
      chipsLabel: 'Popular for',
      chips: ['Moving home', 'Renovating', 'Between rentals', 'Decluttering', 'Relocating', 'Extra furniture'],
    },
    units: {
      h2: 'Sizes for your home',
      sizes: [25, 35, 50, 75, 100],
      bestFit: [35, 50, 75],
    },
    faqs: [
      ['How is storage priced?', 'Every 4 weeks, by unit size. No setup or admin fees. VAT at the standard UAE rate.'],
      ['What’s the minimum period?', '1-week minimum stay, billed every 4 weeks. Cancel any time with 14 days’ notice.'],
      ['Can I store furniture during a renovation?', 'Yes. Rent for as short as one week and extend as needed.'],
      ['Can I store a sofa, bed and wardrobe?', 'Yes. 50 to 75 sq ft usually fits a 1 to 2 bedroom apartment. Try the <a href="estimator.html">size estimator</a> to check.'],
      ['Can you pick up from my home?', 'Yes. Send your address and item list on WhatsApp for a quote.'],
    ],
    finalCta: { h2: 'Make room at home. Reserve your unit.' },
  },

  {
    file: 'business-storage-dubai.html',
    pageName: 'Ads LP - Business Storage Dubai',
    title: 'Business Storage Units in Dubai | Inventory & Stock | PurpleBox',
    description:
      'Flexible business storage in Al Quoz for e-commerce stock, retail inventory, office equipment and documents. 24/7 access, elevators, CCTV. From AED 330 per 4 weeks.',
    storingFor: 'Business',
    hero: {
      eyebrow: 'Business storage · Al Quoz',
      h1: 'Flexible Business Storage Units in Dubai',
      lead: 'Keep inventory, e-commerce stock and equipment close, without renting a full warehouse.',
      primary: { label: 'Get a business quote', href: '#quote', track: 'quote_click' },
      waMsg: "Hi PurpleBox, I'd like a quote for business storage.",
    },
    form: { businessName: true, submit: 'Request business quote' },
    targeted: {
      h2: 'More space to run your business',
      sub: 'Units with 24/7 access, elevators and CCTV.',
      cards: [
        ['E-commerce inventory', 'Stock close to your dispatch.'],
        ['Retail stock', 'Seasonal and overflow stock.'],
        ['Office equipment', 'Furniture, IT and supplies.'],
        ['Documents & supplies', 'Dry, secure archive space.'],
        ['Seasonal stock', 'Scale space up and down.'],
        ['Contractor tools', 'Equipment, always accessible.'],
      ],
      chipsLabel: 'Used by',
      chips: ['E-commerce sellers', 'Small retailers', 'Contractors', 'Online businesses', 'Seasonal stock'],
    },
    units: {
      h2: 'Sizes for business stock',
      sizes: [50, 75, 100, 150, 200],
      bestFit: [100, 150, 200],
    },
    faqs: [
      ['How is storage priced?', 'Every 4 weeks, by unit size. No setup or admin fees. VAT at the standard UAE rate.'],
      ['What’s the minimum period?', '1-week minimum stay, billed every 4 weeks. Cancel any time with 14 days’ notice.'],
      ['What is the largest unit?', '200 sq ft is our largest single unit. Need more room than that? WhatsApp us and we will work out the best option with you.'],
      // Held back until PurpleBox confirms the answers (marked [CONFIRM] in the brief).
      // Move each into the list above once the wording is approved:
      // ['Can I store e-commerce inventory?', '<permitted goods and any restrictions>'],
      // ['Can I change size as I grow?', '<upgrade process>'],
    ],
    finalCta: { h2: 'Free up your business. Get a quote today.' },
  },
];
