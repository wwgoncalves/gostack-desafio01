require("dotenv").config();
const express = require("express");

const server = express();
const port = process.env.PORT || 3000;
server.use(express.json());

let numberOfRequestsMade = 0;
const projectsList = [];

function requestsLogger(request, response, next) {
  ++numberOfRequestsMade;
  console.log(`${numberOfRequestsMade} request(s) made so far.`);

  return next();
}

function validateProjectId(request, response, next) {
  const { id } = request.params;
  const projectIndex = projectsList.findIndex(project => project.id === id);
  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project does not exist." });
  }

  request.projectIndex = projectIndex;

  return next();
}

server.use(requestsLogger);

server.get("/projects", (request, response) => {
  return response.json(projectsList);
});

server.post("/projects", (request, response) => {
  const { id, title } = request.body;

  if (!id || !title) {
    return response
      .status(400)
      .json({ error: "An id and a title should be provided for the project." });
  }

  const project = { id: id, title: title, tasks: [] };
  projectsList.push(project);

  return response.json(project);
});

server.put("/projects/:id", validateProjectId, (request, response) => {
  const { projectIndex } = request;
  const { title } = request.body;

  if (!title) {
    return response
      .status(400)
      .json({ error: "A title should be provided for the project." });
  }

  projectsList[projectIndex].title = title;

  return response.json(projectsList[projectIndex]);
});

server.delete("/projects/:id", validateProjectId, (request, response) => {
  const { projectIndex } = request;

  projectsList.splice(projectIndex, 1);

  return response.status(200).send();
});

server.post("/projects/:id/tasks", validateProjectId, (request, response) => {
  const { projectIndex } = request;
  const { title } = request.body;

  if (!title) {
    return response
      .status(400)
      .json({ error: "A title should be provided for the task." });
  }

  projectsList[projectIndex].tasks.push(title);

  return response.json(projectsList[projectIndex]);
});

server.listen(port, () => console.log(`Server listening on port ${port}...`));
