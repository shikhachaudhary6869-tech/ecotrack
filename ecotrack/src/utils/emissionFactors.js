// Emission factors used by the calculator.
// IMPORTANT: These values are ILLUSTRATIVE ESTIMATES for a college demo.
// They are rounded values inspired by commonly published ranges and are NOT
// certified figures. Edit any number below to change every calculation in the app.

export const EMISSION_FACTORS = {
  transport: {
    car: { label: 'Car', unit: 'km', factor: 0.17, note: 'kg CO₂e per km (average petrol car)' },
    bike: { label: 'Motorbike', unit: 'km', factor: 0.09, note: 'kg CO₂e per km (motorbike/scooter)' },
    bus: { label: 'Bus', unit: 'km', factor: 0.08, note: 'kg CO₂e per passenger-km' },
    train: { label: 'Train', unit: 'km', factor: 0.04, note: 'kg CO₂e per passenger-km' },
    walkCycle: { label: 'Walking / Cycling', unit: 'km', factor: 0, note: 'Zero direct emissions' },
  },
  electricity: {
    grid: { label: 'Grid electricity', unit: 'kWh', factor: 0.71, note: 'kg CO₂e per kWh (illustrative grid average)' },
    household: { label: 'Other household energy (LPG, etc.)', unit: 'kWh', factor: 0.2, note: 'kg CO₂e per kWh-equivalent' },
  },
  food: {
    vegMeal: { label: 'Vegetarian meals', unit: 'meals', factor: 0.9, note: 'kg CO₂e per meal' },
    nonVegMeal: { label: 'Non-vegetarian meals', unit: 'meals', factor: 3.3, note: 'kg CO₂e per meal' },
    dairy: { label: 'Dairy servings', unit: 'servings', factor: 1.0, note: 'kg CO₂e per serving (glass of milk, curd, etc.)' },
  },
  waste: {
    general: { label: 'General waste (landfill)', unit: 'kg', factor: 0.45, note: 'kg CO₂e per kg of waste' },
    recycled: { label: 'Recycled waste', unit: 'kg', factor: 0.1, note: 'kg CO₂e per kg (collection & processing)' },
    plastic: { label: 'Plastic waste', unit: 'kg', factor: 2.5, note: 'kg CO₂e per kg of plastic' },
  },
};

export const CATEGORIES = [
  { key: 'transport', label: 'Transportation', color: '#166534' },
  { key: 'electricity', label: 'Electricity', color: '#10B981' },
  { key: 'food', label: 'Food', color: '#65A30D' },
  { key: 'waste', label: 'Waste', color: '#0F766E' },
];

// Daily reference value used for the EcoScore and progress bars (illustrative).
export const DAILY_TARGET_KG = 12;

export const FACTORS_DISCLAIMER =
  'All emission factors in EcoTrack are illustrative estimates for educational use. They are not certified values. You can adjust them in src/utils/emissionFactors.js.';
