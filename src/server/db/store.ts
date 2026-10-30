import bcrypt from 'bcryptjs';
import {
  AuditLog,
  AvailabilitySnapshot,
  Booking,
  FareQuote,
  Passenger,
  Payment,
  Role,
  Station,
  Train,
  TrainClass,
  TrainStop,
  User,
} from '../types.js';

export class DatabaseStore {
  public users: Map<string, User> = new Map();
  public stations: Map<string, Station> = new Map();
  public trains: Map<string, Train> = new Map();
  public trainStops: Map<string, TrainStop> = new Map();
  public trainClasses: Map<string, TrainClass> = new Map();
  public fareQuotes: Map<string, FareQuote> = new Map();
  public availabilitySnapshots: Map<string, AvailabilitySnapshot> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public payments: Map<string, Payment> = new Map();
  public auditLogs: AuditLog[] = [];
  public idempotencyKeys: Map<string, { result: any; createdAt: number }> = new Map();

  private isInitialized = false;

  constructor() {
    this.seed();
  }

  public seed(): void {
    if (this.isInitialized) return;

    // 1. Seed Demo Users
    const salt = bcrypt.genSaltSync(10);
    const userPasswordHash = bcrypt.hashSync('Passenger123!', salt);
    const adminPasswordHash = bcrypt.hashSync('AdminSecret2026!', salt);

    const demoUser: User = {
      id: 'usr_demo_passenger_01',
      name: 'Aditya Sharma',
      email: 'passenger@railconnect.com',
      phone: '+91 98765 43210',
      passwordHash: userPasswordHash,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const demoAdmin: User = {
      id: 'usr_demo_admin_01',
      name: 'RailConnect Operations Admin',
      email: 'admin@railconnect.com',
      phone: '+91 98111 22334',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(demoUser.id, demoUser);
    this.users.set(demoAdmin.id, demoAdmin);

    // 2. Seed Stations with District & Category Details
    const stationData: Omit<Station, 'id' | 'active'>[] = [
      { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', district: 'New Delhi', category: 'MAJOR_JUNCTION' },
      { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', category: 'MAJOR_JUNCTION' },
      { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', category: 'MAJOR_JUNCTION' },
      { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', category: 'MAJOR_JUNCTION' },
      { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'MAJOR_JUNCTION' },
      { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', district: 'Howrah', category: 'MAJOR_JUNCTION' },
      { code: 'HYB', name: 'Hyderabad Deccan Nampally', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', category: 'MAJOR_JUNCTION' },
      { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', category: 'MAJOR_JUNCTION' },
      { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', district: 'Patna', category: 'MAJOR_JUNCTION' },
      { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', category: 'MAJOR_JUNCTION' },
      { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', category: 'MAJOR_JUNCTION' },
      { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', district: 'Agra', category: 'MAJOR_JUNCTION' },

      // Chennai Suburban / Local EMU Network Stations (Chennai, Chengalpattu, Tiruvallur Districts)
      { code: 'MSB', name: 'Chennai Beach', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'MAJOR_JUNCTION' },
      { code: 'MASS', name: 'Chennai Central Suburban (MMC)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'MBM', name: 'Mambalam', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'GDY', name: 'Guindy', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'TLM', name: 'Tirusulam (Chennai Airport)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'TBM', name: 'Tambaram', city: 'Chennai', state: 'Tamil Nadu', district: 'Chengalpattu', category: 'MAJOR_JUNCTION' },
      { code: 'CGL', name: 'Chengalpattu Junction', city: 'Chengalpattu', state: 'Tamil Nadu', district: 'Chengalpattu', category: 'MAJOR_JUNCTION' },
      { code: 'VLCY', name: 'Velachery (MRTS)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'MCPT', name: 'Chintadripet (MRTS)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'MTMY', name: 'Thirumayilai (Mylapore MRTS)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'TYMR', name: 'Thiruvanmiyur (MRTS)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'TRMN', name: 'Taramani (MRTS)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'PER', name: 'Perambur', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', category: 'SUBURBAN' },
      { code: 'AVD', name: 'Avadi', city: 'Chennai', state: 'Tamil Nadu', district: 'Tiruvallur', category: 'SUBURBAN' },
      { code: 'TRL', name: 'Tiruvallur', city: 'Tiruvallur', state: 'Tamil Nadu', district: 'Tiruvallur', category: 'DISTRICT_EXPRESS' },
      { code: 'AJJ', name: 'Arakkonam Junction', city: 'Arakkonam', state: 'Tamil Nadu', district: 'Ranipet', category: 'MAJOR_JUNCTION' },
      { code: 'GPD', name: 'Gummidipoondi', city: 'Gummidipoondi', state: 'Tamil Nadu', district: 'Tiruvallur', category: 'SUBURBAN' },

      // Tamil Nadu District Hubs & Junctions
      { code: 'MDU', name: 'Madurai Junction', city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', category: 'MAJOR_JUNCTION' },
      { code: 'CBE', name: 'Coimbatore Main Junction', city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', category: 'MAJOR_JUNCTION' },
      { code: 'TPJ', name: 'Tiruchirappalli Junction', city: 'Tiruchirappalli', state: 'Tamil Nadu', district: 'Tiruchirappalli', category: 'MAJOR_JUNCTION' },
      { code: 'SA', name: 'Salem Junction', city: 'Salem', state: 'Tamil Nadu', district: 'Salem', category: 'MAJOR_JUNCTION' },
      { code: 'ED', name: 'Erode Junction', city: 'Erode', state: 'Tamil Nadu', district: 'Erode', category: 'MAJOR_JUNCTION' },
      { code: 'TUP', name: 'Tiruppur', city: 'Tiruppur', state: 'Tamil Nadu', district: 'Tiruppur', category: 'DISTRICT_EXPRESS' },
      { code: 'DG', name: 'Dindigul Junction', city: 'Dindigul', state: 'Tamil Nadu', district: 'Dindigul', category: 'MAJOR_JUNCTION' },
      { code: 'TEN', name: 'Tirunelveli Junction', city: 'Tirunelveli', state: 'Tamil Nadu', district: 'Tirunelveli', category: 'MAJOR_JUNCTION' },
      { code: 'KPD', name: 'Katpadi Junction', city: 'Vellore', state: 'Tamil Nadu', district: 'Vellore', category: 'MAJOR_JUNCTION' },
      { code: 'VM', name: 'Villupuram Junction', city: 'Villupuram', state: 'Tamil Nadu', district: 'Villupuram', category: 'MAJOR_JUNCTION' },
      { code: 'TJ', name: 'Thanjavur Junction', city: 'Thanjavur', state: 'Tamil Nadu', district: 'Thanjavur', category: 'MAJOR_JUNCTION' },
      { code: 'KMU', name: 'Kumbakonam', city: 'Kumbakonam', state: 'Tamil Nadu', district: 'Thanjavur', category: 'DISTRICT_EXPRESS' },
      { code: 'CAPE', name: 'Kanniyakumari', city: 'Kanniyakumari', state: 'Tamil Nadu', district: 'Kanniyakumari', category: 'MAJOR_JUNCTION' },
    ];

    stationData.forEach((st) => {
      const id = `stn_${st.code.toLowerCase()}`;
      this.stations.set(id, {
        id,
        code: st.code,
        name: st.name,
        city: st.city,
        state: st.state,
        district: st.district,
        category: st.category,
        active: true,
      });
    });

    // 3. Seed Trains with authentic stops, classes, fares
    const getStnId = (code: string) => `stn_${code.toLowerCase()}`;

    // Train 1: Vande Bharat Express (22436) NDLS -> CNB -> PNBE
    this.createTrainWithRoute({
      id: 'trn_22436',
      trainNumber: '22436',
      name: 'Vande Bharat Express',
      trainType: 'Vande Bharat',
      stops: [
        { stationCode: 'NDLS', arrivalTime: '06:00', departureTime: '06:00', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'CNB', arrivalTime: '10:08', departureTime: '10:12', dayOffset: 0, distanceKm: 440, platform: '2' },
        { stationCode: 'PNBE', arrivalTime: '14:00', departureTime: '14:00', dayOffset: 0, distanceKm: 998, platform: '1' },
      ],
      classes: [
        { code: 'CC', label: 'AC Chair Car', baseFare: 1450 },
        { code: 'EC', label: 'Executive Chair Car', baseFare: 2850 },
      ],
    });

    // Train 2: Mumbai Tejas Rajdhani Express (12952) NDLS -> AGC -> BPL -> MMCT
    this.createTrainWithRoute({
      id: 'trn_12952',
      trainNumber: '12952',
      name: 'Mumbai Tejas Rajdhani Express',
      trainType: 'Rajdhani',
      stops: [
        { stationCode: 'NDLS', arrivalTime: '16:55', departureTime: '16:55', dayOffset: 0, distanceKm: 0, platform: '3' },
        { stationCode: 'AGC', arrivalTime: '18:53', departureTime: '18:55', dayOffset: 0, distanceKm: 195, platform: '1' },
        { stationCode: 'BPL', arrivalTime: '23:35', departureTime: '23:40', dayOffset: 0, distanceKm: 704, platform: '2' },
        { stationCode: 'MMCT', arrivalTime: '08:35', departureTime: '08:35', dayOffset: 1, distanceKm: 1384, platform: '1' },
      ],
      classes: [
        { code: '3A', label: 'AC 3 Tier', baseFare: 2150 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 3050 },
        { code: '1A', label: 'AC First Class', baseFare: 5200 },
      ],
    });

    // Train 3: Bhopal Shatabdi Express (12002) NDLS -> AGC -> CNB -> BPL
    this.createTrainWithRoute({
      id: 'trn_12002',
      trainNumber: '12002',
      name: 'Bhopal Shatabdi Express',
      trainType: 'Shatabdi',
      stops: [
        { stationCode: 'NDLS', arrivalTime: '06:00', departureTime: '06:00', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'AGC', arrivalTime: '07:50', departureTime: '07:55', dayOffset: 0, distanceKm: 195, platform: '1' },
        { stationCode: 'CNB', arrivalTime: '11:20', departureTime: '11:25', dayOffset: 0, distanceKm: 440, platform: '4' },
        { stationCode: 'BPL', arrivalTime: '14:40', departureTime: '14:40', dayOffset: 0, distanceKm: 704, platform: '1' },
      ],
      classes: [
        { code: 'CC', label: 'AC Chair Car', baseFare: 1180 },
        { code: 'EC', label: 'Executive Chair Car', baseFare: 2280 },
      ],
    });

    // Train 4: Howrah Rajdhani Express (12302) NDLS -> CNB -> PNBE -> HWH
    this.createTrainWithRoute({
      id: 'trn_12302',
      trainNumber: '12302',
      name: 'Howrah Rajdhani Express',
      trainType: 'Rajdhani',
      stops: [
        { stationCode: 'NDLS', arrivalTime: '16:50', departureTime: '16:50', dayOffset: 0, distanceKm: 0, platform: '4' },
        { stationCode: 'CNB', arrivalTime: '21:32', departureTime: '21:37', dayOffset: 0, distanceKm: 440, platform: '1' },
        { stationCode: 'PNBE', arrivalTime: '03:15', departureTime: '03:25', dayOffset: 1, distanceKm: 998, platform: '3' },
        { stationCode: 'HWH', arrivalTime: '09:55', departureTime: '09:55', dayOffset: 1, distanceKm: 1451, platform: '8' },
      ],
      classes: [
        { code: '3A', label: 'AC 3 Tier', baseFare: 2280 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 3250 },
        { code: '1A', label: 'AC First Class', baseFare: 5490 },
      ],
    });

    // Train 5: Chennai - Bengaluru Vande Bharat Express (20608) MAS -> SBC
    this.createTrainWithRoute({
      id: 'trn_20608',
      trainNumber: '20608',
      name: 'Chennai - Bengaluru Vande Bharat',
      trainType: 'Vande Bharat',
      stops: [
        { stationCode: 'MAS', arrivalTime: '05:50', departureTime: '05:50', dayOffset: 0, distanceKm: 0, platform: '2A' },
        { stationCode: 'SBC', arrivalTime: '10:10', departureTime: '10:10', dayOffset: 0, distanceKm: 359, platform: '7' },
      ],
      classes: [
        { code: 'CC', label: 'AC Chair Car', baseFare: 995 },
        { code: 'EC', label: 'Executive Chair Car', baseFare: 1885 },
      ],
    });

    // Train 6: Bengaluru - New Delhi Rajdhani (22691) SBC -> HYB -> BPL -> AGC -> NDLS
    this.createTrainWithRoute({
      id: 'trn_22691',
      trainNumber: '22691',
      name: 'Bengaluru Rajdhani Express',
      trainType: 'Rajdhani',
      stops: [
        { stationCode: 'SBC', arrivalTime: '20:00', departureTime: '20:00', dayOffset: 0, distanceKm: 0, platform: '8' },
        { stationCode: 'HYB', arrivalTime: '07:15', departureTime: '07:25', dayOffset: 1, distanceKm: 622, platform: '2' },
        { stationCode: 'BPL', arrivalTime: '20:50', departureTime: '21:00', dayOffset: 1, distanceKm: 1475, platform: '1' },
        { stationCode: 'AGC', arrivalTime: '01:50', departureTime: '01:52', dayOffset: 2, distanceKm: 1984, platform: '3' },
        { stationCode: 'NDLS', arrivalTime: '05:30', departureTime: '05:30', dayOffset: 2, distanceKm: 2365, platform: '1' },
      ],
      classes: [
        { code: '3A', label: 'AC 3 Tier', baseFare: 2950 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 4120 },
        { code: '1A', label: 'AC First Class', baseFare: 6800 },
      ],
    });

    // Train 7: Mumbai - Ahmedabad Shatabdi Express (12009) MMCT -> ADI
    this.createTrainWithRoute({
      id: 'trn_12009',
      trainNumber: '12009',
      name: 'Mumbai - Ahmedabad Shatabdi',
      trainType: 'Shatabdi',
      stops: [
        { stationCode: 'MMCT', arrivalTime: '06:20', departureTime: '06:20', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'ADI', arrivalTime: '12:45', departureTime: '12:45', dayOffset: 0, distanceKm: 493, platform: '1' },
      ],
      classes: [
        { code: 'CC', label: 'AC Chair Car', baseFare: 1110 },
        { code: 'EC', label: 'Executive Chair Car', baseFare: 2165 },
      ],
    });

    // Train 8: Paschim Superfast Express (12925) MMCT -> ADI -> NDLS
    this.createTrainWithRoute({
      id: 'trn_12925',
      trainNumber: '12925',
      name: 'Paschim Superfast Express',
      trainType: 'Superfast',
      stops: [
        { stationCode: 'MMCT', arrivalTime: '11:25', departureTime: '11:25', dayOffset: 0, distanceKm: 0, platform: '4' },
        { stationCode: 'ADI', arrivalTime: '18:15', departureTime: '18:25', dayOffset: 0, distanceKm: 493, platform: '3' },
        { stationCode: 'NDLS', arrivalTime: '10:40', departureTime: '10:40', dayOffset: 1, distanceKm: 1384, platform: '5' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 590 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 1540 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 2210 },
        { code: '1A', label: 'AC First Class', baseFare: 3750 },
      ],
    });

    // Train 9: Chennai Central - Howrah Mail (12840) MAS -> HWH
    this.createTrainWithRoute({
      id: 'trn_12840',
      trainNumber: '12840',
      name: 'Howrah Superfast Mail',
      trainType: 'Superfast',
      stops: [
        { stationCode: 'MAS', arrivalTime: '19:00', departureTime: '19:00', dayOffset: 0, distanceKm: 0, platform: '5' },
        { stationCode: 'HWH', arrivalTime: '23:00', departureTime: '23:00', dayOffset: 1, distanceKm: 1661, platform: '9' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 675 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 1780 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 2590 },
      ],
    });

    // Train 10: Chennai Beach - Tambaram Fast Local EMU (40001)
    this.createTrainWithRoute({
      id: 'trn_40001',
      trainNumber: '40001',
      name: 'Chennai Beach - Tambaram Fast Local EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'MSB', arrivalTime: '07:15', departureTime: '07:15', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'MS', arrivalTime: '07:22', departureTime: '07:23', dayOffset: 0, distanceKm: 4, platform: '10' },
        { stationCode: 'MBM', arrivalTime: '07:31', departureTime: '07:32', dayOffset: 0, distanceKm: 11, platform: '1' },
        { stationCode: 'GDY', arrivalTime: '07:38', departureTime: '07:39', dayOffset: 0, distanceKm: 14, platform: '1' },
        { stationCode: 'TLM', arrivalTime: '07:45', departureTime: '07:46', dayOffset: 0, distanceKm: 19, platform: '1' },
        { stationCode: 'TBM', arrivalTime: '07:58', departureTime: '07:58', dayOffset: 0, distanceKm: 29, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 65 },
      ],
    });

    // Train 11: Tambaram - Chennai Beach Fast Local EMU (40002) - Return
    this.createTrainWithRoute({
      id: 'trn_40002',
      trainNumber: '40002',
      name: 'Tambaram - Chennai Beach Fast Local EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'TBM', arrivalTime: '08:15', departureTime: '08:15', dayOffset: 0, distanceKm: 0, platform: '2' },
        { stationCode: 'TLM', arrivalTime: '08:26', departureTime: '08:27', dayOffset: 0, distanceKm: 10, platform: '2' },
        { stationCode: 'GDY', arrivalTime: '08:33', departureTime: '08:34', dayOffset: 0, distanceKm: 15, platform: '2' },
        { stationCode: 'MBM', arrivalTime: '08:41', departureTime: '08:42', dayOffset: 0, distanceKm: 18, platform: '2' },
        { stationCode: 'MS', arrivalTime: '08:50', departureTime: '08:51', dayOffset: 0, distanceKm: 25, platform: '11' },
        { stationCode: 'MSB', arrivalTime: '08:58', departureTime: '08:58', dayOffset: 0, distanceKm: 29, platform: '2' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 65 },
      ],
    });

    // Train 12: Chennai Beach - Chengalpattu Fast EMU (40005)
    this.createTrainWithRoute({
      id: 'trn_40005',
      trainNumber: '40005',
      name: 'Chennai Beach - Chengalpattu Fast EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'MSB', arrivalTime: '08:30', departureTime: '08:30', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'MS', arrivalTime: '08:38', departureTime: '08:39', dayOffset: 0, distanceKm: 4, platform: '10' },
        { stationCode: 'MBM', arrivalTime: '08:47', departureTime: '08:48', dayOffset: 0, distanceKm: 11, platform: '1' },
        { stationCode: 'GDY', arrivalTime: '08:55', departureTime: '08:56', dayOffset: 0, distanceKm: 14, platform: '1' },
        { stationCode: 'TLM', arrivalTime: '09:02', departureTime: '09:03', dayOffset: 0, distanceKm: 19, platform: '1' },
        { stationCode: 'TBM', arrivalTime: '09:15', departureTime: '09:16', dayOffset: 0, distanceKm: 29, platform: '1' },
        { stationCode: 'CGL', arrivalTime: '09:55', departureTime: '09:55', dayOffset: 0, distanceKm: 60, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 15 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 95 },
      ],
    });

    // Train 13: Chengalpattu - Chennai Beach Fast EMU (40006) - Return
    this.createTrainWithRoute({
      id: 'trn_40006',
      trainNumber: '40006',
      name: 'Chengalpattu - Chennai Beach Fast EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'CGL', arrivalTime: '10:15', departureTime: '10:15', dayOffset: 0, distanceKm: 0, platform: '2' },
        { stationCode: 'TBM', arrivalTime: '10:52', departureTime: '10:53', dayOffset: 0, distanceKm: 31, platform: '2' },
        { stationCode: 'TLM', arrivalTime: '11:04', departureTime: '11:05', dayOffset: 0, distanceKm: 41, platform: '2' },
        { stationCode: 'GDY', arrivalTime: '11:11', departureTime: '11:12', dayOffset: 0, distanceKm: 46, platform: '2' },
        { stationCode: 'MBM', arrivalTime: '11:18', departureTime: '11:19', dayOffset: 0, distanceKm: 49, platform: '2' },
        { stationCode: 'MS', arrivalTime: '11:27', departureTime: '11:28', dayOffset: 0, distanceKm: 56, platform: '11' },
        { stationCode: 'MSB', arrivalTime: '11:35', departureTime: '11:35', dayOffset: 0, distanceKm: 60, platform: '2' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 15 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 95 },
      ],
    });

    // Train 14: Chennai Beach - Tambaram AC Local EMU (40015)
    this.createTrainWithRoute({
      id: 'trn_40015',
      trainNumber: '40015',
      name: 'Chennai Beach - Tambaram AC Local EMU',
      trainType: 'Chennai AC Local',
      stops: [
        { stationCode: 'MSB', arrivalTime: '09:05', departureTime: '09:05', dayOffset: 0, distanceKm: 0, platform: '3' },
        { stationCode: 'MS', arrivalTime: '09:13', departureTime: '09:14', dayOffset: 0, distanceKm: 4, platform: '10' },
        { stationCode: 'MBM', arrivalTime: '09:22', departureTime: '09:23', dayOffset: 0, distanceKm: 11, platform: '1' },
        { stationCode: 'GDY', arrivalTime: '09:29', departureTime: '09:30', dayOffset: 0, distanceKm: 14, platform: '1' },
        { stationCode: 'TLM', arrivalTime: '09:36', departureTime: '09:37', dayOffset: 0, distanceKm: 19, platform: '1' },
        { stationCode: 'TBM', arrivalTime: '09:48', departureTime: '09:48', dayOffset: 0, distanceKm: 29, platform: '3' },
      ],
      classes: [
        { code: 'AC', label: 'AC EMU Suburban', baseFare: 80 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 65 },
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
      ],
    });

    // Train 15: Tambaram - Chennai Beach AC Local EMU (40016) - Return
    this.createTrainWithRoute({
      id: 'trn_40016',
      trainNumber: '40016',
      name: 'Tambaram - Chennai Beach AC Local EMU',
      trainType: 'Chennai AC Local',
      stops: [
        { stationCode: 'TBM', arrivalTime: '17:30', departureTime: '17:30', dayOffset: 0, distanceKm: 0, platform: '3' },
        { stationCode: 'TLM', arrivalTime: '17:41', departureTime: '17:42', dayOffset: 0, distanceKm: 10, platform: '2' },
        { stationCode: 'GDY', arrivalTime: '17:48', departureTime: '17:49', dayOffset: 0, distanceKm: 15, platform: '2' },
        { stationCode: 'MBM', arrivalTime: '17:55', departureTime: '17:56', dayOffset: 0, distanceKm: 18, platform: '2' },
        { stationCode: 'MS', arrivalTime: '18:04', departureTime: '18:05', dayOffset: 0, distanceKm: 25, platform: '11' },
        { stationCode: 'MSB', arrivalTime: '18:15', departureTime: '18:15', dayOffset: 0, distanceKm: 29, platform: '3' },
      ],
      classes: [
        { code: 'AC', label: 'AC EMU Suburban', baseFare: 80 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 65 },
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
      ],
    });

    // Train 16: Chennai Beach - Velachery MRTS Local (40301)
    this.createTrainWithRoute({
      id: 'trn_40301',
      trainNumber: '40301',
      name: 'Chennai Beach - Velachery MRTS Local',
      trainType: 'Chennai MRTS Local',
      stops: [
        { stationCode: 'MSB', arrivalTime: '08:00', departureTime: '08:00', dayOffset: 0, distanceKm: 0, platform: '5' },
        { stationCode: 'MCPT', arrivalTime: '08:08', departureTime: '08:09', dayOffset: 0, distanceKm: 4, platform: '1' },
        { stationCode: 'MTMY', arrivalTime: '08:19', departureTime: '08:20', dayOffset: 0, distanceKm: 9, platform: '1' },
        { stationCode: 'TYMR', arrivalTime: '08:29', departureTime: '08:30', dayOffset: 0, distanceKm: 14, platform: '1' },
        { stationCode: 'TRMN', arrivalTime: '08:35', departureTime: '08:36', dayOffset: 0, distanceKm: 16, platform: '1' },
        { stationCode: 'VLCY', arrivalTime: '08:45', departureTime: '08:45', dayOffset: 0, distanceKm: 19, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 55 },
      ],
    });

    // Train 17: Velachery - Chennai Beach MRTS Local (40302) - Return
    this.createTrainWithRoute({
      id: 'trn_40302',
      trainNumber: '40302',
      name: 'Velachery - Chennai Beach MRTS Local',
      trainType: 'Chennai MRTS Local',
      stops: [
        { stationCode: 'VLCY', arrivalTime: '09:00', departureTime: '09:00', dayOffset: 0, distanceKm: 0, platform: '2' },
        { stationCode: 'TRMN', arrivalTime: '09:07', departureTime: '09:08', dayOffset: 0, distanceKm: 3, platform: '2' },
        { stationCode: 'TYMR', arrivalTime: '09:14', departureTime: '09:15', dayOffset: 0, distanceKm: 5, platform: '2' },
        { stationCode: 'MTMY', arrivalTime: '09:24', departureTime: '09:25', dayOffset: 0, distanceKm: 10, platform: '2' },
        { stationCode: 'MCPT', arrivalTime: '09:35', departureTime: '09:36', dayOffset: 0, distanceKm: 15, platform: '2' },
        { stationCode: 'MSB', arrivalTime: '09:44', departureTime: '09:44', dayOffset: 0, distanceKm: 19, platform: '6' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 55 },
      ],
    });

    // Train 18: Chennai Central - Avadi Local EMU (43001)
    this.createTrainWithRoute({
      id: 'trn_43001',
      trainNumber: '43001',
      name: 'Chennai Central - Avadi Local EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'MASS', arrivalTime: '07:35', departureTime: '07:35', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'PER', arrivalTime: '07:44', departureTime: '07:45', dayOffset: 0, distanceKm: 6, platform: '1' },
        { stationCode: 'AVD', arrivalTime: '08:12', departureTime: '08:12', dayOffset: 0, distanceKm: 21, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 60 },
      ],
    });

    // Train 19: Avadi - Chennai Central Local EMU (43002) - Return
    this.createTrainWithRoute({
      id: 'trn_43002',
      trainNumber: '43002',
      name: 'Avadi - Chennai Central Local EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'AVD', arrivalTime: '08:30', departureTime: '08:30', dayOffset: 0, distanceKm: 0, platform: '2' },
        { stationCode: 'PER', arrivalTime: '08:58', departureTime: '08:59', dayOffset: 0, distanceKm: 15, platform: '2' },
        { stationCode: 'MASS', arrivalTime: '09:10', departureTime: '09:10', dayOffset: 0, distanceKm: 21, platform: '2' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 10 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 60 },
      ],
    });

    // Train 20: Chennai Central - Tiruvallur Fast EMU (43201)
    this.createTrainWithRoute({
      id: 'trn_43201',
      trainNumber: '43201',
      name: 'Chennai Central - Tiruvallur Fast EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'MASS', arrivalTime: '08:20', departureTime: '08:20', dayOffset: 0, distanceKm: 0, platform: '3' },
        { stationCode: 'PER', arrivalTime: '08:29', departureTime: '08:30', dayOffset: 0, distanceKm: 6, platform: '1' },
        { stationCode: 'AVD', arrivalTime: '08:52', departureTime: '08:53', dayOffset: 0, distanceKm: 21, platform: '1' },
        { stationCode: 'TRL', arrivalTime: '09:22', departureTime: '09:22', dayOffset: 0, distanceKm: 42, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 15 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 75 },
      ],
    });

    // Train 21: Tiruvallur - Chennai Central Fast EMU (43202) - Return
    this.createTrainWithRoute({
      id: 'trn_43202',
      trainNumber: '43202',
      name: 'Tiruvallur - Chennai Central Fast EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'TRL', arrivalTime: '09:40', departureTime: '09:40', dayOffset: 0, distanceKm: 0, platform: '2' },
        { stationCode: 'AVD', arrivalTime: '10:07', departureTime: '10:08', dayOffset: 0, distanceKm: 21, platform: '2' },
        { stationCode: 'PER', arrivalTime: '10:30', departureTime: '10:31', dayOffset: 0, distanceKm: 36, platform: '2' },
        { stationCode: 'MASS', arrivalTime: '10:42', departureTime: '10:42', dayOffset: 0, distanceKm: 42, platform: '4' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 15 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 75 },
      ],
    });

    // Train 22: Chennai Central - Arakkonam Fast EMU (43401)
    this.createTrainWithRoute({
      id: 'trn_43401',
      trainNumber: '43401',
      name: 'Chennai Central - Arakkonam Fast EMU',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'MASS', arrivalTime: '09:10', departureTime: '09:10', dayOffset: 0, distanceKm: 0, platform: '4' },
        { stationCode: 'PER', arrivalTime: '09:19', departureTime: '09:20', dayOffset: 0, distanceKm: 6, platform: '1' },
        { stationCode: 'AVD', arrivalTime: '09:42', departureTime: '09:43', dayOffset: 0, distanceKm: 21, platform: '1' },
        { stationCode: 'TRL', arrivalTime: '10:10', departureTime: '10:11', dayOffset: 0, distanceKm: 42, platform: '1' },
        { stationCode: 'AJJ', arrivalTime: '10:48', departureTime: '10:48', dayOffset: 0, distanceKm: 69, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 20 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 90 },
      ],
    });

    // Train 23: Chennai Central - Gummidipoondi Local EMU (42001)
    this.createTrainWithRoute({
      id: 'trn_42001',
      trainNumber: '42001',
      name: 'Chennai Central - Gummidipoondi Local',
      trainType: 'Suburban EMU',
      stops: [
        { stationCode: 'MASS', arrivalTime: '07:50', departureTime: '07:50', dayOffset: 0, distanceKm: 0, platform: '5' },
        { stationCode: 'PER', arrivalTime: '08:00', departureTime: '08:01', dayOffset: 0, distanceKm: 6, platform: '1' },
        { stationCode: 'GPD', arrivalTime: '09:15', departureTime: '09:15', dayOffset: 0, distanceKm: 47, platform: '1' },
      ],
      classes: [
        { code: 'II', label: 'Second Class Suburban', baseFare: 15 },
        { code: 'FC', label: 'First Class Suburban', baseFare: 75 },
      ],
    });

    // Train 24: Pandian Superfast Express (12637) Chennai Egmore -> Madurai Junction
    this.createTrainWithRoute({
      id: 'trn_12637',
      trainNumber: '12637',
      name: 'Pandian Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Chennai', 'Chengalpattu', 'Villupuram', 'Tiruchirappalli', 'Dindigul', 'Madurai'],
      amenities: ['E-Catering Available', 'Bio-Toilets', 'Charging Points at Every Bay', 'Onboard Housekeeping', 'Clean Bedroll'],
      pantry: true,
      coachComposition: ['LOCO', 'SLR', 'GS', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'A1', 'A2', 'H1', 'GS', 'EOG'],
      stops: [
        { stationCode: 'MS', arrivalTime: '21:40', departureTime: '21:40', dayOffset: 0, distanceKm: 0, platform: '4' },
        { stationCode: 'CGL', arrivalTime: '22:38', departureTime: '22:40', dayOffset: 0, distanceKm: 56, platform: '6' },
        { stationCode: 'VM', arrivalTime: '23:55', departureTime: '23:57', dayOffset: 0, distanceKm: 159, platform: '1' },
        { stationCode: 'TPJ', arrivalTime: '02:00', departureTime: '02:05', dayOffset: 1, distanceKm: 337, platform: '1' },
        { stationCode: 'DG', arrivalTime: '03:10', departureTime: '03:12', dayOffset: 1, distanceKm: 431, platform: '2' },
        { stationCode: 'MDU', arrivalTime: '05:25', departureTime: '05:25', dayOffset: 1, distanceKm: 493, platform: '1' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 315 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 845 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 1195 },
        { code: '1A', label: 'AC First Class', baseFare: 1985 },
      ],
    });

    // Train 25: Pandian Superfast Express (12638) Madurai Junction -> Chennai Egmore (Return)
    this.createTrainWithRoute({
      id: 'trn_12638',
      trainNumber: '12638',
      name: 'Pandian Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Madurai', 'Dindigul', 'Tiruchirappalli', 'Villupuram', 'Chengalpattu', 'Chennai'],
      amenities: ['E-Catering Available', 'Bio-Toilets', 'Charging Points at Every Bay', 'Onboard Housekeeping', 'Clean Bedroll'],
      pantry: true,
      coachComposition: ['LOCO', 'SLR', 'GS', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'A1', 'A2', 'H1', 'GS', 'EOG'],
      stops: [
        { stationCode: 'MDU', arrivalTime: '21:35', departureTime: '21:35', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'DG', arrivalTime: '22:33', departureTime: '22:35', dayOffset: 0, distanceKm: 62, platform: '1' },
        { stationCode: 'TPJ', arrivalTime: '00:05', departureTime: '00:10', dayOffset: 1, distanceKm: 156, platform: '1' },
        { stationCode: 'VM', arrivalTime: '02:13', departureTime: '02:15', dayOffset: 1, distanceKm: 334, platform: '1' },
        { stationCode: 'CGL', arrivalTime: '03:53', departureTime: '03:55', dayOffset: 1, distanceKm: 437, platform: '5' },
        { stationCode: 'MS', arrivalTime: '05:15', departureTime: '05:15', dayOffset: 1, distanceKm: 493, platform: '5' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 315 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 845 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 1195 },
        { code: '1A', label: 'AC First Class', baseFare: 1985 },
      ],
    });

    // Train 26: Cheran Superfast Express (12673) MGR Chennai Central -> Coimbatore Main
    this.createTrainWithRoute({
      id: 'trn_12673',
      trainNumber: '12673',
      name: 'Cheran Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Chennai', 'Ranipet', 'Vellore', 'Salem', 'Erode', 'Tiruppur', 'Coimbatore'],
      amenities: ['Pantry / E-Catering', 'Charging Ports', 'Bio-Toilets', 'OBHS Cleaning', 'Premium Linen in AC'],
      pantry: true,
      coachComposition: ['LOCO', 'EOG', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'B1', 'B2', 'B3', 'B4', 'B5', 'A1', 'A2', 'H1', 'GS', 'SLR'],
      stops: [
        { stationCode: 'MAS', arrivalTime: '22:00', departureTime: '22:00', dayOffset: 0, distanceKm: 0, platform: '10' },
        { stationCode: 'AJJ', arrivalTime: '22:58', departureTime: '23:00', dayOffset: 0, distanceKm: 69, platform: '1' },
        { stationCode: 'KPD', arrivalTime: '23:48', departureTime: '23:50', dayOffset: 0, distanceKm: 130, platform: '1' },
        { stationCode: 'SA', arrivalTime: '03:07', departureTime: '03:10', dayOffset: 1, distanceKm: 334, platform: '4' },
        { stationCode: 'ED', arrivalTime: '04:10', departureTime: '04:15', dayOffset: 1, distanceKm: 394, platform: '2' },
        { stationCode: 'TUP', arrivalTime: '05:00', departureTime: '05:02', dayOffset: 1, distanceKm: 444, platform: '1' },
        { stationCode: 'CBE', arrivalTime: '06:00', departureTime: '06:00', dayOffset: 1, distanceKm: 495, platform: '2' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 320 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 855 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 1210 },
        { code: '1A', label: 'AC First Class', baseFare: 2010 },
      ],
    });

    // Train 27: Cheran Superfast Express (12674) Coimbatore Main -> MGR Chennai Central (Return)
    this.createTrainWithRoute({
      id: 'trn_12674',
      trainNumber: '12674',
      name: 'Cheran Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Vellore', 'Ranipet', 'Chennai'],
      amenities: ['Pantry / E-Catering', 'Charging Ports', 'Bio-Toilets', 'OBHS Cleaning', 'Premium Linen in AC'],
      pantry: true,
      coachComposition: ['LOCO', 'EOG', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'B1', 'B2', 'B3', 'B4', 'B5', 'A1', 'A2', 'H1', 'GS', 'SLR'],
      stops: [
        { stationCode: 'CBE', arrivalTime: '22:50', departureTime: '22:50', dayOffset: 0, distanceKm: 0, platform: '3' },
        { stationCode: 'TUP', arrivalTime: '23:33', departureTime: '23:35', dayOffset: 0, distanceKm: 51, platform: '2' },
        { stationCode: 'ED', arrivalTime: '00:30', departureTime: '00:35', dayOffset: 1, distanceKm: 101, platform: '1' },
        { stationCode: 'SA', arrivalTime: '01:27', departureTime: '01:30', dayOffset: 1, distanceKm: 161, platform: '1' },
        { stationCode: 'KPD', arrivalTime: '04:43', departureTime: '04:45', dayOffset: 1, distanceKm: 365, platform: '2' },
        { stationCode: 'AJJ', arrivalTime: '05:38', departureTime: '05:40', dayOffset: 1, distanceKm: 426, platform: '2' },
        { stationCode: 'MAS', arrivalTime: '07:00', departureTime: '07:00', dayOffset: 1, distanceKm: 495, platform: '9' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 320 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 855 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 1210 },
        { code: '1A', label: 'AC First Class', baseFare: 2010 },
      ],
    });

    // Train 28: Coimbatore - MGR Chennai Central Vande Bharat Express (20644)
    this.createTrainWithRoute({
      id: 'trn_20644',
      trainNumber: '20644',
      name: 'Coimbatore - Chennai Vande Bharat',
      trainType: 'Vande Bharat',
      runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Vellore', 'Chennai'],
      amenities: ['180° Rotating Seats (EC)', 'High-Speed Wi-Fi', 'Hot Breakfast & Snacks Included', 'Kavach Safety System', 'Individual Reading Lights & USB-C'],
      pantry: true,
      coachComposition: ['DTC', 'MC (C1)', 'TC (C2)', 'MC (C3)', 'TC (C4)', 'MC (EC1)', 'TC (C5)', 'DTC'],
      stops: [
        { stationCode: 'CBE', arrivalTime: '06:00', departureTime: '06:00', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'TUP', arrivalTime: '06:47', departureTime: '06:49', dayOffset: 0, distanceKm: 51, platform: '2' },
        { stationCode: 'ED', arrivalTime: '07:31', departureTime: '07:34', dayOffset: 0, distanceKm: 101, platform: '1' },
        { stationCode: 'SA', arrivalTime: '08:22', departureTime: '08:25', dayOffset: 0, distanceKm: 161, platform: '4' },
        { stationCode: 'KPD', arrivalTime: '10:48', departureTime: '10:50', dayOffset: 0, distanceKm: 365, platform: '1' },
        { stationCode: 'MAS', arrivalTime: '11:50', departureTime: '11:50', dayOffset: 0, distanceKm: 495, platform: '2' },
      ],
      classes: [
        { code: 'CC', label: 'AC Chair Car', baseFare: 1365 },
        { code: 'EC', label: 'Executive Chair Car', baseFare: 2485 },
      ],
    });

    // Train 29: MGR Chennai Central - Coimbatore Vande Bharat Express (20643)
    this.createTrainWithRoute({
      id: 'trn_20643',
      trainNumber: '20643',
      name: 'Chennai - Coimbatore Vande Bharat',
      trainType: 'Vande Bharat',
      runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Chennai', 'Vellore', 'Salem', 'Erode', 'Tiruppur', 'Coimbatore'],
      amenities: ['180° Rotating Seats (EC)', 'High-Speed Wi-Fi', 'Dinner & Beverages Included', 'Kavach Safety System', 'Individual Reading Lights & USB-C'],
      pantry: true,
      coachComposition: ['DTC', 'MC (C1)', 'TC (C2)', 'MC (C3)', 'TC (C4)', 'MC (EC1)', 'TC (C5)', 'DTC'],
      stops: [
        { stationCode: 'MAS', arrivalTime: '14:15', departureTime: '14:15', dayOffset: 0, distanceKm: 0, platform: '2' },
        { stationCode: 'KPD', arrivalTime: '15:35', departureTime: '15:37', dayOffset: 0, distanceKm: 130, platform: '1' },
        { stationCode: 'SA', arrivalTime: '17:58', departureTime: '18:00', dayOffset: 0, distanceKm: 334, platform: '1' },
        { stationCode: 'ED', arrivalTime: '18:50', departureTime: '18:53', dayOffset: 0, distanceKm: 394, platform: '2' },
        { stationCode: 'TUP', arrivalTime: '19:33', departureTime: '19:35', dayOffset: 0, distanceKm: 444, platform: '1' },
        { stationCode: 'CBE', arrivalTime: '20:15', departureTime: '20:15', dayOffset: 0, distanceKm: 495, platform: '1' },
      ],
      classes: [
        { code: 'CC', label: 'AC Chair Car', baseFare: 1365 },
        { code: 'EC', label: 'Executive Chair Car', baseFare: 2485 },
      ],
    });

    // Train 30: Rockfort Superfast Express (12653) Chennai Egmore -> Tiruchirappalli Junction
    this.createTrainWithRoute({
      id: 'trn_12653',
      trainNumber: '12653',
      name: 'Rockfort Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Chennai', 'Chengalpattu', 'Villupuram', 'Tiruchirappalli'],
      amenities: ['E-Catering', 'Bio-Vacuum Toilets', 'Mobile Charging Ports', 'Onboard Cleaning', 'Fresh Bedroll'],
      pantry: false,
      coachComposition: ['LOCO', 'SLR', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'B1', 'B2', 'B3', 'B4', 'A1', 'H1', 'GS', 'EOG'],
      stops: [
        { stationCode: 'MS', arrivalTime: '23:35', departureTime: '23:35', dayOffset: 0, distanceKm: 0, platform: '4' },
        { stationCode: 'CGL', arrivalTime: '00:33', departureTime: '00:35', dayOffset: 1, distanceKm: 56, platform: '6' },
        { stationCode: 'VM', arrivalTime: '01:50', departureTime: '01:52', dayOffset: 1, distanceKm: 159, platform: '3' },
        { stationCode: 'TPJ', arrivalTime: '04:55', departureTime: '04:55', dayOffset: 1, distanceKm: 337, platform: '1' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 235 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 625 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 885 },
        { code: '1A', label: 'AC First Class', baseFare: 1475 },
      ],
    });

    // Train 31: Nellai Superfast Express (12631) Chennai Egmore -> Tirunelveli Junction
    this.createTrainWithRoute({
      id: 'trn_12631',
      trainNumber: '12631',
      name: 'Nellai Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Chennai', 'Chengalpattu', 'Villupuram', 'Tiruchirappalli', 'Dindigul', 'Madurai', 'Tirunelveli'],
      amenities: ['Pantry / E-Catering', 'Bio-Toilets', 'Device Charging Sockets', 'OBHS Cleansing', 'Linen Available in AC'],
      pantry: true,
      coachComposition: ['LOCO', 'SLR', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'B1', 'B2', 'B3', 'B4', 'B5', 'A1', 'A2', 'H1', 'GS', 'EOG'],
      stops: [
        { stationCode: 'MS', arrivalTime: '20:10', departureTime: '20:10', dayOffset: 0, distanceKm: 0, platform: '7' },
        { stationCode: 'CGL', arrivalTime: '21:08', departureTime: '21:10', dayOffset: 0, distanceKm: 56, platform: '6' },
        { stationCode: 'VM', arrivalTime: '22:48', departureTime: '22:50', dayOffset: 0, distanceKm: 159, platform: '1' },
        { stationCode: 'TPJ', arrivalTime: '01:10', departureTime: '01:15', dayOffset: 1, distanceKm: 337, platform: '1' },
        { stationCode: 'DG', arrivalTime: '02:30', departureTime: '02:32', dayOffset: 1, distanceKm: 431, platform: '2' },
        { stationCode: 'MDU', arrivalTime: '03:50', departureTime: '03:55', dayOffset: 1, distanceKm: 493, platform: '1' },
        { stationCode: 'TEN', arrivalTime: '06:35', departureTime: '06:35', dayOffset: 1, distanceKm: 650, platform: '1' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 385 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 1045 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 1495 },
        { code: '1A', label: 'AC First Class', baseFare: 2510 },
      ],
    });

    // Train 32: Nellai Superfast Express (12632) Tirunelveli Junction -> Chennai Egmore (Return)
    this.createTrainWithRoute({
      id: 'trn_12632',
      trainNumber: '12632',
      name: 'Nellai Superfast Express',
      trainType: 'Superfast Express',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Tirunelveli', 'Madurai', 'Dindigul', 'Tiruchirappalli', 'Villupuram', 'Chengalpattu', 'Chennai'],
      amenities: ['Pantry / E-Catering', 'Bio-Toilets', 'Device Charging Sockets', 'OBHS Cleansing', 'Linen Available in AC'],
      pantry: true,
      coachComposition: ['LOCO', 'SLR', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'B1', 'B2', 'B3', 'B4', 'B5', 'A1', 'A2', 'H1', 'GS', 'EOG'],
      stops: [
        { stationCode: 'TEN', arrivalTime: '20:05', departureTime: '20:05', dayOffset: 0, distanceKm: 0, platform: '1' },
        { stationCode: 'MDU', arrivalTime: '22:20', departureTime: '22:25', dayOffset: 0, distanceKm: 157, platform: '1' },
        { stationCode: 'DG', arrivalTime: '23:22', departureTime: '23:25', dayOffset: 0, distanceKm: 219, platform: '2' },
        { stationCode: 'TPJ', arrivalTime: '00:55', departureTime: '01:00', dayOffset: 1, distanceKm: 313, platform: '1' },
        { stationCode: 'VM', arrivalTime: '03:33', departureTime: '03:35', dayOffset: 1, distanceKm: 491, platform: '1' },
        { stationCode: 'CGL', arrivalTime: '05:23', departureTime: '05:25', dayOffset: 1, distanceKm: 594, platform: '5' },
        { stationCode: 'MS', arrivalTime: '06:55', departureTime: '06:55', dayOffset: 1, distanceKm: 650, platform: '6' },
      ],
      classes: [
        { code: 'SL', label: 'Sleeper Class', baseFare: 385 },
        { code: '3A', label: 'AC 3 Tier', baseFare: 1045 },
        { code: '2A', label: 'AC 2 Tier', baseFare: 1495 },
        { code: '1A', label: 'AC First Class', baseFare: 2510 },
      ],
    });

    // Train 33: Vaigai Superfast Express (12635) Chennai Egmore -> Madurai Junction (Day Intercity)
    this.createTrainWithRoute({
      id: 'trn_12635',
      trainNumber: '12635',
      name: 'Vaigai Superfast Express',
      trainType: 'Superfast Intercity',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      districtConnect: ['Chennai', 'Chengalpattu', 'Villupuram', 'Tiruchirappalli', 'Dindigul', 'Madurai'],
      amenities: ['Full Pantry Car', 'Snacks & Lunch Service', 'Pushback AC Chair Car', 'Panoramic Windows', 'Bio-Toilets'],
      pantry: true,
      coachComposition: ['LOCO', 'SLR', 'GS', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'C1', 'C2', 'C3', 'PC', 'GS', 'SLR'],
      stops: [
        { stationCode: 'MS', arrivalTime: '13:50', departureTime: '13:50', dayOffset: 0, distanceKm: 0, platform: '4' },
        { stationCode: 'CGL', arrivalTime: '14:48', departureTime: '14:50', dayOffset: 0, distanceKm: 56, platform: '6' },
        { stationCode: 'VM', arrivalTime: '16:00', departureTime: '16:05', dayOffset: 0, distanceKm: 159, platform: '1' },
        { stationCode: 'TPJ', arrivalTime: '18:05', departureTime: '18:10', dayOffset: 0, distanceKm: 337, platform: '3' },
        { stationCode: 'DG', arrivalTime: '19:18', departureTime: '19:20', dayOffset: 0, distanceKm: 431, platform: '2' },
        { stationCode: 'MDU', arrivalTime: '21:15', departureTime: '21:15', dayOffset: 0, distanceKm: 493, platform: '2' },
      ],
      classes: [
        { code: '2S', label: 'Second Sitting', baseFare: 180 },
        { code: 'CC', label: 'AC Chair Car', baseFare: 650 },
      ],
    });

    // 4. Seed sample initial booking for demo passenger
    const seedBooking: Booking = {
      id: 'bkg_seed_001',
      publicReference: 'RC-BKG-849201',
      userId: demoUser.id,
      userEmail: demoUser.email,
      userName: demoUser.name,
      trainId: 'trn_22436',
      trainNumber: '22436',
      trainName: 'Vande Bharat Express',
      sourceStationCode: 'NDLS',
      sourceStationName: 'New Delhi Railway Station',
      destStationCode: 'CNB',
      destStationName: 'Kanpur Central',
      departureTime: '06:00',
      arrivalTime: '10:08',
      journeyDate: '2026-11-05',
      classCode: 'CC',
      className: 'AC Chair Car',
      status: 'CONFIRMED',
      passengers: [
        {
          id: 'psg_seed_001',
          bookingId: 'bkg_seed_001',
          name: 'Aditya Sharma',
          age: 32,
          gender: 'Male',
          berthPreference: 'Window',
          coach: 'C4',
          seatNumber: 'C4-23',
        },
      ],
      fareBreakdown: {
        baseFare: 1450,
        reservationCharge: 40,
        superfastFee: 45,
        taxes: 76.75,
        discount: 0,
        totalAmount: 1611.75,
      },
      currency: 'INR',
      idempotencyKey: 'idemp_seed_init_001',
      providerPnr: null, // As required by specifications, providerPnr stays null unless supplied by authorized provider
      paymentId: 'pay_seed_001',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };

    const seedPayment: Payment = {
      id: 'pay_seed_001',
      bookingId: seedBooking.id,
      provider: 'sandbox',
      providerPaymentId: 'pay_sandbox_tx_99281',
      amount: 1611.75,
      currency: 'INR',
      status: 'SUCCESS',
      paymentMethod: 'UPI Sandbox (GPay)',
      paidAt: seedBooking.createdAt,
      createdAt: seedBooking.createdAt,
    };

    this.bookings.set(seedBooking.id, seedBooking);
    this.payments.set(seedPayment.id, seedPayment);

    // Initial audit log
    this.logAudit({
      actorUserId: demoUser.id,
      actorEmail: demoUser.email,
      action: 'SYSTEM_BOOTSTRAP',
      resourceType: 'System',
      resourceId: 'railconnect_core',
      details: { seededTrains: 9, seededStations: 12 },
    });

    this.isInitialized = true;
  }

  private createTrainWithRoute(options: {
    id: string;
    trainNumber: string;
    name: string;
    trainType: string;
    runningDays?: string[];
    amenities?: string[];
    pantry?: boolean;
    coachComposition?: string[];
    districtConnect?: string[];
    stops: {
      stationCode: string;
      arrivalTime: string;
      departureTime: string;
      dayOffset: number;
      distanceKm?: number;
      platform?: string;
      haltMinutes?: number;
    }[];
    classes: {
      code: string;
      label: string;
      baseFare: number;
    }[];
  }): void {
    const isSuburban = options.trainType.includes('Suburban') || options.trainType.includes('EMU') || options.trainType.includes('Local') || options.trainType.includes('MRTS');

    // Default amenities based on train type
    const defaultAmenities = isSuburban
      ? ['Suburban EMU Coach', 'High Acceleration', 'Overhead Electric (25kV)', 'Electronic Destination Display', 'Emergency Braking & Intercom']
      : options.trainType === 'Vande Bharat'
      ? ['Executive Ergonomic Seats', 'High Speed Wi-Fi & Infotainment', 'Onboard Hot Catering & Pantry', 'Bio-Vacuum Toilets', 'Kavach Automatic Train Protection', 'Individual Mobile Charging & Reading Lights']
      : ['Pantry Car / E-Catering', 'Bio-Toilets', 'Mobile Charging Ports', 'Onboard Housekeeping (OBHS)', 'Bedroll & Linen in AC Coaches'];

    // Default coach composition
    const defaultCoachComposition = options.coachComposition || (
      isSuburban
        ? ['DTC (Motor Cab)', 'TC (Trailer)', 'MC (Motor)', 'TC (Trailer)', 'TC (First Class)', 'MC (Motor)', 'TC (Ladies)', 'TC (Trailer)', 'MC (Motor)', 'TC', 'TC', 'DTC (Motor Cab)']
        : options.trainType === 'Vande Bharat'
        ? ['DTC (Engine)', 'MC (C1)', 'TC (C2)', 'MC (C3)', 'TC (C4)', 'MC (EC1)', 'TC (C5)', 'DTC (Cab)']
        : ['LOCO', 'SLR', 'GS', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'B1', 'B2', 'B3', 'B4', 'A1', 'H1', 'PC', 'GS', 'EOG']
    );

    // Compute districts traversed
    const districtsTraversed = options.districtConnect || Array.from(new Set(
      options.stops.map((st) => {
        const s = this.stations.get(`stn_${st.stationCode.toLowerCase()}`);
        return s?.district;
      }).filter(Boolean) as string[]
    ));

    const train: Train = {
      id: options.id,
      trainNumber: options.trainNumber,
      name: options.name,
      trainType: options.trainType,
      runningDays: options.runningDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      amenities: options.amenities || defaultAmenities,
      pantry: options.pantry !== undefined ? options.pantry : !isSuburban,
      coachComposition: defaultCoachComposition,
      districtConnect: districtsTraversed,
      active: true,
    };
    this.trains.set(train.id, train);

    // Add Stops
    options.stops.forEach((st, idx) => {
      const stationId = `stn_${st.stationCode.toLowerCase()}`;
      const station = this.stations.get(stationId);
      const stopId = `stp_${options.trainNumber}_${idx}`;

      let haltMin = st.haltMinutes;
      if (haltMin === undefined) {
        if (idx === 0 || idx === options.stops.length - 1) {
          haltMin = 0;
        } else {
          const [arrH, arrM] = st.arrivalTime.split(':').map(Number);
          const [depH, depM] = st.departureTime.split(':').map(Number);
          haltMin = Math.max(1, (depH * 60 + depM) - (arrH * 60 + arrM));
        }
      }

      const stop: TrainStop = {
        id: stopId,
        trainId: train.id,
        stationId,
        stationCode: st.stationCode,
        stationName: station ? station.name : st.stationCode,
        district: station?.district,
        sequence: idx + 1,
        arrivalTime: st.arrivalTime,
        departureTime: st.departureTime,
        dayOffset: st.dayOffset,
        distanceKm: st.distanceKm,
        platform: st.platform || '1',
        haltMinutes: haltMin,
      };
      this.trainStops.set(stop.id, stop);
    });

    // Add Classes & Fares
    options.classes.forEach((cl) => {
      const classId = `cls_${options.trainNumber}_${cl.code}`;
      this.trainClasses.set(classId, {
        id: classId,
        trainId: train.id,
        code: cl.code,
        label: cl.label,
      });

      const quoteId = `fq_${options.trainNumber}_${cl.code}`;
      const isSuburban = options.trainType.includes('Suburban') || options.trainType.includes('EMU') || options.trainType.includes('Local') || options.trainType.includes('MRTS');
      const tax = isSuburban ? 0 : Math.round(cl.baseFare * 0.05 * 100) / 100;
      const resFee = isSuburban ? 0 : 40;
      const sfCharge = isSuburban ? 0 : (options.trainType === 'Superfast' || options.trainType === 'Rajdhani' || options.trainType === 'Vande Bharat' ? 45 : 30);
      this.fareQuotes.set(quoteId, {
        id: quoteId,
        trainId: train.id,
        classCode: cl.code,
        baseAmount: cl.baseFare,
        reservationFee: resFee,
        superfastCharge: sfCharge,
        taxAmount: tax,
        totalAmount: cl.baseFare + resFee + sfCharge + tax,
        currency: 'INR',
        sourceMode: 'DEMO',
        fetchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
    });
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'createdAt'>): void {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs.pop();
    }
  }
}

export const db = new DatabaseStore();
