// server/tests/energy.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Your Express app
const User = require('../models/User');
const File = require('../models/File');
const EnergyData = require('../models/EnergyData');
const jwt = require('jsonwebtoken');

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpass123',
  name: 'Test User'
};

const mockEnergyCSVData = [
  {
    'Name of Month': 'January',
    'REB (KwH)': '22015',
    'Diesel (L)': '284',
    'NG(m3) Boiler': '26454',
    'NG(m3) Generator': '47793',
    'NG(m3) Total(m3)': '74247',
    'Solar(kw)': '57585'
  },
  {
    'Name of Month': 'February',
    'REB (KwH)': '11651',
    'Diesel (L)': '322',
    'NG(m3) Boiler': '24251',
    'NG(m3) Generator': '78938',
    'NG(m3) Total(m3)': '103189',
    'Solar(kw)': '67608'
  },
  {
    'Name of Month': 'March',
    'REB (KwH)': '15649',
    'Diesel (L)': '445',
    'NG(m3) Boiler': '19205',
    'NG(m3) Generator': '65035',
    'NG(m3) Total(m3)': '84240',
    'Solar(kw)': '84399'
  }
];

let authToken;
let userId;
let fileId;

// Setup and teardown
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/esg-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // Clear test data
  await User.deleteMany({});
  await File.deleteMany({});
  await EnergyData.deleteMany({});
  
  // Create test user
  const user = new User(testUser);
  await user.save();
  userId = user._id;
  
  // Generate auth token
  authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');
});

afterAll(async () => {
  // Cleanup
  await User.deleteMany({});
  await File.deleteMany({});
  await EnergyData.deleteMany({});
  await mongoose.connection.close();
});

describe('Energy Dashboard API Tests', () => {
  
  // Test 1: Create test file
  describe('POST /api/files/upload', () => {
    it('should upload energy CSV file', async () => {
      const file = new File({
        user: userId,
        name: 'test_energy_data.csv',
        type: 'text/csv',
        data: mockEnergyCSVData,
        metadata: {
          headers: Object.keys(mockEnergyCSVData[0]),
          category: 'energy',
          rowCount: mockEnergyCSVData.length
        }
      });
      
      await file.save();
      fileId = file._id;
      
      expect(file.name).toBe('test_energy_data.csv');
      expect(file.metadata.category).toBe('energy');
      expect(file.data.length).toBe(3);
    });
  });
  
  // Test 2: Get energy files
  describe('GET /api/energy/files', () => {
    it('should return all energy files for authenticated user', async () => {
      const response = await request(app)
        .get('/api/energy/files')
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.files).toBeInstanceOf(Array);
      expect(response.body.files.length).toBeGreaterThan(0);
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/energy/files')
        .expect(401);
    });
  });
  
  // Test 3: Process energy file
  describe('POST /api/energy/process/:fileId', () => {
    it('should process energy data from file', async () => {
      const response = await request(app)
        .post(`/api/energy/process/${fileId}`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('metrics');
      expect(response.body.data).toHaveProperty('monthlyData');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('period');
      
      // Verify metrics structure
      const { metrics } = response.body.data;
      expect(metrics).toHaveProperty('totalEnergy');
      expect(metrics).toHaveProperty('electricityGrid');
      expect(metrics).toHaveProperty('electricityRenewable');
      expect(metrics).toHaveProperty('naturalGas');
      expect(metrics).toHaveProperty('diesel');
      expect(metrics).toHaveProperty('renewablePercent');
      expect(metrics).toHaveProperty('avgMonthly');
      expect(metrics).toHaveProperty('peakMonth');
      expect(metrics).toHaveProperty('lowestMonth');
      
      // Verify monthly data
      expect(response.body.data.monthlyData).toBeInstanceOf(Array);
      expect(response.body.data.monthlyData.length).toBe(3);
    });
    
    it('should return cached data on second call', async () => {
      const response = await request(app)
        .post(`/api/energy/process/${fileId}`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.cached).toBe(true);
    });
    
    it('should return 404 for invalid file ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/api/energy/process/${fakeId}`)
        .set('x-auth-token', authToken)
        .expect(404);
    });
  });
  
  // Test 4: Get metrics
  describe('GET /api/energy/metrics/:fileId', () => {
    it('should return processed metrics for file', async () => {
      const response = await request(app)
        .get(`/api/energy/metrics/${fileId}`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.metrics).toBeDefined();
      expect(typeof response.body.data.metrics.totalEnergy).toBe('number');
    });
  });
  
  // Test 5: Get dashboard summary
  describe('GET /api/energy/dashboard-summary', () => {
    it('should return overall dashboard summary', async () => {
      const response = await request(app)
        .get('/api/energy/dashboard-summary')
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalFiles');
      expect(response.body.data).toHaveProperty('overallMetrics');
      expect(response.body.data).toHaveProperty('recentData');
      expect(response.body.data.totalFiles).toBeGreaterThan(0);
    });
  });
  
  // Test 6: Get trends
  describe('GET /api/energy/trends/:fileId', () => {
    it('should return trend analysis', async () => {
      const response = await request(app)
        .get(`/api/energy/trends/${fileId}`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('seasonalAverages');
      expect(response.body.data).toHaveProperty('anomalies');
      expect(response.body.data).toHaveProperty('overallTrend');
      expect(response.body.data).toHaveProperty('recommendations');
    });
  });
  
  // Test 7: Get recommendations
  describe('GET /api/energy/recommendations/:fileId', () => {
    it('should return optimization recommendations', async () => {
      const response = await request(app)
        .get(`/api/energy/recommendations/${fileId}`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations).toBeInstanceOf(Array);
      
      if (response.body.data.recommendations.length > 0) {
        const rec = response.body.data.recommendations[0];
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('message');
        expect(rec).toHaveProperty('actions');
      }
    });
  });
  
  // Test 8: Compare datasets
  describe('POST /api/energy/compare', () => {
    let secondFileId;
    
    beforeAll(async () => {
      // Create second file for comparison
      const file2 = new File({
        user: userId,
        name: 'test_energy_data_2.csv',
        type: 'text/csv',
        data: mockEnergyCSVData.map(row => ({
          ...row,
          'Solar(kw)': String(parseInt(row['Solar(kw)']) * 1.5) // Higher solar
        })),
        metadata: {
          headers: Object.keys(mockEnergyCSVData[0]),
          category: 'energy',
          rowCount: mockEnergyCSVData.length
        }
      });
      
      await file2.save();
      secondFileId = file2._id;
      
      // Process second file
      await request(app)
        .post(`/api/energy/process/${secondFileId}`)
        .set('x-auth-token', authToken);
    });
    
    it('should compare multiple datasets', async () => {
      const response = await request(app)
        .post('/api/energy/compare')
        .set('x-auth-token', authToken)
        .send({ fileIds: [fileId, secondFileId] })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.datasets).toBeInstanceOf(Array);
      expect(response.body.data.datasets.length).toBe(2);
      expect(response.body.data.insights).toBeInstanceOf(Array);
    });
    
    it('should return 400 without file IDs', async () => {
      await request(app)
        .post('/api/energy/compare')
        .set('x-auth-token', authToken)
        .send({})
        .expect(400);
    });
  });
  
  // Test 9: Export data
  describe('GET /api/energy/export/:fileId', () => {
    it('should export data as JSON', async () => {
      const response = await request(app)
        .get(`/api/energy/export/${fileId}?format=json`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.body).toHaveProperty('monthlyData');
      expect(response.body).toHaveProperty('metrics');
    });
    
    it('should export data as CSV', async () => {
      const response = await request(app)
        .get(`/api/energy/export/${fileId}?format=csv`)
        .set('x-auth-token', authToken)
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/csv');
      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('Month');
    });
  });
});

// Unit tests for controller methods
describe('Energy Controller Unit Tests', () => {
  const EnergyController = require('../controllers/energyController');
  
  describe('processEnergyData', () => {
    it('should correctly process energy data', () => {
      const headers = Object.keys(mockEnergyCSVData[0]);
      const result = EnergyController.processEnergyData(mockEnergyCSVData, headers);
      
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('monthlyData');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('period');
      
      expect(result.monthlyData.length).toBe(3);
      expect(result.period.months).toBe(3);
      expect(result.period.start).toBe('January');
      expect(result.period.end).toBe('March');
      
      // Verify calculations
      expect(result.metrics.totalEnergy).toBeGreaterThan(0);
      expect(result.metrics.renewablePercent).toBeGreaterThanOrEqual(0);
      expect(result.metrics.renewablePercent).toBeLessThanOrEqual(100);
    });
    
    it('should handle empty data', () => {
      expect(() => {
        EnergyController.processEnergyData([], []);
      }).toThrow();
    });
  });
  
  describe('calculateTrends', () => {
    it('should calculate energy trends', () => {
      const monthlyData = [
        { month: 'Jan', totalEnergy: 100, renewableEnergy: 10 },
        { month: 'Feb', totalEnergy: 110, renewableEnergy: 15 },
        { month: 'Mar', totalEnergy: 120, renewableEnergy: 20 }
      ];
      
      const trends = EnergyController.calculateTrends(monthlyData);
      
      expect(trends).toHaveProperty('energyTrend');
      expect(trends).toHaveProperty('renewableTrend');
      expect(trends).toHaveProperty('monthlyChange');
      expect(['increasing', 'decreasing', 'stable']).toContain(trends.energyTrend);
    });
  });
  
  describe('generateRecommendations', () => {
    it('should generate recommendations for low renewable', () => {
      const mockData = {
        metrics: {
          renewablePercent: 10,
          totalEnergy: 1000,
          electricityGrid: 500,
          naturalGas: 400,
          diesel: 90,
          electricityRenewable: 10
        },
        trends: {
          energyTrend: 'stable',
          renewableTrend: 'stable'
        }
      };
      
      const recommendations = EnergyController.generateRecommendations(mockData);
      
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
      
      const renewableRec = recommendations.find(r => r.type === 'renewable');
      expect(renewableRec).toBeDefined();
      expect(renewableRec.priority).toBe('high');
    });
    
    it('should recommend efficiency for increasing trend', () => {
      const mockData = {
        metrics: {
          renewablePercent: 35,
          totalEnergy: 1000,
          electricityGrid: 300,
          naturalGas: 300,
          diesel: 50,
          electricityRenewable: 350
        },
        trends: {
          energyTrend: 'increasing',
          renewableTrend: 'stable',
          monthlyChange: 15
        }
      };
      
      const recommendations = EnergyController.generateRecommendations(mockData);
      const efficiencyRec = recommendations.find(r => r.type === 'efficiency');
      
      expect(efficiencyRec).toBeDefined();
    });
  });
});

// Model tests
describe('EnergyData Model Tests', () => {
  it('should create energy data with valid schema', async () => {
    const energyData = new EnergyData({
      user: userId,
      file: fileId,
      fileName: 'test.csv',
      period: {
        start: 'January',
        end: 'March',
        months: 3
      },
      metrics: {
        totalEnergy: 100,
        electricityGrid: 50,
        electricityRenewable: 20,
        naturalGas: 25,
        diesel: 5,
        renewablePercent: 20,
        avgMonthly: 33.33,
        peakMonth: { value: 40, month: 'February' },
        lowestMonth: { value: 30, month: 'January' }
      },
      monthlyData: [
        { month: 'Jan', totalEnergy: 30, reb: 15, diesel: 5, ngTotal: 10, solar: 0, renewableEnergy: 0, fossilFuel: 30 }
      ],
      trends: {
        energyTrend: 'stable',
        renewableTrend: 'stable',
        monthlyChange: 0
      }
    });
    
    await energyData.save();
    expect(energyData._id).toBeDefined();
  });
  
  it('should enforce unique constraint on user+file', async () => {
    const duplicate = new EnergyData({
      user: userId,
      file: fileId,
      fileName: 'test.csv',
      period: { start: 'Jan', end: 'Dec', months: 12 },
      metrics: {
        totalEnergy: 100,
        electricityGrid: 50,
        electricityRenewable: 20,
        naturalGas: 25,
        diesel: 5,
        renewablePercent: 20,
        avgMonthly: 8.33,
        peakMonth: { value: 10, month: 'July' },
        lowestMonth: { value: 5, month: 'January' }
      },
      monthlyData: [
        { month: 'Jan', totalEnergy: 10, reb: 5, diesel: 2, ngTotal: 3, solar: 0, renewableEnergy: 0, fossilFuel: 10 }
      ],
      trends: {
        energyTrend: 'stable',
        renewableTrend: 'stable',
        monthlyChange: 0
      }
    });
    
    await expect(duplicate.save()).rejects.toThrow();
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should process large dataset efficiently', async () => {
    // Create a large dataset (12 months)
    const largeData = Array.from({ length: 12 }, (_, i) => ({
      'Name of Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      'REB (KwH)': String(Math.floor(Math.random() * 50000) + 10000),
      'Diesel (L)': String(Math.floor(Math.random() * 1000) + 100),
      'NG(m3) Total(m3)': String(Math.floor(Math.random() * 100000) + 20000),
      'Solar(kw)': String(Math.floor(Math.random() * 80000) + 50000)
    }));
    
    const file = new File({
      user: userId,
      name: 'large_test.csv',
      type: 'text/csv',
      data: largeData,
      metadata: {
        headers: Object.keys(largeData[0]),
        category: 'energy',
        rowCount: largeData.length
      }
    });
    
    await file.save();
    
    const startTime = Date.now();
    
    const response = await request(app)
      .post(`/api/energy/process/${file._id}`)
      .set('x-auth-token', authToken)
      .expect(200);
    
    const processingTime = Date.now() - startTime;
    
    expect(response.body.success).toBe(true);
    expect(processingTime).toBeLessThan(5000); // Should process in under 5 seconds
  });
});