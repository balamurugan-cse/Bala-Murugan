import { Router } from 'express';
import { db } from '../db/store.js';

export const stationsRouter = Router();

// GET /api/stations?query=&district=&category=
stationsRouter.get('/', (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query.trim().toLowerCase() : '';
  const districtParam = typeof req.query.district === 'string' ? req.query.district.trim().toLowerCase() : '';
  const categoryParam = typeof req.query.category === 'string' ? req.query.category.trim() : '';

  let allStations = Array.from(db.stations.values()).filter((s) => s.active);

  if (districtParam) {
    allStations = allStations.filter((s) => s.district?.toLowerCase() === districtParam);
  }

  if (categoryParam) {
    allStations = allStations.filter((s) => s.category === categoryParam);
  }

  if (!query) {
    return res.json({
      stations: allStations.slice(0, 30),
    });
  }

  // Filter by code, name, city, state, or district
  const matched = allStations.filter(
    (s) =>
      s.code.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.city.toLowerCase().includes(query) ||
      s.state.toLowerCase().includes(query) ||
      (s.district && s.district.toLowerCase().includes(query))
  );

  // Exact code matches rank highest
  matched.sort((a, b) => {
    if (a.code.toLowerCase() === query) return -1;
    if (b.code.toLowerCase() === query) return 1;
    if (a.name.toLowerCase().startsWith(query)) return -1;
    if (b.name.toLowerCase().startsWith(query)) return 1;
    return a.name.localeCompare(b.name);
  });

  return res.json({
    stations: matched.slice(0, 20),
  });
});

// GET /api/stations/districts
stationsRouter.get('/districts', (_req, res) => {
  const allStations = Array.from(db.stations.values()).filter((s) => s.active);
  const districtMap = new Map<string, { district: string; state: string; stations: typeof allStations }>();

  allStations.forEach((s) => {
    const dist = s.district || s.city;
    if (!districtMap.has(dist)) {
      districtMap.set(dist, { district: dist, state: s.state, stations: [] });
    }
    districtMap.get(dist)!.stations.push(s);
  });

  return res.json({
    districts: Array.from(districtMap.values()),
  });
});

// GET /api/stations/popular
stationsRouter.get('/popular', (_req, res) => {
  const popularCodes = ['NDLS', 'MMCT', 'SBC', 'MAS', 'HWH', 'ADI', 'HYB', 'PNBE'];
  const stations = popularCodes
    .map((code) => Array.from(db.stations.values()).find((s) => s.code === code))
    .filter(Boolean);

  return res.json({ stations });
});

// GET /api/stations/chennai-suburban
stationsRouter.get('/chennai-suburban', (_req, res) => {
  const chennaiCodes = ['MSB', 'MS', 'MASS', 'MBM', 'GDY', 'TLM', 'TBM', 'CGL', 'VLCY', 'MCPT', 'MTMY', 'TYMR', 'TRMN', 'PER', 'AVD', 'TRL', 'AJJ', 'GPD'];
  const stations = chennaiCodes
    .map((code) => Array.from(db.stations.values()).find((s) => s.code === code))
    .filter(Boolean);

  return res.json({ stations });
});

// GET /api/stations/tamilnadu-districts
stationsRouter.get('/tamilnadu-districts', (_req, res) => {
  const tnCodes = ['MAS', 'MS', 'MDU', 'CBE', 'TPJ', 'SA', 'ED', 'TUP', 'DG', 'TEN', 'KPD', 'VM', 'TJ', 'KMU', 'CAPE'];
  const stations = tnCodes
    .map((code) => Array.from(db.stations.values()).find((s) => s.code === code))
    .filter(Boolean);

  return res.json({ stations });
});
