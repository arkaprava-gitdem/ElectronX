export interface KnowledgeEntry {
  keywords: string[];
  title: string;
  simple: string;
  engineering: string;
  formula: string;
  visual: string;
  applications: string;
}

export const MENTOR_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['depletion', 'depletion region', 'space charge', 'barrier potential', 'pn junction barrier'],
    title: 'PN Junction Depletion Region & Built-in Potential',
    simple: 'When P-type and N-type semiconductors meet, mobile electrons and holes rush across the border and cancel each other out. This leaves behind a narrow barrier zone devoid of free charge carriers, containing only fixed positive and negative ions.',
    engineering: 'Free electrons from the N-side diffuse into the P-side down their concentration gradient, while holes from the P-side diffuse into the N-side. As mobile carriers leave, uncompensated ionized donor atoms (ND+) on the N-side and ionized acceptor atoms (NA-) on the P-side create a space-charge region. This charge separation sets up an intense internal electric field pointing from N to P that exerts a drift force opposing further diffusion. In thermal equilibrium, the net drift and diffusion currents strictly cancel out (Jn_drift + Jn_diff = 0), yielding a constant Fermi level across the junction and establishing the built-in potential barrier Vbi.',
    formula: 'V_{bi} = \\frac{k_B T}{q} \\ln\\left(\\frac{N_A \\cdot N_D}{n_i^2}\\right) = V_t \\ln\\left(\\frac{N_A N_D}{n_i^2}\\right)\n\nW = \\sqrt{\\frac{2\\epsilon_s}{q}\\left(\\frac{1}{N_A} + \\frac{1}{N_D}\\right)(V_{bi} - V)}',
    visual: 'Imagine a border crossing between two dense crowds. People immediately at the border step across to mingle, leaving behind fixed physical toll booths. These fixed booths set up an electric fence that repels anyone else trying to cross until an external battery pushes hard enough to lower the gate.',
    applications: 'Crucial for understanding all rectifiers, solar cells (where photogenerated carriers are swept apart by this field), photodetectors, Zener diodes, and bipolar transistor junctions.'
  },
  {
    keywords: ['mosfet threshold', 'threshold voltage', 'vth', 'inversion', 'mosfet need threshold'],
    title: 'MOSFET Threshold Voltage & Surface Inversion',
    simple: 'The threshold voltage (Vth) is the minimum gate voltage needed to turn a MOSFET on by attracting enough electrons under the gate to form a conductive highway between source and drain.',
    engineering: 'In an enhancement NMOS on a P-type substrate, applying a positive gate voltage VGS first repels majority holes from the Si-SiO₂ interface, exposing negatively ionized acceptor atoms and creating a surface depletion region. As VGS increases to the threshold condition, the energy bands bend downward until the surface potential ψs equals twice the bulk Fermi potential (ψs = 2ψB). At this point, the surface electron concentration matches the bulk substrate hole concentration—a state termed "strong inversion". The inverted layer forms a continuous conductive N-channel allowing drain current to flow when VDS is applied.',
    formula: 'V_{th} = V_{FB} + 2\\psi_B + \\frac{\\sqrt{2\\epsilon_s q N_A (2\\psi_B)}}{C_{ox}}\n\n\\psi_B = \\frac{k_B T}{q} \\ln\\left(\\frac{N_A}{n_i}\\right), \\quad C_{ox} = \\frac{\\epsilon_{ox}}{t_{ox}}',
    visual: 'Imagine a dry riverbed between two lakes (Source and Drain). The gate acts like a magnet floating above. Until the magnet is strong enough (VGS > Vth), water cannot fill the riverbed. Once threshold is reached, water forms a rushing channel connecting the two lakes.',
    applications: 'Governs microprocessor switching speeds, sub-threshold leakage currents in smartphone APUs, and digital noise margins in CMOS logic chips.'
  },
  {
    keywords: ['bjt active', 'active region', 'bjt active region', 'linear amplification'],
    title: 'BJT Forward-Active Mode & Current Amplification',
    simple: 'In active mode, a small input current into the base controls and unleashes a much larger current flowing through the collector, allowing the transistor to amplify weak audio and radio signals.',
    engineering: 'In forward-active mode, the Base-Emitter (BE) junction is forward-biased (~0.7V for Si) while the Base-Collector (BC) junction is reverse-biased. The forward-biased BE junction injects a large density of majority electrons from the heavily doped emitter into the base. Because the base is fabricated to be extraordinarily thin (Wb << Ln) and lightly doped, over 99% of injected electrons traverse the base by pure diffusion without recombining with holes. When they arrive at the edge of the BC depletion region, the intense reverse electric field swiftly captures them and sweeps them into the collector.',
    formula: 'I_C = \\beta \\cdot I_B = \\alpha \\cdot I_E\n\nI_C = I_S \\cdot e^{\\frac{V_{BE}}{V_t}} \\left(1 + \\frac{V_{CE}}{V_A}\\right), \\quad \\beta = \\frac{\\alpha}{1 - \\alpha}',
    visual: 'Think of the emitter as a pressurized water cannon spraying billions of drops across a razor-thin paper mesh (the base). Almost all droplets fly right through the mesh and get suctioned up by a giant industrial vacuum pump (the reverse-biased collector).',
    applications: 'High-fidelity audio power amplifiers, low-noise RF front ends, analog operational amplifiers (741, LM358), and precision bandgap voltage references.'
  },
  {
    keywords: ['solar cell voltage', 'photovoltaic', 'solar cell generate', 'how solar cell works', 'fill factor'],
    title: 'Photovoltaic Voltage Generation & I-V Photogeneration',
    simple: 'A solar cell converts sunlight directly into electricity: incoming light knocks electrons loose inside the silicon, and the internal built-in electric field pushes them out through the wires to power your devices.',
    engineering: 'When photons with energy hν ≥ Eg enter the semiconductor, they are absorbed by exciting electrons from the valence band to the conduction band, creating electron-hole pairs. In the space-charge depletion layer, the strong built-in electric field immediately separates the newly generated electron-hole pair before recombination can occur: electrons are swept to the N-side and holes to the P-side. This carrier separation creates an open-circuit photovoltage Voc that forward-biases the junction. When connected to an external load resistor, the photogenerated current Iph flows in the 4th quadrant of the I-V characteristic.',
    formula: 'I = I_{ph} - I_s \\left(e^{\\frac{q V}{k_B T}} - 1\\right)\n\nV_{oc} = \\frac{k_B T}{q} \\ln\\left(\\frac{I_{ph}}{I_s} + 1\\right), \\quad FF = \\frac{V_{mp} \\cdot I_{mp}}{V_{oc} \\cdot I_{sc}}',
    visual: 'Picture a water slide with an electric escalator at the top. Sunlight acts as an elevator lifting swimmers from the pool floor to the top of the slide. Once at the top, the built-in electric slope flings them down a one-way slide, forcing them to run around through an external circuit to return to the pool.',
    applications: 'Rooftop solar installations, deep-space satellite solar arrays, solar-powered watches, and off-grid IoT sensors.'
  },
  {
    keywords: ['drift and diffusion', 'difference between drift', 'drift vs diffusion', 'carrier transport'],
    title: 'Carrier Transport: Drift vs Diffusion Dynamics',
    simple: 'Drift is charge carriers moving because an electric field pulls or pushes them. Diffusion is charge carriers moving on their own from crowded areas to empty areas through random thermal motion.',
    engineering: 'Drift transport occurs when an applied electric field E exerts an electrostatic Coulomb force F = qE on carriers. Between lattice collisions, carriers accelerate and achieve an average directed drift velocity vd = μ·E, producing drift current density J_drift = q(nμn + pμp)E. In contrast, diffusion transport requires no electric field; it is driven purely by spatial concentration gradients (dn/dx, dp/dx). Random thermal vibrations cause net carrier flux from high concentration to low concentration according to Fick\'s law: J_diff = q·Dn(dn/dx) - q·Dp(dp/dx). The Einstein relation (D/μ = kBT/q) unites both transport phenomena.',
    formula: 'J_{total} = J_{drift} + J_{diff}\n\nJ_n = q n \\mu_n E + q D_n \\frac{dn}{dx}, \\quad \\frac{D}{\\mu} = \\frac{k_B T}{q}',
    visual: 'Drop a splash of food coloring into a quiet glass of water—it slowly spreads outward purely from crowded to clear zones (Diffusion). Now turn on a water pump that creates a current through the tube—the water and dye are forcefully dragged in the direction of the flow (Drift).',
    applications: 'Fundamental in modeling every semiconductor device: drift dominates in resistors, reverse-biased junctions, and MOSFET pinch-off channels; diffusion dominates in forward-biased diodes and the base of BJTs.'
  },
  {
    keywords: ['negative differential resistance', 'ndr', 'tunnel diode ndr', 'negative resistance'],
    title: 'Negative Differential Resistance (NDR) in Tunnel Diodes',
    simple: 'Negative differential resistance is a weird quantum quirk where increasing the applied voltage actually causes the electrical current to drop rather than rise.',
    engineering: 'In degenerate PN junctions (doped > 10¹⁹ cm⁻³), the depletion layer is extraordinarily thin (< 10 nm) and the Fermi level lies inside the conduction band on the N-side and inside the valence band on the P-side. At zero bias, tunneling is balanced. When a small forward bias is applied (0 to Vp), filled conduction states directly align with available empty valence states, allowing direct quantum tunneling and a rapid rise in current to Ip. As forward voltage increases further toward valley voltage Vv, the band overlap progressively disappears. Because electrons can no longer tunnel into the bandgap states, tunneling current collapses while ordinary thermal diffusion has not yet kicked in. The resulting dI/dV < 0 creates Negative Differential Resistance.',
    formula: 'R_n = \\frac{\\Delta V}{\\Delta I} < 0 \\quad (\\text{for } V_p < V < V_v)\n\nP_{delivered} = \\frac{1}{2} |R_n| I_{ac}^2',
    visual: 'Imagine looking through two overlapping windows. When you slide the second window slightly, their openings line up perfectly, letting a torrent of sunlight through (Peak Current). But as you keep sliding it farther, the frames block each other completely, cutting the light down to a faint trickle (Valley Current).',
    applications: 'Ultra-fast microwave oscillators (up to 100 GHz), trigger pulse generators, logic memory flip-flops, and high-frequency amplifiers.'
  }
];

export function findMentorFallbackAnswer(question: string, topicContext?: string): {
  title: string;
  simple: string;
  engineering: string;
  formula: string;
  visual: string;
  applications: string;
} {
  const query = (question + ' ' + (topicContext || '')).toLowerCase();
  
  // Best match by counting keyword hits
  let bestMatch: KnowledgeEntry | null = null;
  let maxScore = 0;

  for (const entry of MENTOR_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (query.includes(kw.toLowerCase())) {
        score += kw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch;
  }

  // General fallback for any semiconductor query
  return {
    title: 'Semiconductor Device Physics Analysis',
    simple: `In semiconductor devices, electrical conduction is governed by both negative electrons and positive hole quasi-particles responding to applied electric fields and concentration gradients across tailored crystal structures.`,
    engineering: `Carrier transport in solid-state devices balances drift J_drift = q(n·μn + p·μp)E and diffusion J_diff = q·Dn(dn/dx) - q·Dp(dp/dx). Energy band structures, the Fermi-Dirac distribution f(E) = 1/(1 + exp((E-EF)/kT)), and space-charge electrostatics (governed by Poisson's equation ∇²V = -ρ/ε) dictate the terminal V-I relationships across PN junctions, bipolar transistors, and field-effect gates.`,
    formula: `\\sigma = q(n\\mu_n + p\\mu_p), \\quad I = I_s \\left(e^{\\frac{qV}{\\eta k_B T}} - 1\\right), \\quad \\frac{D}{\\mu} = \\frac{k_B T}{q}`,
    visual: `Imagine electrons as tiny marbles moving through a crystalline lattice grid of silicon atoms. In an intrinsic crystal, few marbles are free; donor dopants inject abundant marbles, while acceptor dopants create empty pockets (holes) into which neighboring marbles drop.`,
    applications: `Modern VLSI microprocessors, power electronic converters, high-frequency radar modules, and renewable photovoltaic solar cells all utilize these exact band-engineering principles.`
  };
}

export function findLocalMentorAnswer(query: string, topicContext?: string): string {
  const match = findMentorFallbackAnswer(query, topicContext);
  return `### ${match.title}

### 1. Simple Explanation
${match.simple}

### 2. Engineering Explanation
${match.engineering}

### 3. Key Formulas & Equations
${match.formula}

### 4. Visual & Physical Intuition
${match.visual}

### 5. Real-World Applications & Lab Insight
${match.applications}`;
}
