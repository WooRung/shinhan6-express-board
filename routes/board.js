const express = require("express");
const Board = require("../models/Board");

const router = express.Router();

// 서버 = Request를 받아서 요청을 처리 한 후 Response를 반환

/**
 * 웹은 Request & Response
 * 1. Request의 Method: GET, POST, PUT(update), DELETE
 * 2. Response의 StatusCode: 2XX, 3XX, 4XX, 5XX
 */

/**
 * 특정 자원에 대한 API
 * GET  / : 전체 리소스 조회
 * POST / : 리소스 등록
 *
 * GET      /:resourceId : 특정 resource 조회
 * PUT      /:resourceId : 특정 resource 수정
 * DELETE   /:resourceId : 특정 resource 삭제
 */

/**
 * GET 요청
 * GET  / : 전체 리소스 조회
 */
router.get("/", async function (req, res, next) {
  /**
   * req:요청
   * res:응답
   * next: middleware실행
   */

  // 요청된 쿠키 확인
  const cookies = req.cookies;
  console.log("요청 쿠키", cookies);

  const boards = await Board.find();

  // 쿠키 설정 (set-cookie HTTP-header)
  res.cookie("cookieName", "cookieValue");

  res.cookie("SecurecookieName", "SecurecookieValue", {
    httpOnly: true,
  });

  res.json(boards);
});

router.post("/", async function (req, res) {
  /**
   * 1. req body로 "게시글 제목"과 "게시글 내용"을 받는다.
   * 2. mongoose를 이용해 저장한다.
   * 3. response를 만들어 준다.
   */
  const data = req.body;
  console.log(data);

  const board = await Board.create({
    title: data.title,
    content: data.content,
  });

  res.json(board);
});

router.get("/:boardId", async (req, res) => {
  console.log(req.params);
  const { boardId } = req.params;
  const board = await Board.findById(boardId);

  // Session사용법.
  // req.session
  if (req.session.boardPath) {
    req.session.boardPath.push(board.title);
    if (req.session.boardPath.length > 10) {
      req.session.boardPath.shift();
    }
  } else {
    req.session.boardPath = [board.title];
  }
  console.log(req.session.boardPath);

  // if (req.session.viewCount) {
  //   req.session.viewCount++;
  // } else {
  //   req.session.viewCount = 1;
  // }

  // req.session.profile = {
  //   id: 1,
  //   name: "younsoo",
  // };
  // console.log("viewCount:", req.session.viewCount);
  // console.log("req.session", req.session);

  res.json(board);
});

/**
 * PUT      /:resourceId : 특정 resource 수정
 * DELETE   /:resourceId : 특정 resource 삭제
 */
// PUT /:boardId  ==> boardId에 해당하는 게시글을 수정하겠다. (req.body)
router.put("/:boardId", async (req, res) => {
  const { boardId } = req.params;
  const data = req.body;
  const { title, content } = data;

  const board = await Board.findByIdAndUpdate(
    boardId,
    {
      title,
      content,
    },
    {
      returnDocument: "after",
    }
  );
  res.json(board);
});

router.delete("/:boardId", async (req, res) => {
  const { boardId } = req.params;
  await Board.findByIdAndDelete(boardId);

  res.status(204).send();
});

// REST API: REpresentational State Transfer.
// API설계 철학: <표현적인 상태 전송 API>

// <REpresentational>
// 1. URL과 HTTP Method만 보아도 어떤 역할을 하는 요청인지 명확히하자.
// 2. Response의 Status Code만 봐도 요청을 어떻게 처리했는지 명확하게 하자.

// <State Transfer>
// 1. 서버에서 State저장하지 말고, HTTP Request에 담아서 State를 전송하자.
// ==> 서버에서 State를 저장하면 , 같은 요청에 대해 다른 결과를 낼 수 있다 ==> Caching이 안 된다.

// Comment에 대한 API
/**
 * GET /board/:boardId/comments ==> boardId에 해당하는 게시글의 댓글 조회
 * POST /board/:boardId/comments ==> boardId에 해당하는 게시글의 댓글 등록
 * PUT /board/:boardId/comments/:commentId ==> commentId수정
 * DELETE /board/:boardId/comments/:commentId ==> commentId삭제
 */
const Comment = require("../models/Comment");

// GET /board/:boardId/comments
router.get("/:boardId/comments", async (req, res) => {
  const { boardId } = req.params;
  const comments = await Comment.find({ board: boardId });
  res.json(comments);
});

// POST /board/:boardId/comments
router.post("/:boardId/comments", async (req, res) => {
  const { boardId } = req.params;
  const { content } = req.body;
  const comment = await Comment.create({
    board: boardId,
    content: content,
  });
  res.status(201).json(comment);
});

// PUT /board/:boardId/comments/:commentId
router.put("/:boardId/comments/:commentId", async (req, res) => {
  const { boardId, commentId } = req.params;
  const { content } = req.body;
  const result = await Comment.findOneAndUpdate(
    {
      board: boardId,
      _id: commentId,
    },
    { content: content }
  );
  res.json(result);
});

// DELETE /board/:boardId/comments/:commentId
router.delete("/:boardId/comments/:commentId", async (req, res) => {
  const { boardId, commentId } = req.params;
  const { content } = req.body;
  await Comment.findOneAndDelete(
    {
      board: boardId,
      _id: commentId,
    },
    { content: content }
  );
  res.status(204).send();
});

module.exports = router;
