export const CHALLENGES = [
  { id: 'c1', title: 'Use public transport for 3 days', description: 'Take the bus, metro or train instead of a private vehicle for three days.', type: 'weekly', target: 3, points: 40, icon: 'Bus' },
  { id: 'c2', title: 'Avoid single-use plastic for 7 days', description: 'Carry a bag and bottle. Say no to plastic cutlery, straws and bags.', type: 'weekly', target: 7, points: 60, icon: 'Recycle' },
  { id: 'c3', title: 'Walk instead of driving', description: 'Replace one short car trip with a walk today.', type: 'daily', target: 1, points: 10, icon: 'Footprints' },
  { id: 'c4', title: 'Save electricity for one week', description: 'Switch off unused lights and appliances for seven days.', type: 'weekly', target: 7, points: 50, icon: 'Zap' },
  { id: 'c5', title: 'Plant a tree', description: 'Plant a sapling at home, school or in your community.', type: 'weekly', target: 1, points: 80, icon: 'TreePine' },
  { id: 'c6', title: 'Recycle household waste', description: 'Sort dry and wet waste and recycle what you can today.', type: 'daily', target: 1, points: 10, icon: 'Trash2' },
  { id: 'c7', title: 'Go meat-free today', description: 'Eat only vegetarian meals for the whole day.', type: 'daily', target: 1, points: 15, icon: 'Salad' },
  { id: 'c8', title: 'Use a reusable bottle', description: 'Skip bottled water and refill your own bottle today.', type: 'daily', target: 1, points: 10, icon: 'GlassWater' },
];

export const BADGES = [
  { id: 'b1', name: 'First Step', description: 'Complete your first challenge', check: (s) => s.completedCount >= 1, icon: 'Sprout' },
  { id: 'b2', name: 'Getting Greener', description: 'Complete 5 challenges', check: (s) => s.completedCount >= 5, icon: 'Leaf' },
  { id: 'b3', name: 'Point Collector', description: 'Earn 100 reward points', check: (s) => s.points >= 100, icon: 'Star' },
  { id: 'b4', name: 'Eco Warrior', description: 'Earn 250 reward points', check: (s) => s.points >= 250, icon: 'Shield' },
  { id: 'b5', name: 'Tracker', description: 'Save 5 calculation records', check: (s) => s.recordCount >= 5, icon: 'ClipboardCheck' },
  { id: 'b6', name: 'Tip Master', description: 'Complete 5 eco tips', check: (s) => s.tipsDone >= 5, icon: 'Lightbulb' },
];
