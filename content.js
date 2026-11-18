// Cell Atlas text content.
// BASIC: student-level cards (middle / high school) for every clickable part of the whole-cell model.
// ORGANELLES: advanced write-ups for the detailed organelle models (side panel).

export const GROUP_LABELS = {
  Boundary: 'Boundary',
  Nucleus: 'Nucleus',
  Ribosomes: 'Protein builders',
  Endomembrane: 'Make, pack & ship',
  Energy: 'Energy',
  Digestion: 'Clean-up & recycling',
  Cytoskeleton: 'Skeleton & transport',
};

export const CELL_INTRO = {
  title: 'Animal Cell',
  text: 'Every animal, including you, is built from trillions of cells like this one. Each part inside has a job, a bit like departments in a busy factory. Tap any part to find out what it does.',
};

export const BASIC = {
  plasma_cell_membrane: {
    job: 'Controls what goes in and out',
    text: 'A thin, flexible skin around the whole cell, made of two layers of fat-like molecules called phospholipids. Proteins sit in it like boats on a sea. It lets useful things such as food and oxygen in, keeps harmful things out, and lets cells "talk" to each other with signals.',
    analogy: 'The security gate and walls of a factory.',
    fact: 'It is only about 8 nanometres thick, around 10,000 times thinner than a sheet of paper.',
  },
  cytoplasm_cytosol: {
    job: 'Holds everything in place',
    text: 'The jelly-like fluid that fills the cell between the membrane and the nucleus. It is mostly water with salts, sugars and proteins dissolved in it. All the organelles float in it, and many chemical reactions happen here, such as the first step of breaking down glucose (glycolysis).',
    analogy: 'The factory floor where everything sits and work goes on.',
    fact: 'About 70% of a cell is water.',
  },
  nucleus_nuclear_envelope: {
    job: 'The control centre',
    text: 'The largest organelle. It holds the cell\'s DNA, the instructions for building and running the cell. It is wrapped in a double membrane called the nuclear envelope, which keeps the DNA safe and separate from the rest of the cell.',
    analogy: 'The head office that keeps the master plans.',
    fact: 'The DNA inside one human nucleus would stretch about 2 metres if unwound.',
  },
  nuclear_pores: {
    job: 'Doors of the nucleus',
    text: 'Tiny gateways that pierce the nuclear envelope. They let messages (mRNA) leave the nucleus and let proteins that are needed inside come in. They are choosy, so only the right molecules get through.',
    analogy: 'Guarded doors of the head office.',
    fact: 'A human nucleus has a few thousand pores.',
  },
  nucleolus: {
    job: 'Makes ribosome parts',
    text: 'A dense, dark spot inside the nucleus. It is not wrapped in a membrane. Here the cell makes ribosomal RNA and starts building ribosomes, the machines that make proteins.',
    analogy: 'A workshop inside head office that builds the factory\'s machines.',
    fact: 'Busy cells that make lots of protein have large nucleoli.',
  },
  chromatin_dna_histones: {
    job: 'Stores genetic information',
    text: 'DNA wrapped around spool-like proteins called histones. Loosely packed chromatin is "open" and its genes can be read. When the cell gets ready to divide, chromatin coils up tightly into chromosomes. Human body cells have 46 chromosomes.',
    analogy: 'The master instruction books, neatly wound onto reels.',
    fact: 'Your DNA is about 99.9% the same as any other human\'s.',
  },
  free_ribosomes_polysomes: {
    job: 'Build proteins',
    text: 'Tiny machines that read a messenger RNA copy of a gene and join amino acids together to make a protein. Some float freely in the cytoplasm and make proteins used inside the cell. Others sit on the rough ER and make proteins to be exported. Ribosomes have no membrane.',
    analogy: 'Assembly-line machines that follow a recipe card.',
    fact: 'One cell can contain millions of ribosomes.',
  },
  bound_ribosomes_on_rer: {
    job: 'Build proteins for export',
    text: 'Ribosomes attached to the rough ER. The proteins they make are threaded straight into the ER to be folded, packed and sent out of the cell or into membranes.',
    analogy: 'Assembly lines that feed straight onto a conveyor belt.',
    fact: 'These ribosomes are what make the rough ER look "rough" under a microscope.',
  },
  rough_endoplasmic_reticulum_rer: {
    job: 'Makes and folds proteins',
    text: 'A folded network of flattened membrane sacs, joined to the nuclear envelope and covered with ribosomes. Proteins made by these ribosomes move inside the RER, where they are folded into the right shape and checked before being sent on to the Golgi.',
    analogy: 'The production line with quality control.',
    fact: 'Cells that make lots of protein to export, like those in the pancreas, are packed with rough ER.',
  },
  smooth_endoplasmic_reticulum_ser: {
    job: 'Makes fats, removes poisons',
    text: 'A network of tubes like the rough ER but with no ribosomes. It makes lipids (fats) such as the ones that build membranes and some hormones. In liver cells it helps break down drugs and poisons, and in muscle cells it stores calcium.',
    analogy: 'A chemical workshop and clean-up unit.',
    fact: 'Liver cells grow extra smooth ER when they must deal with lots of alcohol or drugs.',
  },
  golgi_apparatus: {
    job: 'Packs and ships proteins',
    text: 'A stack of flat, curved sacs. It receives proteins and lipids from the ER, finishes them (for example by adding sugar chains), sorts them and packs them into small bubbles called vesicles to send to the right place.',
    analogy: 'The post office: label, pack, and dispatch.',
    fact: 'It was discovered by the Italian scientist Camillo Golgi in 1898.',
  },
  transport_secretory_vesicles: {
    job: 'Carry cargo around the cell',
    text: 'Small membrane bubbles that carry proteins and other materials between organelles, or to the cell membrane. When a secretory vesicle joins the membrane it releases its contents outside the cell. This is called exocytosis.',
    analogy: 'Delivery vans.',
    fact: 'Nerve cells release their chemical messages using vesicles.',
  },
  mitochondrion: {
    job: 'Releases energy',
    text: 'The site of aerobic respiration. It uses oxygen to break down food molecules (from glucose) and stores the released energy in ATP, the cell\'s energy currency. It has two membranes; the inner one is folded into cristae to give more surface area.',
    analogy: 'The power station.',
    fact: 'Mitochondria have their own small DNA, inherited only from your mother.',
  },
  mitochondrion_sectioned: {
    job: 'Releases energy (cut open)',
    text: 'This mitochondrion has been cut open so you can see inside. Look for the smooth outer membrane, the folded inner membrane (cristae) and the fluid-filled centre called the matrix. Most ATP is made on the cristae.',
    analogy: 'A power station with the roof taken off.',
    fact: 'Active cells such as heart muscle can have thousands of mitochondria.',
  },
  peroxisome: {
    job: 'Breaks down fats and poisons',
    text: 'A small round sac with one membrane, filled with enzymes. It breaks down very long fatty acids and some toxins. This makes harmful hydrogen peroxide, which the enzyme catalase quickly turns into water and oxygen.',
    analogy: 'A safety room that handles dangerous chemicals.',
    fact: 'Catalase is one of the fastest enzymes known: millions of reactions per second.',
  },
  lysosome: {
    job: 'Digests and recycles',
    text: 'A small sac of digestive enzymes that works in acid. It breaks down worn-out organelles, food particles and germs the cell has swallowed, so the building blocks can be reused. Its membrane keeps the enzymes away from the rest of the cell.',
    analogy: 'The recycling plant.',
    fact: 'The inside of a lysosome is about 100 times more acidic than the cytoplasm.',
  },
  centrosome_centrioles: {
    job: 'Organises cell division',
    text: 'Found near the nucleus. It has two centrioles, short cylinders set at right angles, each made of nine groups of tiny tubes. During cell division it helps build the spindle that pulls the chromosomes apart.',
    analogy: 'The team leader who organises a big move.',
    fact: 'Most plant cells have no centrioles.',
  },
  pericentriolar_material: {
    job: 'Starts new microtubules',
    text: 'A cloud of proteins around the centrioles. This is where most new microtubules begin to grow, so it is the cell\'s main "microtubule-organising centre".',
    analogy: 'The depot where new tracks are laid from.',
    fact: 'It grows much bigger just before the cell divides.',
  },
  microtubules: {
    job: 'Tracks and support',
    text: 'Hollow tubes made of a protein called tubulin. They help the cell keep its shape and act as tracks along which motor proteins carry cargo. They also form the spindle in cell division and the core of cilia and flagella.',
    analogy: 'Railway tracks and scaffolding poles.',
    fact: 'Microtubules can grow and shrink in seconds.',
  },
  actin_microfilaments: {
    job: 'Shape and movement',
    text: 'The thinnest threads of the cytoskeleton, made of the protein actin. They form a mesh just under the membrane that gives the cell its shape, helps it crawl and change shape, and pinches the cell in two at the end of division.',
    analogy: 'Ropes and cables that pull and hold.',
    fact: 'Actin, working with myosin, is also what makes your muscles contract.',
  },
};

// Overview parts that can't be picked on their own get merged into another card.
export const MERGE = { bound_ribosomes_on_rer: 'free_ribosomes_polysomes' };
export const TITLE_OVERRIDE = { free_ribosomes_polysomes: 'Ribosomes (free & on rough ER)' };

export const ORGANELLES = {
  nucleus: {
    name: 'Nucleus',
    tagline: 'Genome storage, transcription and ribosome assembly',
    overview: [
      'The nucleus separates the genome from the cytoplasm. That separation lets eukaryotic cells process RNA (5′ capping, splicing, 3′ polyadenylation) before it reaches ribosomes, and gives them extra layers of gene regulation that bacteria do not have.',
      'Its envelope is two lipid bilayers. The outer nuclear membrane is continuous with the rough ER and carries ribosomes. The inner membrane is lined by the nuclear lamina, a mesh of lamin intermediate filaments that holds the nucleus in shape and anchors chromatin. The two membranes meet at nuclear pore complexes, which control all traffic in and out.',
      'Inside, chromatin is not random. Each chromosome occupies its own territory. Active euchromatin sits mostly toward the interior and silent heterochromatin toward the lamina and nucleolus. Membraneless bodies (the nucleolus, speckles and Cajal bodies) form by phase separation and concentrate the machinery for rRNA synthesis, splicing and snRNP assembly.',
    ],
    facts: [
      ['Diameter', '≈ 5–10 µm'],
      ['Membranes', '2 (nuclear envelope)'],
      ['Nuclear pores', '≈ 2,000–5,000 per nucleus'],
      ['Pore complex mass', '≈ 110 MDa, ~30 kinds of nucleoporin'],
      ['DNA content', '≈ 6.4 billion bp (diploid), ~2 m long'],
      ['Chromosomes', '46 in human somatic cells'],
    ],
    points: [
      'Transcription (DNA → RNA) happens here; translation happens in the cytoplasm.',
      'Small molecules diffuse through pores; proteins above about 40 kDa need a nuclear localisation signal (NLS) and importins.',
      'The nucleolus forms around rDNA repeats and makes 18S, 5.8S and 28S rRNA (RNA polymerase I).',
      'Mutations in LMNA (lamin A) cause progeria, a premature-ageing disease.',
    ],
  },
  mitochondrion: {
    name: 'Mitochondrion',
    tagline: 'Aerobic respiration and ATP synthesis',
    overview: [
      'Mitochondria carry out the oxygen-dependent stages of respiration: the link reaction and Krebs (citric acid) cycle in the matrix, and oxidative phosphorylation on the inner membrane. Together these produce most of the cell\'s ATP, about 30–32 ATP per glucose compared with 2 from glycolysis alone.',
      'The two membranes create separate compartments. The outer membrane is leaky thanks to porins (VDAC). The inner membrane is nearly impermeable and folded into cristae. The electron transport chain (Complexes I–IV) pumps protons into the intermembrane space; ATP synthase lets them flow back and uses that flow to turn ADP + Pi into ATP. This is Peter Mitchell\'s chemiosmotic theory (Nobel Prize 1978).',
      'Mitochondria descend from an α-proteobacterium engulfed about 2 billion years ago (endosymbiotic theory). Evidence: a double membrane, their own circular DNA, 70S-like ribosomes, and division by binary fission. They also control apoptosis by releasing cytochrome c, and they store calcium.',
    ],
    facts: [
      ['Size', '≈ 0.5–1 µm wide, 1–4 µm long'],
      ['Number', 'hundreds to thousands per cell'],
      ['Membranes', '2 (outer + folded inner)'],
      ['mtDNA', '16,569 bp, 37 genes'],
      ['mtDNA encodes', '13 proteins, 22 tRNAs, 2 rRNAs'],
      ['ATP yield', '≈ 30–32 ATP per glucose (aerobic)'],
    ],
    points: [
      'Krebs cycle enzymes are in the matrix; the electron transport chain and ATP synthase are in the inner membrane.',
      'O₂ is the final electron acceptor at Complex IV and is reduced to water.',
      'ATP synthase is a rotary motor: about 3 ATP per full turn of its rotor.',
      'mtDNA is inherited from the mother. Its mutations cause diseases such as LHON and MELAS.',
    ],
  },
  ribosome: {
    name: 'Ribosome',
    tagline: 'The protein-synthesis machine',
    overview: [
      'The ribosome translates messenger RNA into protein. It reads the mRNA three bases (one codon) at a time and adds the matching amino acid, brought by a transfer RNA, to the growing polypeptide chain.',
      'Eukaryotic ribosomes are 80S, made of a 60S large subunit and a 40S small subunit. Each is built from ribosomal RNA plus about 80 proteins in total. The small subunit decodes the mRNA. The large subunit holds the peptidyl transferase centre, which forms peptide bonds. That centre is made of RNA, not protein, so the ribosome is a ribozyme.',
      'tRNAs move through three sites in order: A (aminoacyl, arrival), P (peptidyl, holds the growing chain) and E (exit). The new chain leaves through a tunnel in the large subunit. Free ribosomes make cytosolic proteins. Ribosomes docked on the ER make secreted and membrane proteins.',
    ],
    facts: [
      ['Size', '≈ 25–30 nm, 80S'],
      ['Subunits', '60S (28S, 5.8S, 5S rRNA) + 40S (18S rRNA)'],
      ['Proteins', '≈ 80 ribosomal proteins'],
      ['Mass', '≈ 4.3 MDa'],
      ['Speed', '≈ 5–6 amino acids per second'],
      ['Membrane', 'none'],
    ],
    points: [
      'Subunits are assembled in the nucleolus and exported separately.',
      'Bacteria have smaller 70S ribosomes, which is why antibiotics such as streptomycin can target them selectively.',
      'Several ribosomes reading one mRNA together form a polysome.',
      'Elongation factor eEF1A delivers each aminoacyl-tRNA to the A site, using GTP.',
    ],
  },
  rough_er: {
    name: 'Rough Endoplasmic Reticulum',
    tagline: 'Entry point of the secretory pathway',
    overview: [
      'The rough ER is a system of flattened sheets (cisternae) studded with ribosomes, continuous with the outer nuclear membrane. It makes every protein that will be secreted, placed in the plasma membrane, or sent to the Golgi, lysosomes or the ER itself.',
      'Proteins enter during translation. When an N-terminal signal peptide comes out of the ribosome, the signal recognition particle (SRP) binds it and pauses translation. SRP then docks on its receptor in the ER membrane and hands the ribosome to the Sec61 translocon, and the chain is threaded through as it is made. Signal peptidase then cuts off the signal.',
      'In the lumen, chaperones (BiP, calnexin, calreticulin) and protein disulfide isomerase (PDI) fold the protein and form disulfide bonds, and N-linked glycans are added. Proteins that fail quality control are sent back out and destroyed by the proteasome (ERAD). If too much misfolded protein builds up, the cell switches on the unfolded protein response.',
    ],
    facts: [
      ['Structure', 'Flattened sheets with ribosomes'],
      ['Continuous with', 'Outer nuclear membrane'],
      ['Key machinery', 'SRP, SRP receptor, Sec61'],
      ['Modifications', 'Disulfide bonds, N-glycosylation'],
      ['Abundant in', 'Pancreatic acinar cells, plasma cells'],
      ['Exports via', 'COPII-coated vesicles'],
    ],
    points: [
      'Sheets are joined by helicoidal "Terasaki ramps", like a parking garage.',
      'Cystic fibrosis: the common ΔF508 CFTR protein misfolds, is held in the ER and destroyed.',
      'Insulin and antibodies are both made on rough ER.',
      'COPII vesicles carry finished cargo from ER exit sites toward the Golgi.',
    ],
  },
  smooth_er: {
    name: 'Smooth Endoplasmic Reticulum',
    tagline: 'Lipid synthesis, detoxification and calcium storage',
    overview: [
      'The smooth ER is a network of branching tubules with no ribosomes, continuous with the rough ER. Its jobs depend on the cell type, so its amount varies widely between tissues.',
      'Its membranes carry the enzymes that make phospholipids and cholesterol, and in the adrenal cortex, testes and ovaries, steroid hormones. In liver cells, cytochrome P450 enzymes oxidise drugs and toxins to make them more water-soluble so they can be excreted. The ER enzyme glucose-6-phosphatase releases glucose from glycogen stores into the blood.',
      'The smooth ER is also the cell\'s main calcium store. SERCA pumps use ATP to move Ca²⁺ into the lumen. IP₃ receptors release it in response to signals, triggering events such as secretion. In muscle this specialised ER is called the sarcoplasmic reticulum, and its calcium release starts contraction.',
    ],
    facts: [
      ['Structure', 'Branching tubules, no ribosomes'],
      ['Makes', 'Phospholipids, cholesterol, steroids'],
      ['Detox enzymes', 'Cytochrome P450 family'],
      ['Ca²⁺ in lumen', '≈ 0.1–1 mM (cytosol ≈ 0.1 µM)'],
      ['Ca²⁺ pump', 'SERCA'],
      ['Abundant in', 'Liver, adrenal cortex, Leydig cells'],
    ],
    points: [
      'Repeated exposure to drugs or alcohol makes liver SER expand, contributing to tolerance.',
      'Muscle sarcoplasmic reticulum releases Ca²⁺ through ryanodine receptors.',
      'Lipid droplets bud from the ER membrane to store fat.',
      'There is about a 10,000-fold Ca²⁺ gradient between the ER lumen and the cytosol.',
    ],
  },
  golgi_apparatus: {
    name: 'Golgi Apparatus',
    tagline: 'Processing and sorting of proteins and lipids',
    overview: [
      'The Golgi is a polarised stack of flattened cisternae. Cargo from the ER enters at the cis face (via the ER–Golgi intermediate compartment) and leaves from the trans face and the trans-Golgi network (TGN).',
      'As cargo moves cis → medial → trans, resident enzymes modify it step by step. N-linked glycans are trimmed (mannose removed) and rebuilt (N-acetylglucosamine, galactose and sialic acid added), O-linked glycans are added, and some proteins are sulfated or cut. In the cisternal maturation model the cisternae themselves move forward, and COPI vesicles carry resident enzymes and escaped ER proteins backwards.',
      'At the TGN, cargo is sorted. Lysosomal enzymes carry a mannose-6-phosphate tag and leave in clathrin-coated vesicles. Constitutive vesicles fuse with the membrane all the time. Secretory granules store hormones or enzymes until a signal triggers their release. Vesicles fuse with their targets using SNARE proteins.',
    ],
    facts: [
      ['Cisternae per stack', '≈ 4–8'],
      ['Faces', 'cis (receiving) and trans (shipping)'],
      ['Main coats', 'COPI (back), clathrin (TGN out)'],
      ['Lysosome tag', 'Mannose-6-phosphate'],
      ['Discovered', 'Camillo Golgi, 1898'],
      ['Location', 'Next to the nucleus and centrosome'],
    ],
    points: [
      'Escaped ER proteins with a KDEL signal are returned in COPI vesicles.',
      'I-cell disease: no mannose-6-phosphate tag, so lysosomal enzymes are secreted instead.',
      'In mammals, stacks are linked into a single "Golgi ribbon".',
      'Plant cells use Golgi vesicles to build the new cell wall after division.',
    ],
  },
  lysosome: {
    name: 'Lysosome',
    tagline: 'Acidic digestion, recycling and nutrient sensing',
    overview: [
      'Lysosomes are single-membrane organelles filled with roughly 60 kinds of acid hydrolases: proteases (cathepsins), lipases, nucleases, glycosidases, phosphatases and sulfatases. Together they can break down almost any biological molecule.',
      'The vacuolar H⁺-ATPase (V-ATPase) pumps protons in to keep the lumen at pH ≈ 4.5–5. The enzymes work only in acid, which protects the cell if a lysosome leaks. Heavily glycosylated membrane proteins (LAMP1, LAMP2, LIMP2) coat the inner surface so the membrane is not digested itself. Transporters then export the amino acids, sugars and nucleotides for reuse.',
      'Material arrives by endocytosis, phagocytosis (germs, debris) and autophagy, in which a double-membrane autophagosome wraps worn-out organelles and fuses with a lysosome. The lysosome surface also hosts mTORC1, a master growth switch that senses nutrients and decides between growing and recycling.',
    ],
    facts: [
      ['Size', '≈ 0.1–1 µm'],
      ['Lumen pH', '≈ 4.5–5 (cytosol ≈ 7.2)'],
      ['Enzymes', '≈ 60 acid hydrolases'],
      ['Proton pump', 'V-ATPase'],
      ['Membrane', '1, lined with LAMP/LIMP glycoproteins'],
      ['Discovered', 'Christian de Duve, 1955 (Nobel 1974)'],
    ],
    points: [
      'More than 50 lysosomal storage disorders are known, such as Tay–Sachs (hexosaminidase A) and Gaucher disease.',
      'Autophagy research earned Yoshinori Ohsumi the 2016 Nobel Prize.',
      'Lysosomal enzymes get their mannose-6-phosphate address tag in the Golgi.',
      'Undigested material can form "myelin figures" or lipofuscin, the age pigment.',
    ],
  },
  peroxisome: {
    name: 'Peroxisome',
    tagline: 'Oxidative metabolism and H₂O₂ handling',
    overview: [
      'Peroxisomes are small single-membrane organelles that carry out oxidation reactions using O₂. Oxidases remove hydrogen from substrates and produce hydrogen peroxide (H₂O₂). Catalase then destroys it (2 H₂O₂ → 2 H₂O + O₂) or uses it to oxidise other molecules, such as ethanol.',
      'Peroxisomes shorten very-long-chain fatty acids (C22 and longer) by β-oxidation before mitochondria finish them off. They also make plasmalogens, ether lipids needed for myelin, and help make bile acids.',
      'They have no DNA. Their matrix proteins are made on free ribosomes and imported fully folded, guided by targeting signals (PTS1, the C-terminal "SKL" tag, or PTS2) and the PEX13/PEX14 docking complex. New peroxisomes form by growth and division or bud from the ER.',
    ],
    facts: [
      ['Size', '≈ 0.1–1 µm'],
      ['Membrane', '1'],
      ['Key enzyme', 'Catalase'],
      ['Import signals', 'PTS1 (–SKL), PTS2'],
      ['Own DNA', 'None'],
      ['Abundant in', 'Liver and kidney cells'],
    ],
    points: [
      'Zellweger syndrome: PEX gene defects stop peroxisomes from forming properly.',
      'X-linked adrenoleukodystrophy: ABCD1 transporter defect, very-long-chain fatty acids build up (the subject of "Lorenzo\'s Oil").',
      'The crystalline core is urate oxidase. Humans lost this enzyme, which is why we can get gout.',
      'Catalase can break down millions of H₂O₂ molecules per second.',
    ],
  },
  centrosome: {
    name: 'Centrosome',
    tagline: 'The main microtubule-organising centre',
    overview: [
      'The centrosome is the cell\'s main microtubule-organising centre (MTOC). Its core is a pair of centrioles at right angles, each a barrel of nine microtubule triplets (9 × 3), surrounded by pericentriolar material (PCM).',
      'Microtubules are nucleated in the PCM by γ-tubulin ring complexes (γ-TuRC), which cap the minus ends so that plus ends grow outwards. This makes a radial array that positions organelles and sets up cell polarity.',
      'Centrioles duplicate exactly once per cell cycle. In S phase a daughter grows at right angles to each parent from a SAS-6 cartwheel. In mitosis the two centrosomes separate to form the spindle poles. In non-dividing cells the mother centriole, with its appendages, docks at the membrane and becomes the basal body of the primary cilium.',
    ],
    facts: [
      ['Centriole size', '≈ 250 nm wide, ≈ 500 nm long'],
      ['Microtubule pattern', '9 triplets (9 × 3)'],
      ['Membrane', 'None'],
      ['Nucleator', 'γ-tubulin ring complex'],
      ['Duplication', 'Once per cycle, in S phase'],
      ['Plants', 'Usually no centrioles'],
    ],
    points: [
      'Only the mother centriole has distal and subdistal appendages.',
      'Too many centrosomes is common in cancer cells and causes faulty divisions.',
      'Mutations in centrosome genes cause microcephaly.',
      'Cilia have a 9 + 2 axoneme. The centriole base is 9 triplets with no central pair.',
    ],
  },
  cytoskeleton: {
    name: 'Cytoskeleton',
    tagline: 'Shape, movement and intracellular transport',
    overview: [
      'The cytoskeleton is three protein filament systems that keep changing: microtubules, actin microfilaments and intermediate filaments. Together they give the cell shape and strength, organise its interior, move cargo and power cell movement and division.',
      'Microtubules (25 nm) are hollow tubes of α/β-tubulin with a fast-growing plus end. They switch between growth and sudden shrinking ("dynamic instability"). Kinesins walk cargo toward the plus end (outwards), and dynein carries it toward the minus end (inwards). Actin filaments (7 nm) form the cortex under the membrane. Arp2/3 builds branched networks that push the leading edge forward, and myosins pull on actin.',
      'Intermediate filaments (≈ 10 nm) are rope-like, flexible and very strong under tension. Different cell types use different kinds: keratins in skin, vimentin in fibroblasts, neurofilaments in neurons and lamins in the nucleus. They have no polarity and no motor proteins.',
    ],
    facts: [
      ['Microtubules', '25 nm, α/β-tubulin, 13 protofilaments'],
      ['Actin filaments', '≈ 7 nm, double helix of G-actin'],
      ['Intermediate filaments', '≈ 10 nm, rope-like'],
      ['Motors on MTs', 'Kinesin (+), dynein (–)'],
      ['Motor on actin', 'Myosin'],
      ['Kinesin step', '8 nm per ATP'],
    ],
    points: [
      'Taxol (paclitaxel) stops microtubules shrinking; colchicine blocks them from growing. Both stop cell division.',
      'Mutations in keratin cause blistering skin diseases (epidermolysis bullosa simplex).',
      'Cilia and flagella beat by dynein sliding microtubule doublets past each other.',
      'Muscle contraction is myosin II pulling on actin filaments.',
    ],
  },
  plasma_membrane: {
    name: 'Plasma Membrane',
    tagline: 'Selective barrier, signalling surface and transporter',
    overview: [
      'The plasma membrane is a phospholipid bilayer about 7–10 nm thick. Hydrophilic heads face the water on both sides and hydrophobic fatty-acid tails form the core. In the fluid mosaic model (Singer & Nicolson, 1972), lipids and many proteins drift sideways within the layer.',
      'The two leaflets differ. Phosphatidylcholine, sphingomyelin and glycolipids face out, while phosphatidylethanolamine and phosphatidylserine face in. PS appearing on the outside is an "eat me" signal for apoptotic cells. Cholesterol keeps fluidity steady across temperatures, and cholesterol–sphingolipid lipid rafts gather signalling proteins together.',
      'Proteins do most of the work. Channels (aquaporins, voltage-gated K⁺ channels) allow passive flow. Pumps such as the Na⁺/K⁺-ATPase move ions against their gradients. Receptors (GPCRs, receptor tyrosine kinases) pass signals inward. Bulky cargo such as LDL enters by receptor-mediated endocytosis. A sugar coat (glycocalyx) covers the outside, and a spectrin–actin mesh supports the inside.',
    ],
    facts: [
      ['Thickness', '≈ 7–10 nm'],
      ['Model', 'Fluid mosaic (1972)'],
      ['Na⁺/K⁺ pump', '3 Na⁺ out, 2 K⁺ in per ATP'],
      ['Aquaporin rate', '≈ 3 billion H₂O per second'],
      ['GPCR genes (human)', '≈ 800'],
      ['Protein by mass', '≈ 50% (varies by cell)'],
    ],
    points: [
      'Small non-polar molecules (O₂, CO₂) diffuse straight through; ions need channels or pumps.',
      'The Na⁺/K⁺ pump uses about a quarter or more of a resting body\'s ATP, and much more in neurons.',
      'Familial hypercholesterolaemia: faulty LDL receptors stop cholesterol uptake.',
      'Aquaporins were discovered by Peter Agre (Nobel Prize 2003).',
    ],
  },
};
