// models/QuizResult.js
module.exports = (sequelize, DataTypes) => {
  const QuizResult = sequelize.define(
    "QuizResult",
    {
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
      },
    },
    {
      tableName: "QuizResults",
      timestamps: true,
    },
  )

  return QuizResult
}
