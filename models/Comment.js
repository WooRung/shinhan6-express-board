const mongoose = require("mongoose");

// Board와 Comment의 관계 (1:N)
// RDB에서 관계: 1:1 / 1:N / N:M
// OneToOne, OneToMany, ManyToMany

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    board: {
      type: mongoose.Types.ObjectId,
      ref: "Board",
      required: true,
    },
  },
  {
    // timestamps: createdAt, updatedAt 자동 추가
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
