const { Category, Question } = require('../models');

const categoryDescriptions = {
  arithmetic: {
    title: 'Arithmetic Aptitude',
    description: 'Covers problems involving numbers, ratios, percentages, averages, etc.',
    sample: 'What is the least number that is divisible by all the numbers from 1 to 10?',
  },
  di: {
    title: 'Data Interpretation',
    description: 'Analyze and solve questions based on graphs and charts.',
    sample: 'Based on the pie chart of student marks, how many scored above 70%?',
  },
  verbal: {
    title: 'Verbal Ability',
    description: 'Questions related to grammar, comprehension, and sentence correction.',
    sample: 'Choose the correct synonym of the word “Ubiquitous”.',
  },
  logical: {
    title: 'Logical Reasoning',
    description: 'Covers pattern recognition, sequences, and logical deduction.',
    sample: 'Find the next number in the series: 2, 6, 12, 20, 30, ___?',
  },
  reasoning: {
    title: 'Verbal Reasoning',
    description: 'Evaluate and analyze written arguments.',
    sample: 'Statement: Some cats are dogs. Conclusion: All dogs are cats. Determine validity.',
  },
  puzzle: {
    title: 'Puzzle Quizzes',
    description: 'Test your brain with lateral thinking and grid puzzles.',
    sample: 'A man is looking at a photo of someone. He says, "Brothers and sisters, I have none. But that man’s father is my father’s son." Who is in the photo?',
  }
};

const renderCategory = async (req, res) => {
  const slug = req.params.slug;
  const isLoggedIn = req.session.user;

  try {
    const category = await Category.findOne({ where: { slug } });

    if (!category) {
      return res.status(404).send('Category not found.');
    }

    let questions = await Question.findAll({ where: { categoryId: category.id } });

    // Restrict questions for non-logged-in users
    if (!isLoggedIn) {
      questions = questions.slice(0, 2).map(q => ({
        ...q.toJSON(),
        hideAnswer: true
      }));
    }

    const descriptionBlock = categoryDescriptions[slug];

    if (!descriptionBlock) {
      return res.status(404).send('Category info not defined.');
    }

    res.render('categoryQuestions', {
      categoryTitle: descriptionBlock.title,
      description: descriptionBlock.description,
      sample: descriptionBlock.sample,
      questions,
      isLoggedIn
    });

  } catch (err) {
    console.error('Category view error:', err);
    res.status(500).send('Internal server error');
  }
};

module.exports = { renderCategory };
