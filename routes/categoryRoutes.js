router.post('/category/:slug/submit', async (req, res) => {
    const slug = req.params.slug;
    const answers = req.body;
  
    try {
      const category = await Category.findOne({ where: { slug } });
      if (!category) return res.status(404).send('Category not found');
  
      const questions = await Question.findAll({ where: { categoryId: category.id } });
  
      let score = 0;
      const results = [];
  
      questions.forEach((question) => {
        const userAnswer = answers[`answer_${question.id}`];
        const isCorrect = userAnswer === question.correctOption;
  
        if (isCorrect) score++;
  
        results.push({
          questionText: question.questionText,
          userAnswer,
          correctAnswer: question.correctOption,
          isCorrect
        });
      });
  
      const QuizResult = require('../models/QuizResult');

// For now, get userEmail from form (you can replace with session user later)
const userEmail = req.body.email || 'anonymous@demo.com';

await QuizResult.create({
  userEmail,
  categoryId: category.id,
  score,
  total: questions.length
});

res.render('quiz-result', {
  categoryName: category.name,
  score,
  total: questions.length,
  results
});

    } catch (err) {
      console.error(err);
      res.status(500).send('Error grading quiz');
    }
  });
  