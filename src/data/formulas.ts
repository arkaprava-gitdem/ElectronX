import { FormulaItem } from '../types';

export const FORMULA_VAULT: FormulaItem[] = [
  {
    id: 'conductivity',
    name: 'Electrical Conductivity (Semiconductor)',
    category: 'Physics',
    latex: '\\sigma = q(n \\cdot \\mu_n + p \\cdot \\mu_p)',
    description: 'Calculates the total electrical conductivity of a semiconductor crystal by summing electron and hole drift contributions.',
    variables: [
      { symbol: 'n', name: 'Electron Concentration', unit: 'cm⁻³', defaultValue: 1e16 },
      { symbol: 'p', name: 'Hole Concentration', unit: 'cm⁻³', defaultValue: 2.25e4 },
      { symbol: 'mu_n', name: 'Electron Mobility (μn)', unit: 'cm²/(V·s)', defaultValue: 1350 },
      { symbol: 'mu_p', name: 'Hole Mobility (μp)', unit: 'cm²/(V·s)', defaultValue: 450 }
    ],
    calculate: (inputs) => {
      const q = 1.602e-19;
      const sigma = q * (inputs.n * inputs.mu_n + inputs.p * inputs.mu_p);
      return {
        value: Number(sigma.toPrecision(4)),
        unit: 'S/cm (or (Ω·cm)⁻¹)',
        steps: [
          `Electron component: q·n·μn = (1.602×10⁻¹⁹) × (${inputs.n.toExponential(2)}) × (${inputs.mu_n}) = ${(q * inputs.n * inputs.mu_n).toExponential(3)} S/cm`,
          `Hole component: q·p·μp = (1.602×10⁻¹⁹) × (${inputs.p.toExponential(2)}) × (${inputs.mu_p}) = ${(q * inputs.p * inputs.mu_p).toExponential(3)} S/cm`,
          `Summed conductivity σ = ${sigma.toPrecision(4)} S/cm`
        ]
      };
    }
  },
  {
    id: 'drift-current-density',
    name: 'Drift Current Density',
    category: 'Physics',
    latex: 'J_{drift} = q(n \\cdot \\mu_n + p \\cdot \\mu_p) \\cdot E = \\sigma \\cdot E',
    description: 'Relates current density to the applied electric field via Ohm’s law in differential form for a semiconductor.',
    variables: [
      { symbol: 'sigma', name: 'Conductivity (σ)', unit: 'S/cm', defaultValue: 2.16 },
      { symbol: 'E', name: 'Electric Field (E)', unit: 'V/cm', defaultValue: 100 }
    ],
    calculate: (inputs) => {
      const J = inputs.sigma * inputs.E;
      return {
        value: Number(J.toPrecision(4)),
        unit: 'A/cm²',
        steps: [
          `J = σ × E = ${inputs.sigma} S/cm × ${inputs.E} V/cm`,
          `Current density J = ${J.toPrecision(4)} A/cm²`
        ]
      };
    }
  },
  {
    id: 'einstein-relation',
    name: 'Einstein Relation (Diffusion vs Mobility)',
    category: 'Physics',
    latex: '\\frac{D_n}{\\mu_n} = \\frac{D_p}{\\mu_p} = \\frac{k_B T}{q} = V_t',
    description: 'Fundamental thermodynamic bridge connecting carrier diffusion coefficient D with mobility μ through thermal voltage Vt.',
    variables: [
      { symbol: 'mu', name: 'Carrier Mobility (μ)', unit: 'cm²/(V·s)', defaultValue: 1350 },
      { symbol: 'T', name: 'Absolute Temperature (T)', unit: 'K', defaultValue: 300 }
    ],
    calculate: (inputs) => {
      const kB_q = 8.6173e-5; // eV/K -> V/K
      const Vt = kB_q * inputs.T; // in Volts
      const D = inputs.mu * Vt; // cm²/s
      return {
        value: Number(D.toFixed(2)),
        unit: 'cm²/s',
        steps: [
          `Thermal voltage Vt = (kB·T)/q = (8.617×10⁻⁵ V/K) × ${inputs.T} K = ${(Vt * 1000).toFixed(2)} mV`,
          `Diffusion coefficient D = μ × Vt = ${inputs.mu} × ${Vt.toFixed(4)} = ${D.toFixed(2)} cm²/s`
        ]
      };
    }
  },
  {
    id: 'built-in-potential',
    name: 'PN Junction Built-in Potential',
    category: 'PN Junction',
    latex: 'V_{bi} = \\frac{k_B T}{q} \\ln\\left(\\frac{N_A \\cdot N_D}{n_i^2}\\right)',
    description: 'The contact potential created across the metallurgical junction in thermal equilibrium due to donor and acceptor concentration gradients.',
    variables: [
      { symbol: 'NA', name: 'Acceptor Doping (P-side)', unit: 'cm⁻³', defaultValue: 1e16 },
      { symbol: 'ND', name: 'Donor Doping (N-side)', unit: 'cm⁻³', defaultValue: 1e17 },
      { symbol: 'T', name: 'Temperature', unit: 'K', defaultValue: 300 },
      { symbol: 'ni', name: 'Intrinsic Concentration (ni)', unit: 'cm⁻³', defaultValue: 1.5e10 }
    ],
    calculate: (inputs) => {
      const Vt = (1.38e-23 * inputs.T) / 1.602e-19;
      const ratio = (inputs.NA * inputs.ND) / Math.pow(inputs.ni, 2);
      const Vbi = Vt * Math.log(ratio);
      return {
        value: Number(Vbi.toFixed(3)),
        unit: 'Volts',
        steps: [
          `Vt = kB·T/q = ${(Vt * 1000).toFixed(2)} mV`,
          `Doping product (NA·ND)/ni² = ${ratio.toExponential(2)}`,
          `Vbi = Vt × ln(ratio) = ${Vbi.toFixed(3)} V`
        ]
      };
    }
  },
  {
    id: 'shockley-diode',
    name: 'Shockley Ideal Diode Equation',
    category: 'PN Junction',
    latex: 'I = I_s \\left(e^{\\frac{q V}{\\eta k_B T}} - 1\\right)',
    description: 'Describes current through an ideal PN junction under applied bias voltage V.',
    variables: [
      { symbol: 'Is', name: 'Saturation Current (Is)', unit: 'pA', defaultValue: 10 },
      { symbol: 'V', name: 'Applied Voltage (V)', unit: 'V', defaultValue: 0.65 },
      { symbol: 'eta', name: 'Ideality Factor (η)', unit: 'unitless', defaultValue: 1.0 },
      { symbol: 'T', name: 'Temperature (T)', unit: 'K', defaultValue: 300 }
    ],
    calculate: (inputs) => {
      const Vt = (1.38e-23 * inputs.T) / 1.602e-19;
      const Is_A = inputs.Is * 1e-12;
      const exponent = inputs.V / (inputs.eta * Vt);
      const I = Is_A * (Math.exp(Math.min(exponent, 40)) - 1);
      const I_mA = I * 1000;
      return {
        value: Number(I_mA.toFixed(3)),
        unit: 'mA',
        steps: [
          `Thermal voltage Vt = ${(Vt * 1000).toFixed(2)} mV`,
          `Exponent qV/(η·kB·T) = ${exponent.toFixed(2)}`,
          `Diode forward current I = ${(I_mA).toFixed(3)} mA`
        ]
      };
    }
  },
  {
    id: 'bjt-gain-beta',
    name: 'BJT Current Gain Relationship (α and β)',
    category: 'BJT',
    latex: '\\beta = \\frac{\\alpha}{1 - \\alpha}, \\quad \\alpha = \\frac{\\beta}{1 + \\beta}',
    description: 'Interconverts Common-Base gain (α = IC/IE) and Common-Emitter current amplification factor (β = IC/IB).',
    variables: [
      { symbol: 'alpha', name: 'Alpha (α = IC / IE)', unit: 'ratio', defaultValue: 0.99 }
    ],
    calculate: (inputs) => {
      const beta = inputs.alpha / (1 - inputs.alpha);
      return {
        value: Number(beta.toFixed(1)),
        unit: 'ratio (unitless)',
        steps: [
          `1 - α = 1 - ${inputs.alpha} = ${(1 - inputs.alpha).toPrecision(3)}`,
          `β = α / (1 - α) = ${beta.toFixed(1)}`
        ]
      };
    }
  },
  {
    id: 'bjt-voltage-gain',
    name: 'Common-Emitter BJT Voltage Gain',
    category: 'BJT',
    latex: 'A_v = -\\frac{g_m \\cdot R_C}{1 + g_m \\cdot R_E} \\approx -\\frac{R_C}{r_e}',
    description: 'Calculates small-signal voltage gain for a common-emitter amplifier stage with 180° phase inversion.',
    variables: [
      { symbol: 'IC', name: 'Collector Quiescent Current (IC)', unit: 'mA', defaultValue: 2.0 },
      { symbol: 'RC', name: 'Collector Resistor (RC)', unit: 'kΩ', defaultValue: 3.3 }
    ],
    calculate: (inputs) => {
      const Vt = 0.026; // 26 mV
      const re = (Vt / (inputs.IC * 1e-3)); // ohms
      const RC_ohms = inputs.RC * 1000;
      const Av = -RC_ohms / re;
      return {
        value: Number(Av.toFixed(1)),
        unit: 'V/V (Inverting Gain)',
        steps: [
          `Intrinsic emitter resistance re = Vt / IC = 26 mV / ${inputs.IC} mA = ${re.toFixed(1)} Ω`,
          `Voltage gain Av = -RC / re = -${RC_ohms} Ω / ${re.toFixed(1)} Ω = ${Av.toFixed(1)}`
        ]
      };
    }
  },
  {
    id: 'mosfet-sat-current',
    name: 'MOSFET Saturation Drain Current',
    category: 'FET & MOSFET',
    latex: 'I_D = \\frac{1}{2} \\mu_n C_{ox} \\left(\\frac{W}{L}\\right) (V_{GS} - V_{th})^2',
    description: 'Quadratic relationship for drain current in an enhancement NMOS in saturation when VDS >= VGS - Vth.',
    variables: [
      { symbol: 'kn_prime', name: 'Process Factor (μn·Cox)', unit: 'μA/V²', defaultValue: 150 },
      { symbol: 'WL', name: 'Aspect Ratio (W/L)', unit: 'ratio', defaultValue: 10 },
      { symbol: 'VGS', name: 'Gate-Source Voltage', unit: 'V', defaultValue: 3.0 },
      { symbol: 'Vth', name: 'Threshold Voltage (Vth)', unit: 'V', defaultValue: 0.8 }
    ],
    calculate: (inputs) => {
      const Vov = inputs.VGS - inputs.Vth;
      if (Vov <= 0) {
        return {
          value: 0,
          unit: 'mA (Cutoff)',
          steps: ['VGS < Vth: Device is in Cutoff, ID = 0 A']
        };
      }
      const ID_uA = 0.5 * inputs.kn_prime * inputs.WL * Math.pow(Vov, 2);
      const ID_mA = ID_uA / 1000;
      return {
        value: Number(ID_mA.toFixed(3)),
        unit: 'mA',
        steps: [
          `Overdrive voltage Vov = VGS - Vth = ${inputs.VGS} - ${inputs.Vth} = ${Vov.toFixed(2)} V`,
          `ID = 0.5 × kn' × (W/L) × Vov² = 0.5 × ${inputs.kn_prime} × ${inputs.WL} × (${Vov.toFixed(2)})² = ${ID_uA.toFixed(1)} μA = ${ID_mA.toFixed(3)} mA`
        ]
      };
    }
  },
  {
    id: 'solar-fill-factor',
    name: 'Solar Cell Fill Factor & Maximum Power',
    category: 'Optoelectronics',
    latex: 'FF = \\frac{V_{mp} \\cdot I_{mp}}{V_{oc} \\cdot I_{sc}} = \\frac{P_{max}}{V_{oc} \\cdot I_{sc}}',
    description: 'Figure of merit representing the squareness of a solar cell I-V curve, determining harvestable power.',
    variables: [
      { symbol: 'Voc', name: 'Open-Circuit Voltage (Voc)', unit: 'V', defaultValue: 0.64 },
      { symbol: 'Isc', name: 'Short-Circuit Current (Isc)', unit: 'A', defaultValue: 5.2 },
      { symbol: 'Vmp', name: 'Max Power Voltage (Vmp)', unit: 'V', defaultValue: 0.53 },
      { symbol: 'Imp', name: 'Max Power Current (Imp)', unit: 'A', defaultValue: 4.8 }
    ],
    calculate: (inputs) => {
      const Pmax = inputs.Vmp * inputs.Imp;
      const Pideal = inputs.Voc * inputs.Isc;
      const FF = (Pmax / Pideal) * 100;
      return {
        value: Number(FF.toFixed(2)),
        unit: '%',
        steps: [
          `Max output power Pmax = Vmp × Imp = ${inputs.Vmp} V × ${inputs.Imp} A = ${Pmax.toFixed(2)} W`,
          `Theoretical bounding rectangle = Voc × Isc = ${inputs.Voc} V × ${inputs.Isc} A = ${Pideal.toFixed(2)} W`,
          `Fill Factor FF = Pmax / (Voc × Isc) = ${FF.toFixed(2)}%`
        ]
      };
    }
  },
  {
    id: 'led-wavelength',
    name: 'LED Photon Emission Wavelength',
    category: 'Optoelectronics',
    latex: '\\lambda = \\frac{h \\cdot c}{E_g} \\approx \\frac{1240}{E_g \\text{ (in eV)}} \\text{ nm}',
    description: 'Determines the emitted electromagnetic color from semiconductor bandgap energy Eg.',
    variables: [
      { symbol: 'Eg', name: 'Bandgap Energy (Eg)', unit: 'eV', defaultValue: 1.95 }
    ],
    calculate: (inputs) => {
      const lambda_nm = 1240 / inputs.Eg;
      let color = 'Infrared';
      if (lambda_nm < 380) color = 'Ultraviolet';
      else if (lambda_nm < 450) color = 'Violet';
      else if (lambda_nm < 495) color = 'Blue';
      else if (lambda_nm < 570) color = 'Green';
      else if (lambda_nm < 590) color = 'Yellow';
      else if (lambda_nm < 620) color = 'Amber/Orange';
      else if (lambda_nm < 750) color = 'Red';
      return {
        value: Number(lambda_nm.toFixed(1)),
        unit: `nm (${color})`,
        steps: [
          `λ = 1240 / Eg = 1240 / ${inputs.Eg} eV = ${lambda_nm.toFixed(1)} nm`,
          `Emitted spectral band corresponds to: ${color}`
        ]
      };
    }
  }
];

export const FORMULAS = FORMULA_VAULT;
