
const InterviewSession = require('../models/InterviewSession');
const { generateQuestions } = require('../services/aiQuestionService');
const { evaluateSessionAnswers } = require('../services/aiEvaluationService');

// Helper: get the authenticated MongoDB user ID
const getAuthenticatedUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

// Helper: ensure the current request is authenticated
const requireUser = (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Please log in to continue.'
    });
    return null;
  }

  return userId;
};

// @desc    Setup a new interview session
// @route   POST /api/interview/setup
// @access  Private
exports.setupInterview = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const {
      jobRole,
      difficulty,
      duration,
      questionType,
      resumeText
    } = req.body;

    if (typeof jobRole !== 'string' || !jobRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required.'
      });
    }

    const normalizedJobRole = jobRole.trim();
    const normalizedDifficulty = difficulty || 'Medium';
    const normalizedDuration = Number(duration) || 10;
    const normalizedQuestionType = questionType || 'Mixed';

    // Create a session linked to the authenticated user.
    const session = await InterviewSession.create({
      user: userId,
      jobRole: normalizedJobRole,
      difficulty: normalizedDifficulty,
      duration: normalizedDuration,
      questionType: normalizedQuestionType,
      resumeText: resumeText || null,
      questions: [
        {
          question: `Tell me about your experience with ${normalizedJobRole}?`,
          category: 'Technical',
          expectedAnswer: 'Candidate should discuss relevant skills.'
        }
      ],
      status: 'Setup'
    });

    // Generate questions. Keep the fallback question if AI generation fails.
    try {
      const questions = await generateQuestions(
        normalizedJobRole,
        normalizedDifficulty,
        normalizedQuestionType,
        normalizedDuration,
        resumeText
      );

      if (Array.isArray(questions) && questions.length > 0) {
        session.questions = questions;
      }
    } catch (aiError) {
      console.error('AI question generation failed:', aiError.message);
    }

    session.status = 'InProgress';
    await session.save();

    return res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        questionCount: session.questions.length
      }
    });
  } catch (error) {
    console.error('Setup interview error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to set up interview.'
    });
  }
};

// @desc    Submit an answer to an interview question
// @route   POST /api/interview/answer
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { sessionId, questionIndex, transcript } = req.body;

    if (!sessionId || questionIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and question index are required.'
      });
    }

    const index = Number(questionIndex);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Question index must be a non-negative integer.'
      });
    }

    // Match BOTH session ID and owner.
    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    if (index >= session.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Question index is out of range.'
      });
    }

    let videoPath = null;

    if (req.file) {
      videoPath = `/uploads/interview-recordings/${req.file.filename}`;
    }

    if (!Array.isArray(session.answers)) {
      session.answers = [];
    }

    session.answers[index] = {
      ...(session.answers[index]?.toObject?.() || session.answers[index] || {}),
      video: videoPath,
      transcript: typeof transcript === 'string' ? transcript : '',
      recordedAt: new Date(),
      recorded: true
    };

    session.markModified('answers');
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Answer saved successfully.'
    });
  } catch (error) {
    console.error('Submit answer error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to save interview answer.'
    });
  }
};

// @desc    Complete an interview
// @route   PATCH /api/interview/:sessionId/complete
// @access  Private
exports.completeInterview = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { sessionId } = req.params;
    const { duration } = req.body;

    // Only the owner can complete this session.
    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    session.status = 'Completed';
    session.completedAt = new Date();

    if (duration !== undefined) {
      const actualDuration = Number(duration);

      if (!Number.isFinite(actualDuration) || actualDuration < 0) {
        return res.status(400).json({
          success: false,
          message: 'Duration must be a valid non-negative number.'
        });
      }

      session.actualDuration = actualDuration;
    }

    // Evaluate answers if present.
    if (session.answers && session.answers.length > 0) {
      try {
        const evaluatedAnswers = await evaluateSessionAnswers(
          session.questions,
          session.answers
        );

        if (Array.isArray(evaluatedAnswers)) {
          session.answers = evaluatedAnswers;
        }
      } catch (evaluationError) {
        console.error(
          'Answer evaluation failed:',
          evaluationError.message
        );

        // Allow interview completion even if evaluation fails.
      }
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Interview completed successfully.',
      data: {
        sessionId: session._id,
        status: session.status
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to complete interview.'
    });
  }
};

// @desc    Get one interview session
// @route   GET /api/interview/:sessionId
// @access  Private
exports.getInterviewSession = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: userId
    }).populate('user', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get interview session error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch interview session.'
    });
  }
};

// @desc    Get interview history for the authenticated user
// @route   GET /api/interview/history
// @access  Private
exports.getInterviewHistory = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    // Never use an empty query here: that would return every user's interviews.
    const interviews = await InterviewSession.find({
      user: userId
    })
      .sort({ createdAt: -1 })
      .select(
        'jobRole difficulty duration questionType status createdAt completedAt actualDuration questions answers'
      );

    return res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    console.error('Get interview history error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch interview history.'
    });
  }
};

// @desc    Delete an interview session
// @route   DELETE /api/interview/:sessionId
// @access  Private
exports.deleteInterview = async (req, res) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    // Only the owner can delete their interview.
    const session = await InterviewSession.findOneAndDelete({
      _id: req.params.sessionId,
      user: userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.'
      });
    }

    // TODO: Remove any associated video files if required.
    return res.status(200).json({
      success: true,
      message: 'Interview deleted successfully.'
    });
  } catch (error) {
    console.error('Delete interview error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to delete interview.'
    });
  }
};






exports.getInterviewAnalytics = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

console.log('[Analytics] Authenticated user:', {
  exists: !!req.user,
  id: userId ? String(userId) : null,
});

if (!userId) {
  return res.status(401).json({
    success: false,
    message: 'Authenticated user ID not found.',
  });
}

    const { range = 'all' } = req.query;
    const now = new Date();
    let startDate = null;

    if (range === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (range === 'month') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    } else if (range !== 'all') {
      return res.status(400).json({
        success: false,
        message: 'Invalid range. Use week, month, or all.',
      });
    }

    // Always scope the query to the authenticated MongoDB user.
    const query = { user: userId };

    if (startDate) {
      query.createdAt = { $gte: startDate, $lte: now };
    }

    const interviews = await InterviewSession.find(query)
      .sort({ createdAt: 1 })
      .lean();

    const getScores = (interview) =>
      (interview.answers || [])
        .filter(
          (answer) =>
            answer &&
            (
              answer.recorded === true ||
              answer.score !== undefined && answer.score !== null
            )
        )
        .map((answer) => Number(answer.score))
        .filter((score) => Number.isFinite(score));

    const average = (values) =>
      values.length
        ? Math.round(
            values.reduce((sum, value) => sum + value, 0) /
              values.length
          )
        : 0;

    const scoreFor = (interview) => {
      const scores = getScores(interview);
      return scores.length ? average(scores) : null;
    };

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(
      (item) => item.status === 'Completed'
    );
    const allScores = interviews.flatMap(getScores);
    const thisMonthStart = new Date(now);
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const interviewsThisMonth = interviews.filter(
      (item) => new Date(item.createdAt) >= thisMonthStart
    ).length;

    const totalQuestions = interviews.reduce(
      (sum, item) => sum + (item.questions?.length || 0),
      0
    );

    const totalPracticeTime = interviews.reduce(
      (sum, item) =>
        sum +
        (
          Number.isFinite(Number(item.actualDuration)) &&
          item.actualDuration != null
            ? Number(item.actualDuration)
            : item.status === 'Completed'
              ? Number(item.duration) || 0
              : 0
        ),
      0
    );

    const scoresByRole = {};
    const scoresByDifficulty = {};
    const scoresByCategory = {};
    const dailyScores = {};
    const activeDays = {};

    for (const interview of interviews) {
      const role = interview.jobRole || 'Other';
      const difficulty = interview.difficulty || 'Medium';
      const scores = getScores(interview);
      const interviewScore = scoreFor(interview);

      if (!scoresByRole[role]) scoresByRole[role] = [];
      if (interviewScore !== null) {
        scoresByRole[role].push(interviewScore);
      }

      if (!scoresByDifficulty[difficulty]) {
        scoresByDifficulty[difficulty] = 0;
      }
      scoresByDifficulty[difficulty]++;

      const date = new Date(interview.createdAt);
      const dateKey = date.toISOString().slice(0, 10);

      activeDays[dateKey] = (activeDays[dateKey] || 0) + 1;

      if (interviewScore !== null) {
        if (!dailyScores[dateKey]) dailyScores[dateKey] = [];
        dailyScores[dateKey].push(interviewScore);
      }

      (interview.questions || []).forEach((question, index) => {
        const answer = interview.answers?.[index];
        if (!answer) return;

        const score = Number(answer.score);
        if (!Number.isFinite(score)) return;

        const category = question.category || 'General';
        if (!scoresByCategory[category]) {
          scoresByCategory[category] = [];
        }
        scoresByCategory[category].push(score);
      });
    }

    const progressOverTime = Object.entries(dailyScores).map(
      ([date, scores]) => ({
        date,
        score: average(scores),
        average: average(scores),
      })
    );

    const performanceByRole = Object.entries(scoresByRole).map(
      ([role, scores]) => ({
        role,
        averageScore: average(scores),
        count: scores.length,
      })
    );

    const performanceByDifficulty = Object.entries(
      scoresByDifficulty
    ).map(([difficulty, count]) => ({
      difficulty,
      name: difficulty,
      count,
    }));

    const categoryScores = Object.entries(scoresByCategory).map(
      ([category, scores]) => ({
        category,
        score: average(scores),
      })
    );

    const recentInterviews = [...interviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      )
      .slice(0, 10)
      .map((interview) => ({
        _id: interview._id,
        jobRole: interview.jobRole,
        difficulty: interview.difficulty,
        status: interview.status,
        createdAt: interview.createdAt,
        averageScore: scoreFor(interview),
      }));

    const scoreImprovement =
      progressOverTime.length >= 2
        ? progressOverTime[progressOverTime.length - 1].score -
          progressOverTime[0].score
        : 0;

    const mostActiveDay = Object.entries(activeDays).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] || 'No activity yet';

    const insights = [];

    if (totalInterviews === 0) {
      insights.push({
        icon: '📝',
        title: 'Start practicing',
        description:
          'Complete your first interview to begin tracking your progress.',
      });
    } else {
      insights.push({
        icon: '🎯',
        title: 'Your average score',
        description: allScores.length
          ? `Your average answer score is ${average(allScores)}%.`
          : 'Complete and evaluate interview answers to see your scores.',
      });

      insights.push({
        icon: '💪',
        title: 'Practice consistency',
        description:
          `You have completed ${completedInterviews.length} of ` +
          `${totalInterviews} interview sessions.`,
      });

      insights.push({
        icon: '📚',
        title: 'Questions practiced',
        description:
          `You have practiced ${totalQuestions} questions across your sessions.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalInterviews,
          interviewsThisMonth,
          averageScore: average(allScores),
          scoreImprovement,
          totalQuestions,
          completionRate: totalInterviews
            ? Math.round(
                (completedInterviews.length / totalInterviews) * 100
              )
            : 0,
          totalPracticeTime,
          mostActiveDay,
        },
        performanceByRole,
        performanceByDifficulty,
        progressOverTime,
        categoryScores,
        recentInterviews,
        insights,
      },
    });
  } catch (error) {
    console.error('Get interview analytics error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to load interview analytics.',
    });
  }
};