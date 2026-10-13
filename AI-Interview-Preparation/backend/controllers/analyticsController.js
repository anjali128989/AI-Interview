
const InterviewSession = require('../models/InterviewSession');

exports.getAnalytics = async (req, res) => {
  try {
    // Get the authenticated user from JWT middleware
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authenticated user ID not found.',
      });
    }

    const { range = 'all' } = req.query;

    // Build date filter
    const dateFilter = {};

    if (range !== 'all') {
      const days = Number(range);

      if (!Number.isFinite(days) || days <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid analytics range.',
        });
      }

      dateFilter.createdAt = {
        $gte: new Date(
          Date.now() - days * 24 * 60 * 60 * 1000
        ),
      };
    }

    // IMPORTANT: "user" must match the owner field in your schema
    const query = {
      user: userId,
      ...dateFilter,
    };

    console.log('Analytics user ID:', userId.toString());

    const interviews = await InterviewSession.find(query)
      .sort({ createdAt: -1 })
      .lean();

    console.log('User interviews found:', interviews.length);

    const completed = interviews.filter(
      (item) =>
        item.status === 'completed' ||
        item.status === 'completed'
    );

    const scores = completed
      .map((item) => Number(item.score))
      .filter(Number.isFinite);

    const averageScore = scores.length
      ? scores.reduce((sum, score) => sum + score, 0) /
        scores.length
      : 0;

    const totalInterviews = interviews.length;
    const completedInterviews = completed.length;

    const recentInterviews = interviews.slice(0, 5).map((item) => ({
      _id: item._id,
      role: item.role || item.jobRole || 'General Interview',
      difficulty: item.difficulty || 'Not specified',
      status: item.status || 'in-progress',
      score: Number.isFinite(Number(item.score))
        ? Number(item.score)
        : null,
      createdAt: item.createdAt,
    }));

    // Group completed interviews by role
    const roleMap = {};

    completed.forEach((item) => {
      const role = item.role || item.jobRole || 'General Interview';

      if (!roleMap[role]) {
        roleMap[role] = {
          role,
          total: 0,
          scoreTotal: 0,
          scoredCount: 0,
        };
      }

      roleMap[role].total += 1;

      const score = Number(item.score);

      if (Number.isFinite(score)) {
        roleMap[role].scoreTotal += score;
        roleMap[role].scoredCount += 1;
      }
    });

    const performanceByRole = Object.values(roleMap).map((item) => ({
      role: item.role,
      total: item.total,
      averageScore: item.scoredCount
        ? Math.round(item.scoreTotal / item.scoredCount)
        : 0,
    }));

    // Group interviews by difficulty
    const difficultyMap = {};

    completed.forEach((item) => {
      const difficulty = item.difficulty || 'Not specified';

      if (!difficultyMap[difficulty]) {
        difficultyMap[difficulty] = {
          difficulty,
          total: 0,
          scoreTotal: 0,
          scoredCount: 0,
        };
      }

      difficultyMap[difficulty].total += 1;

      const score = Number(item.score);

      if (Number.isFinite(score)) {
        difficultyMap[difficulty].scoreTotal += score;
        difficultyMap[difficulty].scoredCount += 1;
      }
    });

    const performanceByDifficulty = Object.values(difficultyMap).map(
      (item) => ({
        difficulty: item.difficulty,
        total: item.total,
        averageScore: item.scoredCount
          ? Math.round(item.scoreTotal / item.scoredCount)
          : 0,
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalInterviews,
          completedInterviews,
          averageScore: Math.round(averageScore),
          completionRate: totalInterviews
            ? Math.round(
                (completedInterviews / totalInterviews) * 100
              )
            : 0,
        },
        performanceByRole,
        performanceByDifficulty,
        recentInterviews,
      },
    });
  } catch (error) {
    console.error('Analytics controller error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load analytics.',
    });
  }
};