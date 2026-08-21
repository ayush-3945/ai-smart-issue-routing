const Complaint = require('../models/Complaint');
const { predictWorkloadSurge } = require('../services/aiService');

const DEFAULT_PREDICTIONS = {
  riskLevel: 'Moderate',
  projectedSurgePercentage: 24,
  primarySurgeDepartment: 'IT',
  forecastSummary: 'Expected moderate ticket volume across technical departments with stable operations in administrative teams.',
  actionableRecommendation: 'Maintain standard SLA response teams and monitor peak hour ticket submissions.',
  departmentForecasts: [
    { department: 'IT', risk: 'High', projectedVolume: '+32%', insight: 'Server & network infrastructure queries' },
    { department: 'HR', risk: 'Moderate', projectedVolume: '+14%', insight: 'Quarterly benefits & onboarding' },
    { department: 'Finance', risk: 'Low', projectedVolume: 'Stable', insight: 'Standard invoice processing' },
    { department: 'Operations', risk: 'Low', projectedVolume: 'Stable', insight: 'Facility maintenance steady' }
  ]
};

// In-memory cache for AI predictions
let cachedPredictions = DEFAULT_PREDICTIONS;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

const getDashboardAnalytics = async (req, res) => {
  try {
    // All MongoDB aggregations run in PARALLEL for max speed
    const [statusStats, categoryStats, priorityStats, trendStats, totalComplaints] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Complaint.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Complaint.countDocuments()
    ]);

    // Use cached predictions — send response INSTANTLY
    let predictions = cachedPredictions || DEFAULT_PREDICTIONS;

    // Refresh AI predictions in background if cache expired
    const now = Date.now();
    if ((now - cacheTimestamp) > CACHE_TTL) {
      predictWorkloadSurge({ totalComplaints, statusStats, categoryStats, priorityStats })
        .then((result) => {
          if (result && result.forecastSummary) {
            cachedPredictions = result;
            cacheTimestamp = Date.now();
          }
        })
        .catch((err) => console.warn('AI prediction background refresh failed:', err.message));
    }

    res.status(200).json({
      totalComplaints,
      statusStats,
      categoryStats,
      priorityStats,
      trendStats,
      predictions: predictions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardAnalytics };