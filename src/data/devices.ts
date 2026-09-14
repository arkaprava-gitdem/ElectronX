import { DeviceInfo } from '../types';

export const SEMICONDUCTOR_DEVICES: DeviceInfo[] = [
  {
    id: 'pn-junction',
    name: 'PN Junction Diode',
    category: 'junction',
    symbol: '►|',
    tagline: 'The foundational building block of semiconductor electronics',
    module: 'MODULE 02',
    structureDescription: 'Formed by metallurgically joining P-type and N-type semiconductor crystals, creating a metallurgical boundary with an ionized donor/acceptor space-charge region.',
    operatingPrinciple: 'Under zero bias, diffusion and drift currents balance in thermal equilibrium. Forward bias reduces the built-in barrier potential Vbi, allowing exponential majority carrier diffusion. Reverse bias widens the depletion width and suppresses diffusion, leaving only tiny minority carrier reverse saturation current Is.',
    keyEquations: [
      'I = I_s * (e^{V / (\\eta V_t)} - 1)',
      'V_{bi} = V_t \\ln\\left(\\frac{N_A N_D}{n_i^2}\\right)',
      'W = \\sqrt{\\frac{2\\epsilon_s}{q}\\left(\\frac{1}{N_A} + \\frac{1}{N_D}\\right)(V_{bi} - V)}'
    ],
    parameters: [
      { name: 'Cut-in Voltage', symbol: 'V_γ', unit: 'V', typicalValue: '0.7 V (Si), 0.3 V (Ge)', description: 'Threshold forward voltage where current rises rapidly.' },
      { name: 'Reverse Saturation Current', symbol: 'I_s', unit: 'pA - nA', typicalValue: '10 pA', description: 'Thermally generated minority carrier leakage current.' },
      { name: 'Thermal Voltage (300K)', symbol: 'V_t', unit: 'mV', typicalValue: '25.86 mV', description: 'k*T / q at room temperature.' },
      { name: 'Depletion Capacitance', symbol: 'C_j', unit: 'pF', typicalValue: '2 - 20 pF', description: 'Capacitance associated with the space-charge layer.' }
    ],
    applications: ['AC to DC Rectifiers', 'Clipping & Clamping Circuits', 'Reverse Voltage Protection', 'Flyback Diode in Inductive Loads'],
    advantages: ['High forward current capability', 'Compact solid-state construction', 'Very low power consumption in OFF state'],
    limitations: ['Non-zero forward voltage drop (0.7V)', 'Reverse recovery time limits ultra-high frequency switching'],
    carrierType: 'Bipolar (Both)',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Low (~1 kΩ)',
    switchingSpeed: 'Moderate (~MHz)'
  },
  {
    id: 'zener-diode',
    name: 'Zener Diode',
    category: 'junction',
    symbol: '►|∿',
    tagline: 'Controlled reverse-breakdown voltage reference & regulator',
    module: 'MODULE 02',
    structureDescription: 'Heavily doped PN junction (NA, ND ~ 10¹⁸ cm⁻³) yielding an ultra-thin depletion region (~10 nm) capable of sustaining intense electric fields (> 10⁶ V/cm) at low voltages.',
    operatingPrinciple: 'Operates stably in the reverse breakdown regime. Below 5.6V, quantum mechanical Zener tunneling dominates (electrons tunnel through the narrow forbidden gap). Above 5.6V, avalanche multiplication dominates with a positive temperature coefficient.',
    keyEquations: [
      'V_Z = V_{Z0} + I_Z \\cdot R_Z',
      'P_{Z(max)} = V_Z \\cdot I_{Z(max)}',
      'R_Z = \\frac{\\Delta V_Z}{\\Delta I_Z}'
    ],
    parameters: [
      { name: 'Zener Breakdown Voltage', symbol: 'V_Z', unit: 'V', typicalValue: '3.3V, 5.1V, 12V', description: 'Nominal regulated reverse voltage.' },
      { name: 'Dynamic Resistance', symbol: 'R_Z', unit: 'Ω', typicalValue: '5 - 30 Ω', description: 'Slope resistance in the breakdown region.' },
      { name: 'Zener Knee Current', symbol: 'I_{ZK}', unit: 'mA', typicalValue: '0.25 - 1 mA', description: 'Minimum reverse current required to sustain breakdown.' }
    ],
    applications: ['DC Voltage Regulation', 'Overvoltage Protection & Clamping', 'Precision Voltage References', 'Waveform Shapers'],
    advantages: ['Maintains nearly constant voltage over large current variations', 'Self-recovering breakdown if within thermal limits'],
    limitations: ['Continuous power dissipation in regulation mode', 'Dynamic resistance causes slight voltage shifts under heavy load'],
    carrierType: 'Bipolar (Both)',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Reverse-dependent',
    switchingSpeed: 'Moderate (~MHz)'
  },
  {
    id: 'bjt',
    name: 'Bipolar Junction Transistor (BJT)',
    category: 'bipolar',
    symbol: 'NPN / PNP',
    tagline: 'Current-controlled bipolar current amplifier',
    module: 'MODULE 02',
    structureDescription: 'Three-terminal sandwich structure: heavily doped Emitter (N+), very thin and lightly doped Base (P), and moderately doped large-area Collector (N).',
    operatingPrinciple: 'Forward-biased Base-Emitter junction injects abundant electrons into the thin Base. Because the Base is extremely thin with low hole concentration, >99% of injected electrons diffuse across without recombining and get swept into the reverse-biased Collector by the high E-field.',
    keyEquations: [
      'I_C = \\beta \\cdot I_B + I_{CEO}',
      'I_E = I_B + I_C',
      '\\alpha = \\frac{\\beta}{1 + \\beta}',
      'V_{CE} = V_{CC} - I_C R_C'
    ],
    parameters: [
      { name: 'DC Current Gain', symbol: 'β (h_FE)', unit: 'ratio', typicalValue: '100 - 300', description: 'Ratio of collector current to base current in active mode.' },
      { name: 'Base-Emitter Drop', symbol: 'V_BE(on)', unit: 'V', typicalValue: '0.65 - 0.7 V', description: 'Forward bias required on BE junction.' },
      { name: 'Saturation Voltage', symbol: 'V_CE(sat)', unit: 'V', typicalValue: '0.1 - 0.2 V', description: 'Collector-emitter voltage when both junctions are forward biased.' },
      { name: 'Early Voltage', symbol: 'V_A', unit: 'V', typicalValue: '50 - 150 V', description: 'Base-width modulation extrapolation parameter.' }
    ],
    applications: ['Audio & RF Analog Amplifiers', 'Digital Inverter Switches', 'Current Mirrors & Sources', 'Oscillators'],
    advantages: ['High transconductance (gm = Ic/Vt)', 'Excellent analog linearity', 'High voltage handling capability'],
    limitations: ['Finite base input current required (causes loading)', 'Susceptible to thermal runaway due to negative tempco of VBE'],
    carrierType: 'Bipolar (Both)',
    controlMechanism: 'Current-controlled',
    inputImpedance: 'Low (~1 kΩ)',
    switchingSpeed: 'Moderate (~MHz)'
  },
  {
    id: 'jfet',
    name: 'Junction Field Effect Transistor (JFET)',
    category: 'fet',
    symbol: 'JFET-N',
    tagline: 'Depletion-mode voltage-controlled unipolar resistor & amplifier',
    module: 'MODULE 03',
    structureDescription: 'A conductive semiconductor channel (N-type) embedded between two reverse-biased P+ gate regions forming PN junctions along the channel sides.',
    operatingPrinciple: 'Applying a negative reverse voltage to the gate widens the depletion regions into the N-channel, constricting the conduction path. At pinch-off voltage Vp, the depletion boundaries meet, and the drain current saturates at IDSS.',
    keyEquations: [
      'I_D = I_{DSS} \\left(1 - \\frac{V_{GS}}{V_P}\\right)^2',
      'g_m = g_{m0} \\left(1 - \\frac{V_{GS}}{V_P}\\right)',
      'g_{m0} = \\frac{2 I_{DSS}}{|V_P|}'
    ],
    parameters: [
      { name: 'Saturation Drain Current', symbol: 'I_DSS', unit: 'mA', typicalValue: '5 - 15 mA', description: 'Drain current when VGS = 0V and VDS >= |Vp|.' },
      { name: 'Pinch-off Voltage', symbol: 'V_P', unit: 'V', typicalValue: '-2 to -6 V', description: 'Gate-source voltage that completely closes the channel.' },
      { name: 'Transconductance', symbol: 'g_m', unit: 'mS', typicalValue: '2 - 6 mS', description: 'Rate of change of ID with respect to VGS.' }
    ],
    applications: ['Low-noise Audio Preamplifiers', 'RF Front-End Mixers', 'Voltage-Controlled Resistor (VCR)', 'Analog Multiplexers'],
    advantages: ['Ultra-high input impedance (~10⁸ Ω)', 'Lower 1/f noise than MOSFETs', 'Majority carrier device (no minority carrier storage delays)'],
    limitations: ['Normally ON device (requires negative supply to turn off)', 'Lower transconductance than BJT'],
    carrierType: 'Majority',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Extremely High (>10¹² Ω)',
    switchingSpeed: 'Very High (~GHz)'
  },
  {
    id: 'mosfet',
    name: 'MOSFET (Metal-Oxide-Semiconductor FET)',
    category: 'fet',
    symbol: 'NMOS / PMOS',
    tagline: 'The supreme building block of modern microprocessors and VLSI circuits',
    module: 'MODULE 03',
    structureDescription: 'Insulated Gate (metal or polysilicon) separated from the P-substrate by an ultra-thin SiO₂ dielectric insulator (~1-2 nm), with isolated N+ Source and Drain diffusions.',
    operatingPrinciple: 'Applying a gate voltage VGS > Vth creates an electric field through the dielectric that repels majority holes from the surface and attracts minority electrons, creating an inverted N-channel connecting Source and Drain.',
    keyEquations: [
      'I_D = \\mu_n C_{ox} \\frac{W}{L} \\left[(V_{GS} - V_{th})V_{DS} - \\frac{V_{DS}^2}{2}\\right] \\quad (\\text{Linear})',
      'I_D = \\frac{1}{2} \\mu_n C_{ox} \\frac{W}{L} (V_{GS} - V_{th})^2 (1 + \\lambda V_{DS}) \\quad (\\text{Saturation})',
      'V_{DS(sat)} = V_{GS} - V_{th}'
    ],
    parameters: [
      { name: 'Threshold Voltage', symbol: 'V_th', unit: 'V', typicalValue: '0.4 - 1.2 V', description: 'Minimum gate voltage required for strong surface inversion.' },
      { name: 'Process Transconductance', symbol: 'k\'_n = μn Cox', unit: 'μA/V²', typicalValue: '100 - 300 μA/V²', description: 'Device technology transconductance parameter.' },
      { name: 'Aspect Ratio', symbol: 'W / L', unit: 'ratio', typicalValue: '1 - 50', description: 'Channel width over channel length design geometry.' },
      { name: 'Channel Length Modulation', symbol: 'λ', unit: 'V⁻¹', typicalValue: '0.01 - 0.05 V⁻¹', description: 'Finite output resistance factor in saturation.' }
    ],
    applications: ['CPUs, GPUs, and Microcontrollers', 'CMOS Logic Gates & Memories (SRAM/DRAM)', 'Switch-Mode Power Supplies (SMPS)', 'Class-D Audio Power Amps'],
    advantages: ['Virtually zero steady-state gate current (pure capacitive load)', 'High scalability down to nanometer dimensions', 'Thermal stability (positive tempco of Ron prevents hot-spotting)'],
    limitations: ['Gate oxide vulnerability to electrostatic discharge (ESD)', 'Short-channel effects at sub-20nm nodes'],
    carrierType: 'Majority',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Extremely High (>10¹² Ω)',
    switchingSpeed: 'Very High (~GHz)'
  },
  {
    id: 'cmos',
    name: 'CMOS Inverter (Complementary MOS)',
    category: 'fet',
    symbol: 'CMOS-NOT',
    tagline: 'Zero static power complementary logic architecture',
    module: 'MODULE 03',
    structureDescription: 'Series combination of a PMOS pull-up network to VDD and an NMOS pull-down network to GND with shared input gates and common output node.',
    operatingPrinciple: 'When Vin is LOW (0V), PMOS is strongly ON and NMOS is OFF, pulling Vout to VDD. When Vin is HIGH (VDD), NMOS is ON and PMOS is OFF, pulling Vout to GND. Static current is strictly limited to sub-threshold leakage.',
    keyEquations: [
      'V_M \\approx \\frac{V_{DD} - |V_{tp}| + V_{tn} \\sqrt{\\beta_n / \\beta_p}}{1 + \\sqrt{\\beta_n / \\beta_p}}',
      'P_{dynamic} = C_L V_{DD}^2 f',
      'NM_L = V_{IL} - V_{OL}, \\quad NM_H = V_{OH} - V_{IH}'
    ],
    parameters: [
      { name: 'Supply Voltage', symbol: 'V_DD', unit: 'V', typicalValue: '1.2V - 5.0V', description: 'Operating logic rail voltage.' },
      { name: 'Switching Threshold', symbol: 'V_M', unit: 'V', typicalValue: 'V_DD / 2', description: 'Midpoint voltage where Vin = Vout.' },
      { name: 'Noise Margin High', symbol: 'NM_H', unit: 'V', typicalValue: '~0.4 V_DD', description: 'Noise tolerance for logic 1.' },
      { name: 'Noise Margin Low', symbol: 'NM_L', unit: 'V', typicalValue: '~0.4 V_DD', description: 'Noise tolerance for logic 0.' }
    ],
    applications: ['All Digital Microprocessors & SoCs', 'Static RAM cells (6T-SRAM)', 'Digital signal processors', 'FPGA configurable logic blocks'],
    advantages: ['Near-zero static power dissipation', 'Extremely high noise margins (~Vdd/2)', 'Rail-to-rail voltage swing'],
    limitations: ['Dynamic power scales with clock frequency', 'Subject to CMOS latchup if parasitic SCR is triggered'],
    carrierType: 'Majority',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Extremely High (>10¹² Ω)',
    switchingSpeed: 'Very High (~GHz)'
  },
  {
    id: 'finfet',
    name: 'FinFET (Tri-Gate 3D Transistor)',
    category: 'fet',
    symbol: 'FinFET',
    tagline: '3D multi-gate architecture defeating short-channel effects',
    module: 'MODULE 03',
    structureDescription: 'A vertical silicon fin projecting above the substrate, wrapped on three sides by the gate dielectric and gate electrode.',
    operatingPrinciple: 'By wrapping the gate around 3 sides of the ultra-thin vertical channel fin, electrostatic control over channel potential is dramatically enhanced, suppressing drain-induced barrier lowering (DIBL) and sub-threshold leakage.',
    keyEquations: [
      'W_{eff} = 2 \\cdot H_{fin} + W_{fin}',
      'S = \\ln(10) \\cdot \\frac{kT}{q} \\cdot \\left(1 + \\frac{C_{dep}}{C_{ox}}\\right) \\approx 65\\text{ mV/dec}',
      '\\text{DIBL} = \\frac{\\Delta V_{th}}{\\Delta V_{DS}}'
    ],
    parameters: [
      { name: 'Fin Height', symbol: 'H_fin', unit: 'nm', typicalValue: '30 - 60 nm', description: 'Vertical height of the conductive silicon fin.' },
      { name: 'Fin Width', symbol: 'W_fin', unit: 'nm', typicalValue: '5 - 10 nm', description: 'Thickness of the channel fin.' },
      { name: 'Subthreshold Swing', symbol: 'S', unit: 'mV/dec', typicalValue: '65 - 72 mV/dec', description: 'Steepness of turn-on characteristic.' }
    ],
    applications: ['Cutting-edge 7nm, 5nm, 3nm processor nodes', 'High-density smartphone APUs', 'Server CPUs and AI accelerators'],
    advantages: ['Exceptional electrostatic channel control', 'Dramatically reduced subthreshold leakage', 'High drive current per unit silicon footprint'],
    limitations: ['Complex 3D lithography and etching', 'Self-heating effects due to poor thermal dissipation through thin fin'],
    carrierType: 'Majority',
    controlMechanism: 'Field-induced',
    inputImpedance: 'Extremely High (>10¹² Ω)',
    switchingSpeed: 'Ultra-high (~100 GHz)'
  },
  {
    id: 'led',
    name: 'Light Emitting Diode (LED)',
    category: 'opto',
    symbol: '►|↷',
    tagline: 'Direct bandgap spontaneous photon radiator',
    module: 'MODULE 04',
    structureDescription: 'Forward-biased direct-bandgap compound semiconductor PN junction (e.g. GaAs, InGaN, AlGaAs) designed with high injection efficiency and transparent packaging.',
    operatingPrinciple: 'Under forward bias, injected minority electrons and holes recombine radiatively across the direct energy bandgap Eg, emitting photons of wavelength λ = hc / Eg without requiring phonon assistance.',
    keyEquations: [
      '\\lambda = \\frac{h c}{E_g} \\approx \\frac{1240\\text{ nm}}{E_g\\text{ (eV)}}',
      '\\eta_{ext} = \\eta_{int} \\cdot \\eta_{extraction}',
      'P_{opt} = \\eta_{ext} \\cdot \\frac{h\\nu}{q} \\cdot I'
    ],
    parameters: [
      { name: 'Energy Bandgap', symbol: 'E_g', unit: 'eV', typicalValue: '1.42 (IR) to 3.4 eV (Blue/UV)', description: 'Semiconductor bandgap determining emission color.' },
      { name: 'Forward Voltage', symbol: 'V_F', unit: 'V', typicalValue: '1.8V (Red) - 3.3V (Blue)', description: 'Threshold operating voltage.' },
      { name: 'Peak Wavelength', symbol: 'λ_peak', unit: 'nm', typicalValue: '450 - 660 nm', description: 'Dominant emitted spectral color.' }
    ],
    applications: ['Solid-State General Lighting', 'Display Backlights & MicroLED screens', 'Optical Fiber Communications', 'Automotive Headlamps'],
    advantages: ['Enormous luminous efficacy (>150 lm/W)', 'Lifespan > 50,000 hours', 'Instantaneous nanosecond switching response'],
    limitations: ['Thermal droop at elevated drive currents', 'Requires current-limiting resistor or constant-current driver'],
    carrierType: 'Photons & Carriers',
    controlMechanism: 'Current-controlled',
    inputImpedance: 'Low (~1 kΩ)',
    switchingSpeed: 'Nanoseconds'
  },
  {
    id: 'solar-cell',
    name: 'Photovoltaic Solar Cell',
    category: 'opto',
    symbol: '☼►|',
    tagline: 'Light-harvesting renewable energy generator',
    module: 'MODULE 04',
    structureDescription: 'Large-area planar PN junction with an ultra-thin front N+ emitter layer, front metal contact grid fingerlines, and anti-reflective coating.',
    operatingPrinciple: 'Incident photons with energy hν > Eg generate electron-hole pairs throughout the depletion and quasi-neutral regions. The built-in electric field separates these pairs before they can recombine, driving photogenerated current Iph toward the external load in the fourth quadrant of the I-V plane.',
    keyEquations: [
      'I = I_{ph} - I_s \\left(e^{qV / (k T)} - 1\\right)',
      'V_{oc} = \\frac{k T}{q} \\ln\\left(\\frac{I_{ph}}{I_s} + 1\\right)',
      'FF = \\frac{P_{max}}{V_{oc} \\cdot I_{sc}} = \\frac{V_{mp} \\cdot I_{mp}}{V_{oc} \\cdot I_{sc}}',
      '\\eta = \\frac{P_{max}}{P_{in}} = \\frac{V_{oc} \\cdot I_{sc} \\cdot FF}{A \\cdot G}'
    ],
    parameters: [
      { name: 'Open-Circuit Voltage', symbol: 'V_oc', unit: 'V', typicalValue: '0.6 - 0.72 V (Si)', description: 'Maximum voltage produced under zero load current.' },
      { name: 'Short-Circuit Current', symbol: 'I_sc', unit: 'A', typicalValue: '3.5 - 9.0 A', description: 'Current produced when terminals are shorted together.' },
      { name: 'Fill Factor', symbol: 'FF', unit: '%', typicalValue: '75% - 84%', description: 'Ratio of maximum harvestable power to rectangular Voc*Isc product.' },
      { name: 'Power Conversion Efficiency', symbol: 'η', unit: '%', typicalValue: '18% - 24%', description: 'Fraction of solar irradiance converted to electricity.' }
    ],
    applications: ['Rooftop & Utility Photovoltaic Power', 'Satellite and Spacecraft Power Systems', 'Portable Solar Chargers & Calculators'],
    advantages: ['Zero emissions, completely silent, inexhaustible solar resource', 'Solid-state durability with 25+ year lifespan'],
    limitations: ['Efficiency constrained by Shockley-Queisser thermodynamic limit (~33%)', 'Intermittent generation requiring energy storage'],
    carrierType: 'Photons & Carriers',
    controlMechanism: 'Optical-controlled',
    inputImpedance: 'Low (~1 kΩ)',
    switchingSpeed: 'Moderate (~MHz)'
  },
  {
    id: 'pin-diode',
    name: 'PIN Diode',
    category: 'special',
    symbol: 'P-I-N',
    tagline: 'Current-controlled RF variable resistor & fast photodetector',
    module: 'MODULE 05',
    structureDescription: 'Features a wide, high-resistivity intrinsic (or lightly doped) semiconductor layer sandwiched between heavily doped P+ and N+ contact regions.',
    operatingPrinciple: 'Under forward DC bias, holes and electrons are injected into the intrinsic region, filling it with plasma and lowering its RF resistance inversely with DC current. Under reverse bias, the thick I-region yields very low junction capacitance and high breakdown voltage.',
    keyEquations: [
      'R_{RF} \\approx \\frac{W^2}{2 \\mu_{eff} \\tau I_{DC}}',
      'C_j = \\frac{\\epsilon_s A}{W}',
      'V_{br} \\approx E_{crit} \\cdot W'
    ],
    parameters: [
      { name: 'I-Region Width', symbol: 'W', unit: 'μm', typicalValue: '10 - 100 μm', description: 'Thickness of the intrinsic semiconductor layer.' },
      { name: 'Carrier Lifetime', symbol: 'τ', unit: 'μs', typicalValue: '1 - 10 μs', description: 'Recombination lifetime in the intrinsic layer.' },
      { name: 'RF Series Resistance', symbol: 'R_s', unit: 'Ω', typicalValue: '0.5 - 10,000 Ω', description: 'High-frequency resistance tuned by DC bias current.' }
    ],
    applications: ['RF & Microwave Attenuators', 'RF Antenna T/R Switches', 'High-speed Nuclear & X-ray Detectors'],
    advantages: ['Wide dynamic resistance range at RF frequencies without harmonic distortion', 'Extremely low parasitic junction capacitance'],
    limitations: ['Slow switching between forward and reverse states due to stored carrier charge in thick I-layer'],
    carrierType: 'Bipolar (Both)',
    controlMechanism: 'Current-controlled',
    inputImpedance: 'Reverse-dependent',
    switchingSpeed: 'Nanoseconds'
  },
  {
    id: 'varactor-diode',
    name: 'Varactor Diode (Varicap)',
    category: 'special',
    symbol: '►|├',
    tagline: 'Voltage-variable semiconductor tuning capacitor',
    module: 'MODULE 05',
    structureDescription: 'Specifically engineered PN junction with hyper-abrupt doping profiles optimized to maximize reverse capacitance sensitivity to applied voltage.',
    operatingPrinciple: 'Operating exclusively in reverse bias, increasing reverse voltage expands the depletion layer width W. Because junction capacitance Cj = εA / W, increasing reverse bias smoothly decreases the capacitance.',
    keyEquations: [
      'C_j(V_R) = \\frac{C_{j0}}{\\left(1 + \\frac{V_R}{V_{bi}}\\right)^m}',
      'f_{res} = \\frac{1}{2\\pi \\sqrt{L \\cdot C_j(V_R)}}',
      'Q = \\frac{1}{2\\pi f C_j R_s}'
    ],
    parameters: [
      { name: 'Zero-Bias Capacitance', symbol: 'C_j0', unit: 'pF', typicalValue: '10 - 100 pF', description: 'Junction capacitance at zero applied reverse voltage.' },
      { name: 'Capacitance Ratio', symbol: 'C_max / C_min', unit: 'ratio', typicalValue: '3:1 to 6:1', description: 'Tuning range across allowable reverse voltage window.' },
      { name: 'Grading Coefficient', symbol: 'm', unit: 'ratio', typicalValue: '0.5 (abrupt), 1-2 (hyperabrupt)', description: 'Exponent determining C-V tuning steepness.' }
    ],
    applications: ['Voltage-Controlled Oscillators (VCO)', 'Phase-Locked Loops (PLL)', 'RF Frequency Synthesizers', 'Parametric Amplifiers'],
    advantages: ['Solid-state electronic tuning without moving parts', 'High Quality Factor (Q > 100) at RF frequencies'],
    limitations: ['Limited linear range', 'Susceptible to RF signal rectifications if AC amplitude approaches reverse bias'],
    carrierType: 'Majority',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Reverse-dependent',
    switchingSpeed: 'Very High (~GHz)'
  },
  {
    id: 'tunnel-diode',
    name: 'Tunnel Diode (Esaki Diode)',
    category: 'special',
    symbol: '►|]',
    tagline: 'Degenerately doped quantum mechanical negative resistance diode',
    module: 'MODULE 05',
    structureDescription: 'Fabricated with extreme degenerate doping (>10¹⁹ cm⁻³) on both sides, forcing Fermi levels into the conduction band (N-side) and valence band (P-side), with depletion width < 10 nm.',
    operatingPrinciple: 'At small forward bias, filled conduction band states on the N-side align with empty valence band states on the P-side, permitting direct quantum tunneling and a surge to peak current Ip. As voltage increases further, the band overlap vanishes, causing current to drop to valley current Iv, producing Negative Differential Resistance (NDR).',
    keyEquations: [
      'R_n = \\frac{\\Delta V}{\\Delta I} < 0 \\quad (\\text{for } V_p < V < V_v)',
      'f_{cutoff} = \\frac{1}{2\\pi |R_n| C_j} \\sqrt{\\frac{|R_n|}{R_s} - 1}'
    ],
    parameters: [
      { name: 'Peak Current', symbol: 'I_P', unit: 'mA', typicalValue: '5 - 50 mA', description: 'Maximum quantum tunneling current.' },
      { name: 'Peak Voltage', symbol: 'V_P', unit: 'mV', typicalValue: '50 - 100 mV', description: 'Forward voltage corresponding to peak current.' },
      { name: 'Valley Current', symbol: 'I_V', unit: 'mA', typicalValue: '0.5 - 5 mA', description: 'Minimum current after tunneling terminates.' },
      { name: 'Peak-to-Valley Current Ratio', symbol: 'PVCR', unit: 'ratio', typicalValue: '5:1 - 15:1', description: 'Figure of merit for switching dynamic range.' }
    ],
    applications: ['Microwave Oscillators (up to 100 GHz)', 'Ultra-fast Nanosecond Pulse Generators', 'High-speed bistable logic circuits'],
    advantages: ['Quantum tunneling occurs at the speed of light (no transit time limitations)', 'Operates at extreme cryogenic and high radiation environments'],
    limitations: ['Two-terminal device with poor input-output isolation', 'Low output voltage swing (< 0.5 V)'],
    carrierType: 'Majority',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Low (~1 kΩ)',
    switchingSpeed: 'Ultra-high (~100 GHz)'
  },
  {
    id: 'gunn-diode',
    name: 'Gunn Diode (Transferred Electron Device)',
    category: 'special',
    symbol: '⊳|⊲',
    tagline: 'Bulk transferred-electron microwave oscillator',
    module: 'MODULE 05',
    structureDescription: 'Uniformly doped N-type slice of compound semiconductor (GaAs or InP) possessing a two-valley conduction band structure without any physical PN junction.',
    operatingPrinciple: 'Under low electric field, electrons reside in the lower energy valley with low effective mass and high mobility. When E exceeds threshold field Eth (~3.2 kV/cm for GaAs), electrons scatter into upper valleys where effective mass is much higher, causing velocity to drop with increasing field. This negative differential mobility spawns high-field electron dipole domains that travel at transit velocity, generating microwave frequencies.',
    keyEquations: [
      'v = \\mu E \\quad (\\text{below } E_{th})',
      'f = \\frac{v_{drift}}{L} \\approx \\frac{10^7\\text{ cm/s}}{L}',
      'E_{th} \\approx 3.2\\text{ kV/cm (GaAs)}'
    ],
    parameters: [
      { name: 'Threshold Electric Field', symbol: 'E_th', unit: 'kV/cm', typicalValue: '3.2 kV/cm (GaAs)', description: 'Field required to initiate intervalley electron transfer.' },
      { name: 'Saturation Drift Velocity', symbol: 'v_sat', unit: 'cm/s', typicalValue: '1 × 10⁷ cm/s', description: 'Domain transit speed across active length.' },
      { name: 'Operating Frequency', symbol: 'f_osc', unit: 'GHz', typicalValue: '10 - 100 GHz', description: 'Microwave frequency determined by slice thickness.' }
    ],
    applications: ['Automotive Radar (77 GHz)', 'Police Radar Speed Detectors', 'Microwave Motion Sensors', 'Local Oscillators in Satellite Receivers'],
    advantages: ['Simplest solid-state microwave source (pure bulk effect)', 'High reliability with low phase noise'],
    limitations: ['Low power conversion efficiency (< 5%)', 'Severe heat dissipation requires substantial heat sinking'],
    carrierType: 'Majority',
    controlMechanism: 'Voltage-controlled',
    inputImpedance: 'Low (~1 kΩ)',
    switchingSpeed: 'Ultra-high (~100 GHz)'
  },
  {
    id: 'impatt-diode',
    name: 'IMPATT Diode',
    category: 'special',
    symbol: 'IMPATT',
    tagline: 'Impact avalanche transit-time high-power microwave generator',
    module: 'MODULE 05',
    structureDescription: 'Multi-layer semiconductor structure (such as P+-N-I-N+ or Read structure) with a narrow avalanche generation zone adjacent to a wide drift transit zone.',
    operatingPrinciple: 'Operates under reverse avalanche breakdown. The avalanche multiplication process injects a 90° phase lag between the AC voltage and the generated carrier pulse. A subsequent transit time delay through the drift zone adds another 90° phase lag, delivering a total 180° phase inversion between RF voltage and current (negative RF resistance).',
    keyEquations: [
      '\\theta = \\omega \\tau = \\pi \\quad (180^\\circ \\text{ dynamic phase delay})',
      'f_0 = \\frac{v_{sat}}{2 L_d}',
      'P_{out} \\propto \\frac{1}{f^2}'
    ],
    parameters: [
      { name: 'Avalanche Breakdown Voltage', symbol: 'V_br', unit: 'V', typicalValue: '50 - 150 V', description: 'High reverse bias required for avalanche impact ionization.' },
      { name: 'Drift Zone Length', symbol: 'L_d', unit: 'μm', typicalValue: '1 - 5 μm', description: 'Transit distance defining microwave frequency.' },
      { name: 'RF Output Power', symbol: 'P_RF', unit: 'W', typicalValue: '1 - 20 W (pulsed)', description: 'Highest power output of any solid-state microwave diode.' }
    ],
    applications: ['Military Radar Transmitters', 'Missile Guidance Systems', 'Millimeter-Wave Communication Links (30 - 300 GHz)'],
    advantages: ['Highest continuous and pulsed microwave power among solid-state devices', 'Capable of operating up to 300 GHz'],
    limitations: ['High avalanche noise figure (poor for low-noise receivers)', 'Operates at the brink of catastrophic thermal destruction'],
    carrierType: 'Bipolar (Both)',
    controlMechanism: 'Current-controlled',
    inputImpedance: 'Reverse-dependent',
    switchingSpeed: 'Ultra-high (~100 GHz)'
  }
];

export const PHYSICAL_CONSTANTS = {
  q: 1.602176634e-19, // Coulomb
  kB: 1.380649e-23, // J/K
  kBeV: 8.617333262e-5, // eV/K
  h: 6.62607015e-34, // J*s
  c: 2.99792458e8, // m/s
  eps0: 8.8541878128e-12, // F/m
  epsSi: 11.7 * 8.8541878128e-12, // F/m
  epsOx: 3.9 * 8.8541878128e-12, // F/m
  niSi300K: 1.5e10 // cm^-3
};
