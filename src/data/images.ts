/* Public-domain imagery from the NASA Image and Video Library
   (images.nasa.gov). NASA content is generally not copyrighted;
   credit is shown alongside each image as recommended. */
const nasa = (id: string, size: 'small' | 'medium' | 'large' = 'medium') =>
  `https://images-assets.nasa.gov/image/${id}/${id}~${size}.jpg`;
const nasaVideo = (id: string) => ({
  src: `https://images-assets.nasa.gov/video/${id}/${id}~mobile.mp4`,
  thumb: `https://images-assets.nasa.gov/video/${id}/${id}~small.jpg`,
});

export const IMG = {
  carina: nasa('carina_nebula', 'large'),
  jwstFirst1: nasa('NHQ202207120012', 'large'),
  jwstFirst2: nasa('NHQ202207120010', 'large'),
  etaCarinae: nasa('PIA03515'),
  pillars: nasa('GSFC_20171208_Archive_e000842', 'large'),
  infernos: nasa('PIA03096'),
  andromeda: nasa('PIA04921', 'large'),
  andromedaMulti: nasa('PIA25163'),
  spiral: nasa('GSFC_20171208_Archive_e000158', 'large'),
  behemoth: nasa('behemoth-black-hole-found-in-an-unlikely-place_26209716511_o', 'large'),
  bhJet: nasa('PIA22085', 'large'),
  juno: nasa('PIA21771', 'large'),
  cassini: nasa('PIA03883', 'large'),
  mars: nasa('PIA21496'),
  w49b: nasa('GSFC_20171208_Archive_e002134', 'large'),
  snRemnant: nasa('GSFC_20171208_Archive_e001896'),
  crab: nasa('PIA03606', 'large'),
  crabMulti: nasa('GSFC_20171208_Archive_e000053', 'large'),
  virgo: nasa('PIA07906', 'large'),
  abell: nasa('GSFC_20171208_Archive_e002174', 'large'),
  earthNight: nasa('iss039e009160', 'large'),
  aurora: nasa('iss048e056981', 'large'),
  artemis: nasa('SLS_MAF_20260401_ArtemisIILaunch_08', 'large'),
  solarFlare: nasa('GSFC_20171208_Archive_e001208', 'large'),
  orionIR: nasa('PIA25434', 'large'),
  redDwarf: nasa('PIA21473'),
  exoplanet: nasa('PIA20690', 'large'),
  milkyWay: nasa('PIA18913', 'large'),
  darkMatterWebb: nasa('PIA26702', 'large'),
  darkMatterWebb2: nasa('PIA26703', 'large'),
  darkMatterCore: nasa('GSFC_20171208_Archive_e001774'),
} as const;

export const VIDEO = {
  smbh: nasaVideo('GSFC_20181002_SMBH_m13043_Simulation'),
  supernova: nasaVideo('GSFC_20100126_Nova_m10547_SuperNova'),
  starlight: nasaVideo('GSFC_20181129_FERMI_m13104_Starlight'),
  tess: nasaVideo('GSFC_20190107_TESS_m12853_1stPlanet4k'),
};
