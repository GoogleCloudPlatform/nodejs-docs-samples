exports.function = function(req, res) {
  switch(req.method) {
    case "GET":
      res.send("Hello World!");
      break;
    case "POST":
      res.status(403).send("Forbidden!");
      break;
    default:
      res.status(500).send({ error: "Something blew up!" });
      break;
  }
};
