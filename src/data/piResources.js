export const planetTypes = {
  Barren: {
    resources: ['Base Metals', 'Carbon Compounds', 'Micro Organisms', 'Noble Metals']
  },
  Gas: {
    resources: ['Aqueous Liquids', 'Base Metals', 'Ionic Solutions', 'Noble Gas', 'Reactive Gas']
  },
  Ice: {
    resources: ['Aqueous Liquids', 'Heavy Water', 'Micro Organisms', 'Noble Gas', 'Planktic Colonies']
  },
  Lava: {
    resources: ['Base Metals', 'Felsic Magma', 'Heavy Metals', 'Non-CS Crystals', 'Suspended Plasma']
  },
  Oceanic: {
    resources: ['Aqueous Liquids', 'Carbon Compounds', 'Complex Organisms', 'Micro Organisms', 'Planktic Colonies']
  },
  Plasma: {
    resources: ['Base Metals', 'Heavy Metals', 'Noble Gas', 'Non-CS Crystals', 'Suspended Plasma']
  },
  Storm: {
    resources: ['Aqueous Liquids', 'Base Metals', 'Ionic Solutions', 'Noble Gas', 'Suspended Plasma']
  },
  Temperate: {
    resources: ['Aqueous Liquids', 'Autotrophs', 'Carbon Compounds', 'Complex Organisms', 'Micro Organisms']
  }
}

export const tier0Resources = {
  'Aqueous Liquids': { tier: 0, inputs: [], outputPer: 3000 },
  'Autotrophs': { tier: 0, inputs: [], outputPer: 3000 },
  'Base Metals': { tier: 0, inputs: [], outputPer: 3000 },
  'Carbon Compounds': { tier: 0, inputs: [], outputPer: 3000 },
  'Complex Organisms': { tier: 0, inputs: [], outputPer: 3000 },
  'Felsic Magma': { tier: 0, inputs: [], outputPer: 3000 },
  'Heavy Metals': { tier: 0, inputs: [], outputPer: 3000 },
  'Heavy Water': { tier: 0, inputs: [], outputPer: 3000 },
  'Ionic Solutions': { tier: 0, inputs: [], outputPer: 3000 },
  'Micro Organisms': { tier: 0, inputs: [], outputPer: 3000 },
  'Noble Gas': { tier: 0, inputs: [], outputPer: 3000 },
  'Noble Metals': { tier: 0, inputs: [], outputPer: 3000 },
  'Non-CS Crystals': { tier: 0, inputs: [], outputPer: 3000 },
  'Planktic Colonies': { tier: 0, inputs: [], outputPer: 3000 },
  'Reactive Gas': { tier: 0, inputs: [], outputPer: 3000 },
  'Suspended Plasma': { tier: 0, inputs: [], outputPer: 3000 }
}

export const tier1Products = {
  'Bacteria': { tier: 1, inputs: ['Micro Organisms'], outputPer: 20 },
  'Biofuels': { tier: 1, inputs: ['Carbon Compounds'], outputPer: 20 },
  'Biomass': { tier: 1, inputs: ['Planktic Colonies'], outputPer: 20 },
  'Chiral Structures': { tier: 1, inputs: ['Non-CS Crystals'], outputPer: 20 },
  'Coolant': { tier: 1, inputs: ['Heavy Water'], outputPer: 20 },
  'Electrolytes': { tier: 1, inputs: ['Ionic Solutions'], outputPer: 20 },
  'Industrial Fibers': { tier: 1, inputs: ['Autotrophs'], outputPer: 20 },
  'Oxidizing Compound': { tier: 1, inputs: ['Reactive Gas'], outputPer: 20 },
  'Oxygen': { tier: 1, inputs: ['Noble Gas'], outputPer: 20 },
  'Plasmoids': { tier: 1, inputs: ['Suspended Plasma'], outputPer: 20 },
  'Precious Metals': { tier: 1, inputs: ['Noble Metals'], outputPer: 20 },
  'Proteins': { tier: 1, inputs: ['Complex Organisms'], outputPer: 20 },
  'Reactive Metals': { tier: 1, inputs: ['Base Metals'], outputPer: 20 },
  'Silicon': { tier: 1, inputs: ['Felsic Magma'], outputPer: 20 },
  'Toxic Metals': { tier: 1, inputs: ['Heavy Metals'], outputPer: 20 },
  'Water': { tier: 1, inputs: ['Aqueous Liquids'], outputPer: 20 }
}

export const tier2Products = {
  'Biocells': { tier: 2, inputs: ['Biofuels', 'Precious Metals'], outputPer: 5 },
  'Construction Blocks': { tier: 2, inputs: ['Reactive Metals', 'Toxic Metals'], outputPer: 5 },
  'Consumer Electronics': { tier: 2, inputs: ['Toxic Metals', 'Chiral Structures'], outputPer: 5 },
  'Coolant': { tier: 2, inputs: ['Water', 'Electrolytes'], outputPer: 5 },
  'Enriched Uranium': { tier: 2, inputs: ['Precious Metals', 'Toxic Metals'], outputPer: 5 },
  'Fertilizer': { tier: 2, inputs: ['Bacteria', 'Proteins'], outputPer: 5 },
  'Genetically Enhanced Livestock': { tier: 2, inputs: ['Proteins', 'Biomass'], outputPer: 5 },
  'Livestock': { tier: 2, inputs: ['Biofuels', 'Proteins'], outputPer: 5 },
  'Mechanical Parts': { tier: 2, inputs: ['Reactive Metals', 'Precious Metals'], outputPer: 5 },
  'Microfiber Shielding': { tier: 2, inputs: ['Industrial Fibers', 'Silicon'], outputPer: 5 },
  'Miniature Electronics': { tier: 2, inputs: ['Chiral Structures', 'Silicon'], outputPer: 5 },
  'Nanites': { tier: 2, inputs: ['Bacteria', 'Reactive Metals'], outputPer: 5 },
  'Oxides': { tier: 2, inputs: ['Oxidizing Compound', 'Oxygen'], outputPer: 5 },
  'Polyaramids': { tier: 2, inputs: ['Oxidizing Compound', 'Industrial Fibers'], outputPer: 5 },
  'Polytextiles': { tier: 2, inputs: ['Biofuels', 'Industrial Fibers'], outputPer: 5 },
  'Rocket Fuel': { tier: 2, inputs: ['Plasmoids', 'Electrolytes'], outputPer: 5 },
  'Silicate Glass': { tier: 2, inputs: ['Oxidizing Compound', 'Silicon'], outputPer: 5 },
  'Superconductors': { tier: 2, inputs: ['Water', 'Plasmoids'], outputPer: 5 },
  'Supertensile Plastics': { tier: 2, inputs: ['Oxygen', 'Biomass'], outputPer: 5 },
  'Synthetic Oil': { tier: 2, inputs: ['Electrolytes', 'Oxygen'], outputPer: 5 },
  'Test Cultures': { tier: 2, inputs: ['Bacteria', 'Water'], outputPer: 5 },
  'Transmitter': { tier: 2, inputs: ['Plasmoids', 'Chiral Structures'], outputPer: 5 },
  'Viral Agent': { tier: 2, inputs: ['Biomass', 'Bacteria'], outputPer: 5 },
  'Water-Cooled CPU': { tier: 2, inputs: ['Reactive Metals', 'Water'], outputPer: 5 }
}

export const tier3Products = {
  'Biotech Research Reports': { tier: 3, inputs: ['Nanites', 'Livestock', 'Construction Blocks'], outputPer: 3 },
  'Camera Drones': { tier: 3, inputs: ['Silicate Glass', 'Rocket Fuel'], outputPer: 3 },
  'Condensates': { tier: 3, inputs: ['Oxides', 'Coolant'], outputPer: 3 },
  'Cryoprotectant Solution': { tier: 3, inputs: ['Test Cultures', 'Synthetic Oil', 'Fertilizer'], outputPer: 3 },
  'Data Chips': { tier: 3, inputs: ['Supertensile Plastics', 'Microfiber Shielding'], outputPer: 3 },
  'Gel-Matrix Biopaste': { tier: 3, inputs: ['Oxides', 'Biocells', 'Superconductors'], outputPer: 3 },
  'Guidance Systems': { tier: 3, inputs: ['Water-Cooled CPU', 'Transmitter'], outputPer: 3 },
  'Hazmat Detection Systems': { tier: 3, inputs: ['Polytextiles', 'Viral Agent', 'Transmitter'], outputPer: 3 },
  'Hermetic Membranes': { tier: 3, inputs: ['Polyaramids', 'Genetically Enhanced Livestock'], outputPer: 3 },
  'High-Tech Transmitters': { tier: 3, inputs: ['Polyaramids', 'Transmitter'], outputPer: 3 },
  'Industrial Explosives': { tier: 3, inputs: ['Fertilizer', 'Polytextiles'], outputPer: 3 },
  'Neocoms': { tier: 3, inputs: ['Biocells', 'Silicate Glass'], outputPer: 3 },
  'Nuclear Reactors': { tier: 3, inputs: ['Enriched Uranium', 'Microfiber Shielding'], outputPer: 3 },
  'Planetary Vehicles': { tier: 3, inputs: ['Supertensile Plastics', 'Mechanical Parts', 'Miniature Electronics'], outputPer: 3 },
  'Robotics': { tier: 3, inputs: ['Mechanical Parts', 'Consumer Electronics'], outputPer: 3 },
  'Smartfab Units': { tier: 3, inputs: ['Construction Blocks', 'Miniature Electronics'], outputPer: 3 },
  'Supercomputers': { tier: 3, inputs: ['Water-Cooled CPU', 'Coolant', 'Consumer Electronics'], outputPer: 3 },
  'Synthetic Synapses': { tier: 3, inputs: ['Supertensile Plastics', 'Test Cultures'], outputPer: 3 },
  'Transcranial Microcontrollers': { tier: 3, inputs: ['Biocells', 'Nanites'], outputPer: 3 },
  'Ukomi Superconductors': { tier: 3, inputs: ['Synthetic Oil', 'Superconductors'], outputPer: 3 },
  'Vaccines': { tier: 3, inputs: ['Livestock', 'Viral Agent'], outputPer: 3 }
}

export const tier4Products = {
  'Broadcast Node': { tier: 4, inputs: ['Neocoms', 'Data Chips', 'High-Tech Transmitters'], outputPer: 1 },
  'Integrity Response Drones': { tier: 4, inputs: ['Gel-Matrix Biopaste', 'Hazmat Detection Systems', 'Planetary Vehicles'], outputPer: 1 },
  'Nano-Factory': { tier: 4, inputs: ['Industrial Explosives', 'Ukomi Superconductors', 'Microfiber Shielding'], outputPer: 1 },
  'Organic Mortar Applicators': { tier: 4, inputs: ['Condensates', 'Robotics', 'Bacteria'], outputPer: 1 },
  'Recursive Computing Module': { tier: 4, inputs: ['Synthetic Synapses', 'Guidance Systems', 'Transcranial Microcontrollers'], outputPer: 1 },
  'Self-Harmonizing Power Core': { tier: 4, inputs: ['Camera Drones', 'Nuclear Reactors', 'Hermetic Membranes'], outputPer: 1 },
  'Sterile Conduits': { tier: 4, inputs: ['Smartfab Units', 'Vaccines', 'Water'], outputPer: 1 },
  'Wetware Mainframe': { tier: 4, inputs: ['Supercomputers', 'Biotech Research Reports', 'Cryoprotectant Solution'], outputPer: 1 }
}