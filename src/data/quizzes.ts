import { QuizQuestion } from '../types';

export const QUIZ_DATABASE: QuizQuestion[] = [
  // Module 01: Semiconductor Electronics
  {
    id: 'q1-1',
    module: 'MODULE 01',
    topic: 'Fermi-Dirac Statistics',
    type: 'mcq',
    question: 'At absolute zero temperature (T = 0 K), what is the probability of an electron occupying an energy state located below the Fermi level (E < EF)?',
    options: ['0', '0.5', '1.0', 'Undefined'],
    correctAnswer: '1.0',
    explanation: 'According to Fermi-Dirac statistics f(E) = 1 / (1 + exp((E - EF)/kT)), for E < EF as T -> 0, the exponential term exp(-infinity) approaches 0, so f(E) = 1/(1+0) = 1.0 (all states below EF are fully occupied).'
  },
  {
    id: 'q1-2',
    module: 'MODULE 01',
    topic: 'Conductivity',
    type: 'numerical',
    question: 'Calculate the conductivity (in S/cm) of an N-type silicon sample with electron concentration n = 1×10¹⁶ cm⁻³, electron mobility μn = 1350 cm²/(V·s), and elementary charge q = 1.6×10⁻¹⁹ C (assuming negligible hole conduction).',
    options: ['2.16 S/cm', '0.216 S/cm', '21.6 S/cm', '0.0216 S/cm'],
    correctAnswer: '2.16 S/cm',
    explanation: 'Conductivity σ ≈ q·n·μn = (1.6×10⁻¹⁹ C) × (1×10¹⁶ cm⁻³) × (1350 cm²/(V·s)) = 2.16 S/cm.'
  },
  {
    id: 'q1-3',
    module: 'MODULE 01',
    topic: 'Einstein Relation',
    type: 'true-false',
    question: 'True or False: The Einstein relation states that the ratio of carrier diffusion coefficient (D) to carrier mobility (μ) is directly proportional to absolute temperature (T).',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'D/μ = (kB·T)/q = Vt. The thermal voltage and ratio scale directly linearly with absolute temperature T.'
  },
  {
    id: 'q1-4',
    module: 'MODULE 01',
    topic: 'Hall Effect',
    type: 'mcq',
    question: 'In a Hall effect measurement, if the measured Hall voltage VH has a negative polarity for standard current and magnetic field orientations, the majority charge carriers are:',
    options: ['Holes (P-type)', 'Electrons (N-type)', 'Photons', 'Phonons'],
    correctAnswer: 'Electrons (N-type)',
    explanation: 'The Hall coefficient sign is negative for electrons because the Lorentz force deflects negative charge carriers to the side face, building up a negative potential.'
  },

  // Module 02: Junctions & BJT
  {
    id: 'q2-1',
    module: 'MODULE 02',
    topic: 'PN Junction Depletion Region',
    type: 'mcq',
    question: 'When a reverse bias voltage is applied across an abrupt PN junction, how does the space-charge depletion width (W) change?',
    options: [
      'Decreases linearly with voltage',
      'Increases proportionally to √(Vbi + VR)',
      'Remains strictly constant',
      'Collapses to zero'
    ],
    correctAnswer: 'Increases proportionally to √(Vbi + VR)',
    explanation: 'The depletion width is given by W = √[(2ε/q)(1/NA + 1/ND)(Vbi + VR)], which widens with the square root of total reverse potential.'
  },
  {
    id: 'q2-2',
    module: 'MODULE 02',
    topic: 'BJT Current Gain',
    type: 'numerical',
    question: 'If a BJT in common-emitter configuration has a base current IB = 25 μA and collector current IC = 3.75 mA, what is the common-emitter DC current gain β (h_FE)?',
    options: ['75', '100', '150', '200'],
    correctAnswer: '150',
    explanation: 'β = IC / IB = (3.75 × 10⁻³ A) / (25 × 10⁻⁶ A) = 150.'
  },
  {
    id: 'q2-3',
    module: 'MODULE 02',
    topic: 'BJT Operating Regions',
    type: 'identification',
    question: 'Identify the BJT operating region when the Base-Emitter junction is forward-biased and the Base-Collector junction is reverse-biased:',
    options: ['Cutoff Region', 'Forward Active Region', 'Saturation Region', 'Inverted Active Region'],
    correctAnswer: 'Forward Active Region',
    explanation: 'Forward bias on BE injects carriers, while reverse bias on BC collects them, characteristic of the normal active linear amplification state.'
  },
  {
    id: 'q2-4',
    module: 'MODULE 02',
    topic: 'Zener Diode',
    type: 'mcq',
    question: 'Which of the following describes the temperature coefficient of breakdown voltage in a Zener diode with Vz > 6V (avalanche breakdown)?',
    options: ['Negative temperature coefficient', 'Positive temperature coefficient', 'Zero temperature coefficient', 'Logarithmic decay'],
    correctAnswer: 'Positive temperature coefficient',
    explanation: 'For Vz > 5.6V, avalanche breakdown dominates. Increased lattice vibrations at higher temperatures scatter carriers before they reach ionization threshold energy, requiring a higher voltage to cause breakdown (positive tempco).'
  },

  // Module 03: Field Effect Transistors
  {
    id: 'q3-1',
    module: 'MODULE 03',
    topic: 'JFET Pinch-off',
    type: 'mcq',
    question: 'In an N-channel JFET, pinch-off occurs when:',
    options: [
      'VGS = 0 V',
      'VDS >= VGS - VP (depletion regions touch at the drain end)',
      'Gate junction is forward-biased',
      'Drain current becomes zero'
    ],
    correctAnswer: 'VDS >= VGS - VP (depletion regions touch at the drain end)',
    explanation: 'At pinch-off, the reverse bias between gate and channel reaches the pinch-off voltage Vp near the drain terminal, causing the channel to constrict and current to saturate at IDSS.'
  },
  {
    id: 'q3-2',
    module: 'MODULE 03',
    topic: 'MOSFET Inversion',
    type: 'mcq',
    question: 'In an enhancement-mode NMOS transistor, strong inversion occurs at the silicon surface when:',
    options: [
      'VGS < 0 V',
      'Surface potential ψs reaches 2·ψB (twice the bulk Fermi potential)',
      'Threshold voltage equals zero',
      'Gate dielectric breaks down'
    ],
    correctAnswer: 'Surface potential ψs reaches 2·ψB (twice the bulk Fermi potential)',
    explanation: 'The classic condition for strong surface inversion is that surface band bending equals twice the bulk Fermi potential (ψs = 2ψB), producing an electron density at the surface equal to the hole density in the bulk substrate.'
  },
  {
    id: 'q3-3',
    module: 'MODULE 03',
    topic: 'CMOS Static Power',
    type: 'true-false',
    question: 'True or False: In a static CMOS logic gate, there is never a direct low-resistance path between the power supply (VDD) and ground (GND) during steady-state logic 0 or logic 1.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'Because PMOS and NMOS networks operate in complementary fashion, one of the two networks is always non-conducting in steady state, suppressing static DC power to pure leakage.'
  },
  {
    id: 'q3-4',
    module: 'MODULE 03',
    topic: 'FinFET 3D Architecture',
    type: 'mcq',
    question: 'What is the primary physical advantage of using a 3D FinFET structure over a conventional planar MOSFET?',
    options: [
      'Lower manufacturing costs',
      'Gate wraps around 3 sides of the channel fin, vastly improving electrostatic control and suppressing Short Channel Effects',
      'Eliminates the need for silicon entirely',
      'Operates only at cryogenic temperatures'
    ],
    correctAnswer: 'Gate wraps around 3 sides of the channel fin, vastly improving electrostatic control and suppressing Short Channel Effects',
    explanation: 'The tri-gate wrapping provides tight gate control over the entire vertical channel, minimizing drain-induced barrier lowering (DIBL) and sub-threshold leakage at sub-20nm nodes.'
  },

  // Module 04: Optoelectronic Devices
  {
    id: 'q4-1',
    module: 'MODULE 04',
    topic: 'LED Direct Bandgap',
    type: 'mcq',
    question: 'Why are direct-bandgap semiconductors (like GaAs or InGaN) preferred over indirect-bandgap semiconductors (like pure Si) for manufacturing efficient LEDs?',
    options: [
      'Silicon cannot conduct electricity',
      'Direct bandgap allows electrons to recombine directly with holes without requiring phonon momentum exchange, yielding high radiative efficiency',
      'Direct bandgap materials are always cheaper',
      'Silicon emits only gamma rays'
    ],
    correctAnswer: 'Direct bandgap allows electrons to recombine directly with holes without requiring phonon momentum exchange, yielding high radiative efficiency',
    explanation: 'In direct bandgap materials, the conduction band minimum aligns with the valence band maximum in k-space. Electron-hole recombination conserves momentum naturally, emitting a photon rather than wasting energy as heat.'
  },
  {
    id: 'q4-2',
    module: 'MODULE 04',
    topic: 'Solar Cell Fill Factor',
    type: 'numerical',
    question: 'A silicon solar cell has Voc = 0.60 V, Isc = 4.0 A, and generates a maximum power Pmax = 1.92 W at its maximum power point. Calculate its Fill Factor (FF).',
    options: ['60%', '75%', '80%', '88%'],
    correctAnswer: '80%',
    explanation: 'FF = Pmax / (Voc × Isc) = 1.92 W / (0.60 V × 4.0 A) = 1.92 / 2.40 = 0.80 = 80%.'
  },

  // Module 05: Special Devices
  {
    id: 'q5-1',
    module: 'MODULE 05',
    topic: 'Tunnel Diode Negative Resistance',
    type: 'mcq',
    question: 'The Negative Differential Resistance (NDR) region in a Tunnel Diode occurs because:',
    options: [
      'Thermal excitation increases resistance',
      'As forward bias increases past Vp, the overlap between filled conduction band states on the N-side and empty valence band states on the P-side begins to decrease',
      'Dielectric breakdown in the oxide layer',
      'Majority carriers freeze out'
    ],
    correctAnswer: 'As forward bias increases past Vp, the overlap between filled conduction band states on the N-side and empty valence band states on the P-side begins to decrease',
    explanation: 'When forward bias increases from peak voltage Vp to valley voltage Vv, the band overlap progressively diminishes, reducing tunneling probability and causing current to decline with increasing voltage.'
  },
  {
    id: 'q5-2',
    module: 'MODULE 05',
    topic: 'Varactor Diode',
    type: 'mcq',
    question: 'A Varactor diode functions as a voltage-controlled capacitor by operating in which bias condition?',
    options: ['Deep forward bias', 'Reverse bias', 'Unbiased thermal equilibrium', 'AC small-signal forward conduction'],
    correctAnswer: 'Reverse bias',
    explanation: 'In reverse bias, varying the reverse voltage widens or narrows the space-charge depletion width W, varying junction capacitance Cj = εA / W without allowing conductive forward current.'
  },
  {
    id: 'q5-3',
    module: 'MODULE 05',
    topic: 'Gunn Diode',
    type: 'true-false',
    question: 'True or False: A Gunn diode does not have a physical PN junction; its microwave oscillations originate from intervalley electron transfer in the bulk compound semiconductor.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'The Gunn effect is a bulk property of materials like GaAs or InP where electric fields transfer electrons from a high-mobility lower valley to a low-mobility upper valley.'
  }
];

export const QUIZ_QUESTIONS = QUIZ_DATABASE;
