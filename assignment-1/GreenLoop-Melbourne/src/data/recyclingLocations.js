export const recyclingLocations = [
  {
    id: 'monash-recycling-and-waste-centre',
    name: 'Monash Recycling and Waste Centre',
    suburb: 'Notting Hill',
    postcode: '3168',
    address: '380 Ferntree Gully Road, Notting Hill VIC 3168',
    coordinates: { latitude: -37.901652, longitude: 145.1403698 },
    acceptedMaterials: [
      'Batteries',
      'Paint',
      'Cardboard',
      'E-waste',
      'Soft plastics',
      'Clean white polystyrene',
    ],
    description:
      'Council recycling and waste centre open to the public. Resident pricing and some free drop-offs require proof of Monash residency or ratepayer status.',
    sourceName: 'City of Monash',
    sourceUrl:
      'https://www.monash.vic.gov.au/Waste-Sustainability/Monash-Recycling-Waste-Centre',
  },
  {
    id: 'whitehorse-recycling-and-waste-centre',
    name: 'Whitehorse Recycling and Waste Centre',
    suburb: 'Vermont South',
    postcode: '3133',
    address: 'Corner of Burwood Highway and Morack Road, Vermont South VIC 3133',
    coordinates: { latitude: -37.861675, longitude: 145.1966322 },
    acceptedMaterials: [
      'Cardboard',
      'Household and vehicle batteries',
      'Light bulbs and fluorescent tubes',
      'Glass bottles and jars',
      'Metals',
      'Paint',
      'E-waste',
      'Bicycles',
    ],
    description:
      'Council facility for recycling and disposal of general or bulky non-hazardous waste. Fees apply to some materials.',
    sourceName: 'Whitehorse City Council',
    sourceUrl:
      'https://www.whitehorse.vic.gov.au/waste-environment/rubbish-and-recycling/recycling-and-waste-centre',
  },
  {
    id: 'port-phillip-resource-recovery-centre',
    name: 'Port Phillip Resource Recovery Centre',
    suburb: 'South Melbourne',
    postcode: '3205',
    address: '78 White Street, South Melbourne VIC 3205 (enter via Boundary Street)',
    coordinates: { latitude: -37.8283486, longitude: 144.9435627 },
    acceptedMaterials: [
      'Motor and cooking oil',
      'Car batteries',
      'Green waste',
      'Paint',
      'Cardboard',
      'Glass bottles and jars',
      'Mattresses',
      'E-waste',
    ],
    description:
      'Council resource recovery centre. Identification is required for resident services, and fees or quantity limits may apply.',
    sourceName: 'City of Port Phillip',
    sourceUrl:
      'https://www.portphillip.vic.gov.au/council-services/waste-recycling-and-cleaning/resource-recovery-centre-and-depot',
  },
]
