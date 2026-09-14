import { ExperimentItem } from '../types';

export const VIRTUAL_EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'exp-pn-forward',
    title: 'Forward-Biased PN Junction Diode V-I Characteristics',
    module: 'MODULE 02',
    difficulty: 'Beginner',
    durationMinutes: 20,
    objective: 'To plot the static forward V-I characteristics of a Silicon PN junction diode and determine its cut-in (knee) voltage and static/dynamic forward resistances.',
    apparatus: [
      'Variable Regulated DC Power Supply (0 - 5V)',
      'Digital DC Voltmeter (0 - 2V, high impedance)',
      'Digital DC Milliammeter (0 - 50 mA)',
      'Silicon Diode (1N4007 or equivalent)',
      'Current Limiting Resistor (100 Ω, 0.5W)',
      'Connecting Wires / Breadboard'
    ],
    theory: 'In forward bias, the positive supply terminal is connected to the P-region and the negative terminal to the N-region. This counteracts the internal built-in potential barrier Vbi (~0.7V for Si). For V < 0.6V, current is negligible. Beyond the cut-in voltage Vγ (~0.7V), the barrier collapses and current increases exponentially following the Shockley diode equation: I = Is(exp(qV/ηkT) - 1). The dynamic forward resistance is determined as rf = ΔV / ΔI in the steep linear region.',
    formula: 'r_f = \\frac{\\Delta V_f}{\\Delta I_f}, \\quad I = I_s \\left(e^{\\frac{V}{\\eta V_t}} - 1\\right)',
    procedureSteps: [
      'Connect the circuit with DC supply, series resistor (100 Ω), ammeter, and PN diode.',
      'Set the applied DC voltage to 0.0 V and verify initial reading (0 mA).',
      'Increase the diode voltage in steps of 0.1 V up to 0.6 V, observing small leakage current.',
      'Beyond 0.6 V, increase in fine increments of 0.02 V up to 0.8 V, observing rapid current growth.',
      'Click "ADD READING" at each test point to populate the observation table.',
      'Examine the resulting V-I curve, measure the knee voltage and calculate dynamic resistance.'
    ],
    defaultControls: { voltage: 0.65, temperature: 300 },
    controlConfig: [
      { id: 'voltage', label: 'Diode Voltage V_D', min: 0, max: 0.85, step: 0.05, unit: 'V' },
      { id: 'temperature', label: 'Junction Temperature', min: 250, max: 400, step: 10, unit: 'K' }
    ],
    calculateReading: (params) => {
      const V = params.voltage;
      const T = params.temperature;
      const Vt = (1.38e-23 * T) / 1.602e-19; // ~0.0258V at 300K
      const Is = 1e-11 * Math.pow(T / 300, 3) * Math.exp((-1.12 / (8.617e-5)) * (1 / T - 1 / 300));
      const eta = 1.1;
      const current_A = Is * (Math.exp(Math.min(V / (eta * Vt), 28)) - 1);
      const current_mA = Math.max(0, current_A * 1000);
      const rf = current_mA > 1 ? (eta * Vt * 1000) / current_mA : 9999;
      return {
        primaryValue: Number(V.toFixed(2)),
        secondaryValue: Number(current_mA.toFixed(2)),
        metrics: {
          'Dynamic Resistance (rf)': rf < 100 ? `${rf.toFixed(2)} Ω` : '> 1 kΩ',
          'Thermal Voltage (Vt)': `${(Vt * 1000).toFixed(1)} mV`,
          'Status': V < 0.65 ? 'Below Cut-in' : 'Conduction Region'
        }
      };
    },
    primaryAxis: { name: 'Diode Forward Voltage (VD)', unit: 'V' },
    secondaryAxis: { name: 'Diode Forward Current (ID)', unit: 'mA' },
    quiz: [
      {
        question: 'What is the approximate cut-in voltage for a standard Silicon PN junction at 300K?',
        options: ['0.2 V', '0.7 V', '1.2 V', '3.3 V'],
        correctIndex: 1,
        explanation: 'For silicon, the built-in barrier potential is approximately 0.7 V at room temperature (0.3 V for Germanium).'
      },
      {
        question: 'How does the forward cut-in voltage change with increasing junction temperature?',
        options: ['Increases by 2 mV/°C', 'Decreases by approximately 2 mV/°C', 'Remains strictly unchanged', 'Doubles every 10°C'],
        correctIndex: 1,
        explanation: 'Due to the temperature dependence of intrinsic concentration and bandgap, the forward voltage drops by about -2.0 to -2.5 mV/°C at constant forward current.'
      }
    ]
  },
  {
    id: 'exp-zener-breakdown',
    title: 'Reverse-Biased Zener Diode V-I & Regulation Characteristics',
    module: 'MODULE 02',
    difficulty: 'Intermediate',
    durationMinutes: 25,
    objective: 'To plot reverse breakdown characteristics of a Zener diode and calculate Zener breakdown voltage Vz and dynamic impedance Rz.',
    apparatus: [
      'Regulated DC Power Supply (0 - 15 V)',
      'Zener Diode (5.1V / 500mW)',
      'Series Limiting Resistor (220 Ω)',
      'Digital Multimeter (Voltage)',
      'Digital Multimeter (Current)'
    ],
    theory: 'In a heavily doped PN junction, the depletion region is thin (<10nm). When reverse bias reaches the Zener breakdown potential Vz, quantum mechanical tunneling of valence electrons to the conduction band takes place (or avalanche multiplication for Vz > 5.6V). Once breakdown occurs, the diode voltage remains clamped at Vz while reverse current Iz can fluctuate widely, providing ideal DC voltage regulation.',
    formula: 'R_Z = \\frac{\\Delta V_Z}{\\Delta I_Z}, \\quad V_{out} = V_Z',
    procedureSteps: [
      'Connect the Zener diode in reverse bias with a 220 Ω series ballast resistor.',
      'Vary the supply voltage Vin from 0 V to 12 V.',
      'Record reverse diode voltage Vz and reverse current Iz at each step.',
      'Identify the sharp knee point where breakdown begins.',
      'Calculate dynamic Zener resistance Rz = ΔVz / ΔIz in the vertical breakdown region.'
    ],
    defaultControls: { vSupply: 5.5 },
    controlConfig: [
      { id: 'vSupply', label: 'Input Supply Voltage (Vin)', min: 0, max: 12, step: 0.5, unit: 'V' }
    ],
    calculateReading: (params) => {
      const Vin = params.vSupply;
      const Vz_nominal = 5.1;
      const R_series = 220; // ohms
      const Rz = 8; // ohms dynamic resistance
      let Vz = 0;
      let Iz_mA = 0;
      if (Vin <= Vz_nominal) {
        // Reverse saturation leakage
        Iz_mA = 0.005 * (Vin / Vz_nominal);
        Vz = Vin - (Iz_mA * 1e-3 * R_series);
      } else {
        // In breakdown
        const totalR = R_series + Rz;
        const current_A = (Vin - Vz_nominal) / totalR;
        Iz_mA = current_A * 1000;
        Vz = Vz_nominal + current_A * Rz;
      }
      return {
        primaryValue: Number(Vz.toFixed(2)),
        secondaryValue: Number(Iz_mA.toFixed(2)),
        metrics: {
          'Breakdown Status': Vin >= 5.1 ? 'Active Regulation' : 'Pre-breakdown',
          'Dynamic Resistance Rz': '8.0 Ω',
          'Power Dissipated': `${(Vz * Iz_mA).toFixed(1)} mW`
        }
      };
    },
    primaryAxis: { name: 'Reverse Voltage |V_Z|', unit: 'V' },
    secondaryAxis: { name: 'Reverse Current |I_Z|', unit: 'mA' },
    quiz: [
      {
        question: 'What is the dominant breakdown mechanism in Zener diodes with breakdown voltage below 5 V?',
        options: ['Avalanche multiplication', 'Quantum mechanical tunneling (Zener effect)', 'Thermal runaway', 'Impact ionization'],
        correctIndex: 1,
        explanation: 'Below 5.1V, the depletion layer is thin enough that intense electric fields enable direct quantum mechanical electron tunneling.'
      }
    ]
  },
  {
    id: 'exp-bjt-output',
    title: 'Common-Emitter BJT Output Characteristics (IC vs VCE)',
    module: 'MODULE 02',
    difficulty: 'Intermediate',
    durationMinutes: 30,
    objective: 'To plot Common-Emitter output characteristics (IC vs VCE) for varying base currents IB, identify Cutoff, Active, and Saturation regions, and determine output resistance ro and current gain β.',
    apparatus: [
      'Dual Regulated DC Power Supply (VBB 0-5V, VCC 0-20V)',
      'NPN Transistor (BC547 / 2N2222)',
      'Base Resistor RB (100 kΩ), Collector Resistor RC (1 kΩ)',
      'Digital DC Microammeter (0 - 100 μA for IB)',
      'Digital DC Milliammeter (0 - 50 mA for IC)',
      'Digital Voltmeters (VCE and VBE)'
    ],
    theory: 'In the Common-Emitter configuration, the output characteristics plot collector current IC versus collector-emitter voltage VCE for fixed values of base current IB. The three operating regions are: 1. Cutoff (IB = 0, both junctions reverse-biased, IC ≈ 0); 2. Saturation (VCE < 0.2V, both junctions forward-biased, IC limited by RC); 3. Active (BE forward-biased, BC reverse-biased, IC = β·IB, slight slope due to Early effect).',
    formula: 'I_C = \\beta \\cdot I_B \\left(1 + \\frac{V_{CE}}{V_A}\\right), \\quad r_o = \\frac{\\Delta V_{CE}}{\\Delta I_C}',
    procedureSteps: [
      'Set base current IB to a constant value (e.g., 20 μA).',
      'Vary VCE from 0 V to 10 V in steps of 0.5 V.',
      'Record IC at each VCE step.',
      'Repeat the test for IB = 40 μA, 60 μA, and 80 μA.',
      'Observe saturation knee (VCE(sat) ~ 0.2V) and flat active regions.'
    ],
    defaultControls: { VCE: 4.0, IB_uA: 40 },
    controlConfig: [
      { id: 'VCE', label: 'Collector-Emitter Voltage V_CE', min: 0, max: 12, step: 0.5, unit: 'V' },
      { id: 'IB_uA', label: 'Base Current I_B', min: 10, max: 80, step: 10, unit: 'μA' }
    ],
    calculateReading: (params) => {
      const Vce = params.VCE;
      const Ib_uA = params.IB_uA;
      const beta = 150;
      const VA = 80; // Early voltage
      // Saturation factor
      const satFactor = 1 - Math.exp(-Vce / 0.35);
      const Ic_mA = (beta * (Ib_uA * 1e-3)) * satFactor * (1 + Vce / VA);
      const region = Vce < 0.3 ? 'Saturation' : (Ib_uA === 0 ? 'Cutoff' : 'Active');
      return {
        primaryValue: Number(Vce.toFixed(1)),
        secondaryValue: Number(Ic_mA.toFixed(2)),
        metrics: {
          'Operating Region': region,
          'DC Gain β (h_FE)': beta.toString(),
          'Collector Dissipation': `${(Vce * Ic_mA).toFixed(1)} mW`
        }
      };
    },
    primaryAxis: { name: 'Collector-Emitter Voltage (VCE)', unit: 'V' },
    secondaryAxis: { name: 'Collector Current (IC)', unit: 'mA' },
    quiz: [
      {
        question: 'In the active amplification region of an NPN BJT, what are the biasing states of the junctions?',
        options: [
          'BE reverse-biased, BC forward-biased',
          'BE forward-biased, BC reverse-biased',
          'Both junctions forward-biased',
          'Both junctions reverse-biased'
        ],
        correctIndex: 1,
        explanation: 'Active mode requires the Base-Emitter junction to be forward-biased (to inject electrons) and Base-Collector junction to be reverse-biased (to collect them).'
      }
    ]
  },
  {
    id: 'exp-bjt-input',
    title: 'Common-Emitter BJT Input Characteristics (IB vs VBE)',
    module: 'MODULE 02',
    difficulty: 'Intermediate',
    durationMinutes: 20,
    objective: 'To plot CE input characteristics (IB vs VBE) for constant VCE and determine the dynamic input resistance hie.',
    apparatus: [
      'Dual DC Power Supplies',
      'NPN Transistor BC547',
      'Base Resistor (10 kΩ)',
      'Voltmeter & Microammeter'
    ],
    theory: 'The input characteristics reflect a forward-biased PN junction (Base-Emitter). As VCE increases, Early effect widens the BC depletion region, narrowing effective base width, which slightly reduces recombination in the base and shifts the curve to the right.',
    formula: 'h_{ie} = r_{in} = \\left.\\frac{\\Delta V_{BE}}{\\Delta I_B}\\right|_{V_{CE} = \\text{const}}',
    procedureSteps: [
      'Fix VCE at 2.0 V.',
      'Vary VBE from 0 V to 0.75 V in steps of 0.05 V.',
      'Measure base current IB in μA.',
      'Calculate dynamic input impedance hie.'
    ],
    defaultControls: { VBE: 0.68, VCE_fixed: 2.0 },
    controlConfig: [
      { id: 'VBE', label: 'Base-Emitter Voltage V_BE', min: 0.4, max: 0.78, step: 0.02, unit: 'V' },
      { id: 'VCE_fixed', label: 'Fixed V_CE', min: 1, max: 10, step: 1, unit: 'V' }
    ],
    calculateReading: (params) => {
      const Vbe = params.VBE;
      const Vt = 0.0258;
      const Ibo = 1e-8; // microamps scale factor
      const Ib_uA = Math.max(0, Ibo * (Math.exp((Vbe - 0.55) / (1.2 * Vt)) - 1));
      const hie = Ib_uA > 5 ? (1.2 * Vt * 1e6) / Ib_uA : 25000;
      return {
        primaryValue: Number(Vbe.toFixed(2)),
        secondaryValue: Number(Ib_uA.toFixed(1)),
        metrics: {
          'Dynamic Input Resistance hie': `${(hie / 1000).toFixed(2)} kΩ`,
          'Status': Vbe < 0.6 ? 'Sub-threshold' : 'Forward Conduction'
        }
      };
    },
    primaryAxis: { name: 'Base-Emitter Voltage (VBE)', unit: 'V' },
    secondaryAxis: { name: 'Base Current (IB)', unit: 'μA' },
    quiz: [
      {
        question: 'Why does an increase in VCE shift the input characteristic slightly to the right?',
        options: [
          'Collector heating',
          'Early effect (base-width modulation reducing base recombination)',
          'Zener tunneling',
          'Increase in emitter doping'
        ],
        correctIndex: 1,
        explanation: 'Higher VCE widens the collector depletion zone, narrowing neutral base width Wb. With fewer holes to recombine with in the base, base current IB decreases for the same VBE.'
      }
    ]
  },
  {
    id: 'exp-bjt-amplifier',
    title: 'Common-Emitter BJT Small-Signal Amplifier Voltage Gain',
    module: 'MODULE 02',
    difficulty: 'Advanced',
    durationMinutes: 35,
    objective: 'To study small-signal voltage amplification, measure gain Av, and observe 180° output phase inversion.',
    apparatus: [
      'Function Generator (Sine wave 1 kHz, 20 mVpp)',
      'Digital Storage Oscilloscope (Dual Channel)',
      'NPN Transistor (BC547)',
      'Biasing Resistors (R1, R2, RC, RE) and Coupling Capacitors'
    ],
    theory: 'In a Common-Emitter AC amplifier, a small AC voltage Vin applied to the base modulates base-emitter voltage, causing small-signal collector current ic = gm·vin. The signal produces an inverted voltage drop across RC, yielding an amplified inverted output Vout = -gm·RC·Vin.',
    formula: 'A_v = \\frac{V_{out}}{V_{in}} \\approx -\\frac{R_C}{r_e}, \\quad r_e = \\frac{26\\text{ mV}}{I_C}',
    procedureSteps: [
      'Set function generator to 1 kHz sine wave with 20 mV amplitude.',
      'Adjust collector resistor RC from 1 kΩ to 5 kΩ.',
      'Observe simultaneous CH1 (Vin) and CH2 (Vout) waveforms on the oscilloscope.',
      'Verify 180° phase difference and calculate peak-to-peak voltage gain Av.'
    ],
    defaultControls: { Vin_mV: 20, RC_kOhm: 3.3, IC_mA: 1.8 },
    controlConfig: [
      { id: 'Vin_mV', label: 'Input Signal Amplitude Vin', min: 5, max: 50, step: 5, unit: 'mV' },
      { id: 'RC_kOhm', label: 'Collector Resistor RC', min: 1.0, max: 5.0, step: 0.5, unit: 'kΩ' },
      { id: 'IC_mA', label: 'Quiescent Current IC', min: 0.5, max: 4.0, step: 0.5, unit: 'mA' }
    ],
    calculateReading: (params) => {
      const Vin = params.Vin_mV; // mV
      const RC = params.RC_kOhm * 1000; // ohms
      const IC = params.IC_mA * 1e-3; // A
      const re = 0.026 / IC; // ohms
      const Av = -(RC / re);
      const Vout_V = Math.abs(Av * (Vin / 1000));
      return {
        primaryValue: Number(params.RC_kOhm.toFixed(1)),
        secondaryValue: Number(Math.abs(Av).toFixed(1)),
        metrics: {
          'Voltage Gain |Av|': `${Math.abs(Av).toFixed(1)} V/V`,
          'Output Signal Vout': `${(Vout_V * 1000).toFixed(0)} mVpp`,
          'Phase Shift': '180° (Inverted)'
        }
      };
    },
    primaryAxis: { name: 'Collector Resistance (RC)', unit: 'kΩ' },
    secondaryAxis: { name: 'Voltage Gain Magnitude (|Av|)', unit: 'V/V' },
    quiz: [
      {
        question: 'Why is there an exact 180° phase shift between input and output in a Common-Emitter amplifier?',
        options: [
          'Because capacitors invert phase',
          'Because positive Vin increases IC, causing a larger drop across RC and pulling Vout lower',
          'Due to negative carrier mobility',
          'Because of quantum tunneling delays'
        ],
        correctIndex: 1,
        explanation: 'When base voltage swings positive, collector current increases. Because VCE = VCC - IC·RC, increased current pulls collector voltage down, producing 180° inversion.'
      }
    ]
  },
  {
    id: 'exp-cmos-inverter',
    title: 'CMOS Inverter Voltage Transfer Characteristics (VTC)',
    module: 'MODULE 03',
    difficulty: 'Intermediate',
    durationMinutes: 25,
    objective: 'To plot the Voltage Transfer Characteristics (VTC) of a CMOS inverter, evaluate switching threshold VM, and compute high and low noise margins (NMH, NML).',
    apparatus: [
      'CMOS IC (CD4007 or discrete NMOS/PMOS pair)',
      'Variable DC Input Supply (0 - 5V)',
      'Digital DC Voltmeter',
      'DC Power Supply VDD = 5.0 V'
    ],
    theory: 'A CMOS inverter uses a complementary PMOS pull-up and NMOS pull-down pair. Because both transistors are never simultaneously in low resistance except during switching transients, static DC power consumption is practically zero. The switching threshold VM occurs where Vin = Vout (approx VDD / 2 for balanced beta). The unity-gain points (dVo/dVi = -1) define VIL and VIH, which dictate the noise margins.',
    formula: 'NM_L = V_{IL} - V_{OL}, \\quad NM_H = V_{OH} - V_{IH}',
    procedureSteps: [
      'Connect supply VDD = 5.0 V.',
      'Sweep input voltage Vin from 0 V to 5 V in 0.2 V steps.',
      'Record output voltage Vout at each input step.',
      'Observe sharp transition at VM ~ 2.5 V.',
      'Compute noise margins from the curve.'
    ],
    defaultControls: { Vin: 2.5, VDD: 5.0 },
    controlConfig: [
      { id: 'Vin', label: 'Input Voltage V_in', min: 0, max: 5.0, step: 0.25, unit: 'V' },
      { id: 'VDD', label: 'Supply Voltage V_DD', min: 3.3, max: 5.0, step: 0.5, unit: 'V' }
    ],
    calculateReading: (params) => {
      const Vin = params.Vin;
      const Vdd = params.VDD;
      const Vthn = 0.8;
      const Vthp = 0.8;
      let Vout = 0;
      // Hyperbolic tangent approximation for realistic CMOS inverter curve
      const k = 10;
      const VM = Vdd / 2;
      Vout = Vdd * (0.5 - 0.5 * Math.tanh(k * (Vin - VM) / Vdd));
      const state = Vout > Vdd * 0.7 ? 'Logic HIGH (1)' : (Vout < Vdd * 0.3 ? 'Logic LOW (0)' : 'Transition Region');
      return {
        primaryValue: Number(Vin.toFixed(2)),
        secondaryValue: Number(Vout.toFixed(2)),
        metrics: {
          'Logic Output State': state,
          'Noise Margin NML': `${(VM - Vthn).toFixed(2)} V`,
          'Noise Margin NMH': `${(Vdd - VM - Vthp).toFixed(2)} V`
        }
      };
    },
    primaryAxis: { name: 'Input Voltage (Vin)', unit: 'V' },
    secondaryAxis: { name: 'Output Voltage (Vout)', unit: 'V' },
    quiz: [
      {
        question: 'Why does a CMOS inverter consume virtually zero static power when the input is held steady at 0V or 5V?',
        options: [
          'Because both transistors are turned ON simultaneously',
          'Because one of the two series transistors is always cut OFF, blocking DC path to ground',
          'Because the gate is connected to ground',
          'Because electron mobility drops to zero'
        ],
        correctIndex: 1,
        explanation: 'At Vin=0, NMOS is off; at Vin=VDD, PMOS is off. Hence no continuous DC path exists from VDD to GND in steady state.'
      }
    ]
  },
  {
    id: 'exp-solar-cell',
    title: 'Photovoltaic Solar Cell Fill Factor & Maximum Power Point',
    module: 'MODULE 04',
    difficulty: 'Intermediate',
    durationMinutes: 30,
    objective: 'To determine Open-Circuit Voltage Voc, Short-Circuit Current Isc, Maximum Power Point (Pmax), Fill Factor (FF), and Power Conversion Efficiency (η) of a silicon solar cell under varying illumination.',
    apparatus: [
      'Calibrated Silicon Solar Cell Test Fixture',
      'Halogen / LED Solar Simulator Light Source',
      'Precision Decade Resistance Box (0 - 10 kΩ)',
      'Digital Multimeters (Current and Voltage)',
      'Pyranometer / Lux Meter'
    ],
    theory: 'When photons with energy greater than the bandgap Eg hit the PN junction, electron-hole pairs are photogenerated. The internal electric field separates the carriers, creating photocurrent Iph in the reverse direction. Under load resistance RL, the cell operates in the 4th quadrant. The fill factor FF reflects the rectangularity of the I-V curve.',
    formula: 'FF = \\frac{V_{mp} \\cdot I_{mp}}{V_{oc} \\cdot I_{sc}} = \\frac{P_{max}}{V_{oc} \\cdot I_{sc}}, \\quad \\eta = \\frac{P_{max}}{P_{in}} \\times 100\\%',
    procedureSteps: [
      'Set light irradiance to 800 W/m².',
      'Adjust load resistor from 0 Ω (short circuit) to 10 kΩ (open circuit).',
      'Record voltage V and current I for each load resistance.',
      'Plot I-V and P-V curves.',
      'Determine the peak of the P-V curve (Pmax, Vmp, Imp) and calculate Fill Factor.'
    ],
    defaultControls: { irradiance: 1000, loadResistor: 2.0 },
    controlConfig: [
      { id: 'irradiance', label: 'Light Irradiance G', min: 200, max: 1200, step: 100, unit: 'W/m²' },
      { id: 'loadResistor', label: 'Load Resistance R_L', min: 0.1, max: 10.0, step: 0.5, unit: 'Ω' }
    ],
    calculateReading: (params) => {
      const G = params.irradiance;
      const RL = params.loadResistor;
      const Isc_nominal = 3.5 * (G / 1000); // Amps
      const Voc = 0.62 + 0.025 * Math.log(G / 1000 + 0.01);
      // Solve operating point on V + I*RL
      // Simplified implicit solver for diode load
      let V = 0;
      let I = Isc_nominal;
      for (let v_test = 0; v_test <= Voc; v_test += 0.01) {
        const i_diode = Isc_nominal * (1 - Math.exp((v_test - Voc) / 0.05));
        const i_load = v_test / RL;
        if (i_load >= i_diode) {
          V = v_test;
          I = i_load;
          break;
        }
      }
      const P = V * I;
      const Pmax = 0.78 * Voc * Isc_nominal;
      return {
        primaryValue: Number(V.toFixed(2)),
        secondaryValue: Number(I.toFixed(2)),
        metrics: {
          'Electrical Power': `${P.toFixed(2)} W`,
          'Fill Factor (FF)': '78.5 %',
          'Voc (Est)': `${Voc.toFixed(2)} V`,
          'Isc (Est)': `${Isc_nominal.toFixed(2)} A`
        }
      };
    },
    primaryAxis: { name: 'Terminal Voltage (V)', unit: 'V' },
    secondaryAxis: { name: 'Harvested Current (I)', unit: 'A' },
    quiz: [
      {
        question: 'What does a high Fill Factor (e.g. > 80%) signify for a photovoltaic solar cell?',
        options: [
          'High series resistance and excessive internal power loss',
          'High quality cell with low parasitic series resistance and high shunt resistance',
          'Low bandgap that absorbs infrared light only',
          'Inability to produce power in daylight'
        ],
        correctIndex: 1,
        explanation: 'A square I-V characteristic with FF > 80% indicates negligible series parasitic resistance Rs and very high shunt resistance Rsh, yielding maximum extractable power.'
      }
    ]
  },
  {
    id: 'exp-pin-carrier',
    title: 'PIN Semiconductor Carrier Dynamics & RF Attenuation',
    module: 'MODULE 05',
    difficulty: 'Advanced',
    durationMinutes: 25,
    objective: 'To investigate the variation of high-frequency dynamic RF resistance with DC forward bias in a PIN diode.',
    apparatus: [
      'RF Signal Source (100 MHz - 1 GHz)',
      'PIN Diode (e.g., SMP1302 or BAR64)',
      'Precision Variable DC Current Source (0 - 50 mA)',
      'RF Power Meter / Spectrum Analyzer',
      'Bias Tee Network (Inductor RFC + DC Blocking Capacitors)'
    ],
    theory: 'The intrinsic I-layer of a PIN diode stores injected charge carriers under DC forward current. At microwave and RF frequencies where the AC period is much shorter than carrier lifetime (T << τ), the diode behaves as a nearly pure variable resistor without rectifying the high-frequency signal.',
    formula: 'R_{RF} = \\frac{W^2}{2 \\mu_{eff} \\tau I_{DC}} \\propto \\frac{1}{I_{DC}}',
    procedureSteps: [
      'Apply 500 MHz RF signal at -10 dBm to the PIN diode via bias-T.',
      'Vary forward DC bias current IDC from 0.1 mA to 20 mA.',
      'Measure transmitted RF power and determine dynamic RF resistance.',
      'Verify inverse proportionality between R_RF and I_DC.'
    ],
    defaultControls: { IDC_mA: 2.0 },
    controlConfig: [
      { id: 'IDC_mA', label: 'DC Bias Current I_DC', min: 0.1, max: 20, step: 0.5, unit: 'mA' }
    ],
    calculateReading: (params) => {
      const Idc = params.IDC_mA;
      // R_RF = k / Idc
      const R_rf = Math.max(0.5, 120 / Idc);
      const attenuation_dB = 20 * Math.log10(1 + R_rf / 100);
      return {
        primaryValue: Number(Idc.toFixed(1)),
        secondaryValue: Number(R_rf.toFixed(2)),
        metrics: {
          'RF Dynamic Resistance': `${R_rf.toFixed(2)} Ω`,
          'RF Attenuation': `${attenuation_dB.toFixed(1)} dB`,
          'Carrier Lifetime τ': '2.5 μs'
        }
      };
    },
    primaryAxis: { name: 'Forward DC Current (IDC)', unit: 'mA' },
    secondaryAxis: { name: 'RF Series Resistance (R_RF)', unit: 'Ω' },
    quiz: [
      {
        question: 'Why does a forward-biased PIN diode not rectify microwave frequencies?',
        options: [
          'Because microwave photons have too little energy',
          'Because the RF signal period is far shorter than the carrier recombination lifetime in the thick I-region',
          'Because intrinsic silicon is a superconductor',
          'Because the magnetic field cancels the current'
        ],
        correctIndex: 1,
        explanation: 'Since carrier lifetime τ is much longer than the RF period, the injected electron-hole plasma cannot respond to cycle-by-cycle field reversals, presenting a pure linear RF resistance modulated by DC current.'
      }
    ]
  }
];

export const EXPERIMENTS = VIRTUAL_EXPERIMENTS;
