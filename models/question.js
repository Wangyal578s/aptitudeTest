// models/question.js
module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define(
    "Question",
    {
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      options: {
        type: DataTypes.JSONB, // Use JSONB for PostgreSQL
        allowNull: false,
      },
      correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "Questions",
      timestamps: true,
    },
  )

  return Question
}
