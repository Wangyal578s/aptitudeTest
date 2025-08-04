const { Category, Question } = require('../models');

const categoryMap = {
  arithmetic: 'Arithmetic Aptitude',
  di: 'Data Interpretation',
  verbal: 'Verbal Ability',
  logical: 'Logical Reasoning',
  reasoning: 'Verbal Reasoning',
  puzzle: 'Puzzle Quizes'
};

const getQuestionsByCategory = async (req, res) => {
  const slug = req.params.slug;
  const categoryName = categoryMap[slug];

  if (!categoryName) {
    return res.status(404).render('404');
  }

  try {
    const category = await Category.findOne({
      where: { name: categoryName },
      include: Question
    });

    if (!category) {
      return res.status(404).render('404');
    }

    let questions = category.Questions;

    const isLoggedIn = !!req.session.user;

    if (!isLoggedIn) {
      questions = questions.slice(0, 2).map(q => ({
        ...q.toJSON(),
        hideAnswer: true
      }));
    }

    res.render('category-questions', {
      title: category.name,
      questions,
      isLoggedIn
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

module.exports = { getQuestionsByCategory };
