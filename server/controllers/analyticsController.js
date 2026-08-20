const Complaint = require('../models/Complaint');
const { predictWorkloadSurge } = require('../services/aiService');

// In-memory cache for AI predictions (avoids blocking dashboard load)
let cachedPredictions = null;
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
    let predictions = cachedPredictions;

    // Refresh AI predictions in background if cache expired or null
    const now = Date.now();
    if (!cachedPredictions || (now - cacheTimestamp) > CACHE_TTL) {
      // Fire and forget — don't block the HTTP response
      predictWorkloadSurge({ totalComplaints, statusStats, categoryStats, priorityStats })
        .then((result) => {
          cachedPredictions = result;
          cacheTimestamp = Date.now();
        })
        .catch((err) => console.warn('AI prediction background refresh failed:', err.message));
    }

    res.status(200).json({
      totalComplaints,
      statusStats,
      categoryStats,
      priorityStats,
      trendStats,
      predictions: predictions || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardAnalytics };