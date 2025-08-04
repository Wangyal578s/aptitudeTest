const {QuizResult} = require('../models');
const {Category} = require('../models');

// Dummy email for now – replace with session user later
const getUserHistory = async (req, res) => {
  const userEmail = 'anonymous@demo.com'; // Replace with req.user.email when login is set up

  try {
    const history = await QuizResult.findAll({
      where: { userEmail },
      include: [{ model: Category }],
      order: [['createdAt', 'DESC']]
    });

    res.render('user-history', { history, userEmail });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).send('Error fetching quiz history');
  }
};

module.exports = { getUserHistory };
