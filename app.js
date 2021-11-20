const express = require("express");
let { format, isValid } = require("date-fns");

const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
module.exports = app;
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const validateStatus = async (request, response, next) => {
  const { status = "", priority = "", category = "" } = request.query;
  console.log(status);
  if (status !== "" && priority !== "") {
    console.log("given request is status and priority update");
    console.log(`${status},${priority}`);
    if (
      (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
      (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
    ) {
      const getTodoWithStatusAndPriority = `SELECT * FROM todo WHERE status = '${status}' and priority = '${priority}';`;
      const dbResponse = await db.all(getTodoWithStatusAndPriority);
      //response.send(dbResponse);
      response.send(
        dbResponse.map((eachObject) =>
          convertDBObjectToResponseObject(eachObject)
        )
      );
    } else if (
      (status !== "TO DO" || status !== "IN PROGRESS" || status !== "DONE") &&
      (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
    ) {
      console.log("status");
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (
      (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
      (priority !== "HIGH" || priority !== "MEDIUM" || priority !== "LOW")
    ) {
      console.log("priority");
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (status !== "" && category !== "") {
    console.log("given request is status and category update");
    console.log(`${status},${category}`);
    if (
      (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
      (category === "WORK" || category === "HOME" || category === "LEARNING")
    ) {
      const getTodoWithStatusAndCategory = `SELECT * FROM todo WHERE status = '${status}' and category = '${category}';`;
      const dbResponse = await db.all(getTodoWithStatusAndCategory);
      //response.send(dbResponse);
      response.send(
        dbResponse.map((eachObject) =>
          convertDBObjectToResponseObject(eachObject)
        )
      );
    } else if (
      (status !== "TO DO" || status !== "IN PROGRESS" || status !== "DONE") &&
      (category === "WORK" || category === "HOME" || category === "LEARNING")
    ) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (
      (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
      (category !== "WORK" || category !== "HOME" || category !== "LEARNING")
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (status === "") {
    next();
  } else if (
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE"
  ) {
    console.log("given request is status update");
    const getAllTodoWithStatusTodo = `SELECT * FROM todo WHERE status LIKE '%${status}%';`;
    const dbResponse = await db.all(getAllTodoWithStatusTodo);
    response.send(
      dbResponse.map((eachTodo) => convertDBObjectToResponseObject(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};
const validatePriority = async (request, response, next) => {
  const { priority = "", category = "" } = request.query;
  console.log(priority);
  if (priority !== "" && category !== "") {
    console.log("given update is priority and category update");
    if (
      (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
      (category === "WORK" || category === "HOME" || category === "LEARNING")
    ) {
      const getTodoWithPriorityAndCategory = `SELECT * FROM todo WHERE priority = '${priority}' and category = '${category}';`;
      const dbResponse = await db.all(getTodoWithPriorityAndCategory);
      response.send(
        dbResponse.map((eachObject) =>
          convertDBObjectToResponseObject(eachObject)
        )
      );
    } else if (
      (priority !== "HIGH" || priority !== "MEDIUM" || priority !== "LOW") &&
      (category === "WORK" || category === "HOME" || category === "LEARNING")
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (
      (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
      (category !== "WORK" || category !== "HOME" || category !== "LEARNING")
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (priority === "") {
    next();
  } else if (
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    priority === "LOW"
  ) {
    console.log("given request is priority update");
    const getAllTodoWithPriorityHigh = `SELECT * FROM todo WHERE priority = '${priority}'`;
    const dbResponse = await db.all(getAllTodoWithPriorityHigh);
    response.send(
      dbResponse.map((eachTodo) => convertDBObjectToResponseObject(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const validateCategory = async (request, response, next) => {
  const { category = "" } = request.query;
  console.log(category);
  if (category === "") {
    next();
  } else if (
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  ) {
    console.log("given request is category update");
    const getTodoWithCategory = `SELECT * FROM todo WHERE category = '${category}';`;
    const dbResponse = await db.all(getTodoWithCategory);
    response.send(
      dbResponse.map((eachTodo) => convertDBObjectToResponseObject(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const validateTodo = async (request, response, next) => {
  const { search_q } = request.query;
  if (search_q !== "") {
    const getTodo = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
    const dbResponse = await db.all(getTodo);
    response.send(
      dbResponse.map((eachObject) =>
        convertDBObjectToResponseObject(eachObject)
      )
    );
  } else {
    next();
  }
};

const validateDate = (request, response, next) => {
  const { date } = request.query;
  //console.log(date);
  const givenDate = new Date(date);
  //console.log(givenDate);
  let result = format(givenDate, "yyyy-MM-dd");
  console.log(result);
};

app.get(
  "/todos/",
  validateStatus,
  validatePriority,
  validateCategory,
  validateTodo,
  async (request, response) => {
    const { status = "", priority = "", category = "" } = request.query;
  }
);

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoBasedOnId = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(getTodoBasedOnId);
  response.send(convertDBObjectToResponseObject(dbResponse));
});

const validateDueDate = (request, response, next) => {
  const { date } = request.query;
  console.log(date);
  if (date !== "") {
    let date_list = date.split("-");
    console.log(date_list);
    let new_date_list = [];
    for (let i of date_list) {
      new_date_list.push(parseInt(i));
    }
    if (
      isValid(new Date(new_date_list[0], new_date_list[1], new_date_list[2]))
    ) {
      let new_due_date = format(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2]),
        "yyyy-MM-dd"
      );
      console.log(new_due_date);
      request.new_due_date = new_due_date;
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};

app.get("/agenda/", validateDueDate, async (request, response) => {
  const { new_due_date } = request;
  console.log(`new due date: ${new_due_date}`);
  const getTodoWithDate = `SELECT * FROM todo WHERE due_date = '${new_due_date}';`;
  const dbResponse = await db.all(getTodoWithDate);
  response.send(
    dbResponse.map((eachObject) => convertDBObjectToResponseObject(eachObject))
  );
});

const validateStatus1 = async (request, response, next) => {
  const {
    status = "",
    priority = "",
    category = "",
    todo = "",
    dueDate = "",
  } = request.body;
  const { todoId } = request.params;
  console.log(`${status},${priority},${category},${todo},${dueDate}`);
  if (status === "") {
    next();
  } else if (
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE"
  ) {
    console.log("given request is status update");
    const updateTodoStatus = `UPDATE todo SET status = '${status}' WHERE id=${todoId}`;
    await db.run(updateTodoStatus);
    response.send("Status Updated");
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

validatePriority1 = async (request, response, next) => {
  const {
    status = "",
    priority = "",
    category = "",
    todo = "",
    dueDate = "",
  } = request.body;
  console.log(`${status},${priority},${category},${todo},${dueDate}`);
  const { todoId } = request.params;
  if (priority === "") {
    next();
  } else if (
    priority === "HIGH" ||
    priority === "LOW" ||
    priority === "MEDIUM"
  ) {
    console.log("given request is priority update");
    const updateTodoPriority = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
    await db.run(updateTodoPriority);
    response.send("Priority Updated");
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const validateCategory1 = async (request, response, next) => {
  const {
    status = "",
    priority = "",
    category = "",
    todo = "",
    dueDate = "",
  } = request.body;
  console.log(`${status},${priority},${category},${todo},${dueDate}`);
  const { todoId } = request.params;
  if (category === "") {
    next();
  } else if (
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING"
  ) {
    console.log("given update is category update");
    const updateTodoCategory = `UPDATE todo SET category = '${category}' WHERE id = ${todoId};`;
    await db.run(updateTodoCategory);
    response.send("Category Updated");
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const validateTodo1 = async (request, response, next) => {
  const {
    status = "",
    priority = "",
    category = "",
    todo = "",
    dueDate = "",
  } = request.body;
  console.log(`${status},${priority},${category},${todo},${dueDate}`);
  const { todoId } = request.params;
  if (todo !== "") {
    console.log("given request is todo update");
    const updateTodo = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    await db.run(updateTodo);
    response.send("Todo Updated");
  } else {
    next();
  }
};

const validateDueDate1 = async (request, response, next) => {
  const {
    status = "",
    priority = "",
    category = "",
    todo = "",
    dueDate = "",
  } = request.body;
  console.log(`${status},${priority},${category},${todo},${dueDate}`);
  const { todoId } = request.params;
  if (dueDate === "") {
    next();
  } else {
    console.log("given request is date update");
    let date_list = dueDate.split("-");
    console.log(date_list);
    let new_date_list = [];
    for (let i of date_list) {
      new_date_list.push(parseInt(i));
    }
    if (
      isValid(new Date(new_date_list[0], new_date_list[1], new_date_list[2]))
    ) {
      let new_due_date = format(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2]),
        "yyyy-MM-dd"
      );
      console.log(new_due_date);
      const updateDate = `UPDATE todo SET due_date = ${new_due_date} WHERE id = ${todoId};`;
      await db.run(updateDate);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};

app.put(
  "/todos/:todoId/",
  validateStatus1,
  validatePriority1,
  validateCategory1,
  validateTodo1,
  validateDueDate1,
  async (request, response) => {}
);

const validateStatus2 = (request, response, next) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};

const validatePriority2 = (request, response, next) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

const validateCategory2 = (request, response, next) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};

const validateDate2 = (request, response, next) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (dueDate !== "") {
    let date_list = dueDate.split("-");
    console.log(date_list);
    let new_date_list = [];
    for (let i of date_list) {
      new_date_list.push(parseInt(i));
    }
    if (
      isValid(new Date(new_date_list[0], new_date_list[1], new_date_list[2]))
    ) {
      let new_due_date = format(
        new Date(new_date_list[0], new_date_list[1] - 1, new_date_list[2]),
        "yyyy-MM-dd"
      );
      console.log(new_due_date);
      next();
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
};

app.post(
  "/todos/",
  validateStatus2,
  validatePriority2,
  validateCategory2,
  validateDate2,
  async (request, response) => {
    const todoDetails = request.body;
    const { id, todo, priority, status, category, dueDate } = todoDetails;
    const addTodo = `INSERT INTO todo(id,todo,priority,status,category,due_date) 
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}'
    );`;
    await db.run(addTodo);
    response.send("Todo Successfully Added");
  }
);

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
