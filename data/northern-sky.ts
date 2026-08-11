// The circumpolar sky: the stars that never set. Every star brighter than
// about magnitude 3.9 within roughly fifty degrees of the north celestial
// pole, plus the first-magnitude anchors around the rim. Positions are
// J2000, good to the arcminute — real shapes, not decoration: Ursa Minor
// hangs off the pole, the Dipper's pointers aim at it, Cassiopeia answers
// from across the sky.
export type CatalogStar = readonly [
  ra: number, // right ascension, hours
  dec: number, // declination, degrees
  mag: number, // apparent visual magnitude
  bv: number, // B−V color index; higher is warmer
];

export const northernSky: readonly CatalogStar[] = [
  // Ursa Minor — the Little Dipper, tied to the pole by its handle
  [2.53, 89.26, 1.98, 0.6], // Polaris, the lodestar itself
  [17.537, 86.59, 4.36, 0.02], // Yildun
  [16.766, 82.04, 4.23, 0.89], // ε UMi
  [15.734, 77.79, 4.32, 0.04], // ζ UMi
  [16.292, 75.76, 4.95, 0.37], // η UMi
  [14.845, 74.16, 2.08, 1.47], // Kochab, guardian of the pole
  [15.345, 71.83, 3.05, 0.05], // Pherkad, the other guardian

  // Ursa Major — the Big Dipper; Dubhe and Merak point at Polaris
  [11.062, 61.75, 1.79, 1.07], // Dubhe
  [11.031, 56.38, 2.37, 0.03], // Merak
  [11.897, 53.69, 2.44, 0.04], // Phecda
  [12.257, 57.03, 3.31, 0.08], // Megrez
  [12.9, 55.96, 1.77, -0.02], // Alioth
  [13.399, 54.93, 2.27, 0.02], // Mizar
  [13.792, 49.31, 1.86, -0.19], // Alkaid
  [8.504, 60.72, 3.36, 0.84], // Muscida, the bear's nose

  // Cassiopeia — the W, opposite the Dipper
  [0.153, 59.15, 2.27, 0.34], // Caph
  [0.675, 56.54, 2.24, 1.17], // Schedar
  [0.945, 60.72, 2.47, -0.15], // γ Cas
  [1.43, 60.24, 2.68, 0.13], // Ruchbah
  [1.907, 63.67, 3.38, -0.15], // Segin

  // Cepheus — the house between Cassiopeia and the pole
  [21.31, 62.59, 2.51, 0.26], // Alderamin
  [21.478, 70.56, 3.23, -0.2], // Alfirk
  [23.655, 77.63, 3.21, 1.03], // Errai
  [22.181, 58.2, 3.35, 1.57], // ζ Cep
  [20.754, 61.84, 3.43, 0.91], // η Cep
  [22.828, 66.2, 3.52, 1.05], // ι Cep

  // Draco — winding between the two dippers
  [11.523, 69.33, 3.84, 1.62], // λ Dra
  [12.558, 69.79, 3.87, -0.13], // κ Dra
  [14.073, 64.38, 3.67, -0.05], // Thuban, the pole star of the pyramids
  [15.415, 58.97, 3.29, 1.16], // Edasich
  [16.4, 61.51, 2.74, 0.91], // η Dra
  [17.146, 65.71, 3.17, -0.12], // ζ Dra
  [17.892, 56.87, 3.75, 1.18], // ξ Dra
  [17.507, 52.3, 2.79, 0.98], // Rastaban
  [17.943, 51.49, 2.23, 1.52], // Eltanin, the dragon's eye
  [18.351, 72.73, 3.57, 0.68], // χ Dra
  [19.209, 67.66, 3.07, 1.0], // δ Dra

  // The bright anchors around the rim
  [18.616, 38.78, 0.03, 0.0], // Vega
  [20.69, 45.28, 1.25, 0.09], // Deneb
  [20.371, 40.26, 2.23, 0.68], // Sadr
  [19.75, 45.13, 2.87, -0.03], // δ Cyg
  [5.278, 45.99, 0.08, 0.8], // Capella
  [3.405, 49.86, 1.79, 0.48], // Mirfak
  [3.136, 40.96, 2.09, -0.05], // Algol
];
