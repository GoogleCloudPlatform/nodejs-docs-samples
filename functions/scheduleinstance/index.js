// [START functions_start_instance_http]
// [START functions_stop_instance_http]
const Compute = require('@google-cloud/compute');
const compute = new Compute();

// [END functions_stop_instance_http]
/**
 * Starts a Compute Engine instance.
 *
 * Expects an HTTP POST request with a request body containing the following
 * attributes:
 *  zone - the GCP zone the instance is located in.
 *  instance - the name of the instance.
 *
 * @param {!object} req Cloud Function HTTP request data.
 * @param {!object} res Cloud Function HTTP response data.
 * @returns {!object} Cloud Function response data with status code and message.
 */
exports.startInstance = (req, res) => {
  try {
    const reqBody = _validateReqBody(_parseReqBody(_validateReq(req)));
    compute.zone(reqBody.zone)
      .vm(reqBody.instance)
      .start()
      .then(data => {
        // Operation pending.
        const operation = data[0];
        return operation.promise();
      })
      .then(() => {
        // Operation complete. Instance successfully started.
        const message = 'Successfully started instance ' + reqBody.instance;
        console.log(message);
        res.status(200).send(message);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({error: err.message});
      });
  } catch (err) {
    console.log(err);
    res.status(400).send({error: err.message});
  }
  return res;
};
// [END functions_start_instance_http]

// [START functions_stop_instance_http]
/**
 * Stops a Compute Engine instance.
 *
 * Expects an HTTP POST request with a request body containing the following
 * attributes:
 *  zone - the GCP zone the instance is located in.
 *  instance - the name of the instance.
 *
 * @param {!object} req Cloud Function HTTP request data.
 * @param {!object} res Cloud Function HTTP response data.
 * @returns {!object} Cloud Function response data with status code and message.
 */
exports.stopInstance = (req, res) => {
  try {
    const reqBody = _validateReqBody(_parseReqBody(_validateReq(req)));
    compute.zone(reqBody.zone)
      .vm(reqBody.instance)
      .stop()
      .then(data => {
        // Operation pending.
        const operation = data[0];
        return operation.promise();
      })
      .then(() => {
        // Operation complete. Instance successfully stopped.
        const message = 'Successfully stopped instance ' + reqBody.instance;
        console.log(message);
        res.status(200).send(message);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({error: err.message});
      });
  } catch (err) {
    console.log(err);
    res.status(400).send({error: err.message});
  }
  return res;
};
// [START functions_start_instance_http]

/**
 * Parses the request body attributes of an HTTP request based on content-type.
 *
 * @param {!object} req a Cloud Functions HTTP request object.
 * @returns {!object} an object with attributes matching the HTTP request body.
 */
function _parseReqBody (req) {
  const contentType = req.get('content-type');
  if (contentType === 'application/json') {
    // Request.body automatically parsed as an object.
    return req.body;
  } else if (contentType === 'application/octet-stream') {
    // Convert buffer to a string and parse as JSON string.
    return JSON.parse(req.body.toString());
  } else {
    throw new Error('Unsupported HTTP content-type ' + req.get('content-type') +
        '; use application/json or application/octet-stream');
  }
}

/**
 * Validates that a request body contains the expected fields.
 *
 * @param {!object} reqBody the request body to validate.
 * @returns {!object} the request body object.
 */
function _validateReqBody (reqBody) {
  if (!reqBody.zone) {
    throw new Error(`Attribute 'zone' missing from POST request`);
  } else if (!reqBody.instance) {
    throw new Error(`Attribute 'instance' missing from POST request`);
  }
  return reqBody;
}

/**
 * Validates that a HTTP request contains the expected fields.
 *
 * @param {!object} req the request to validate.
 * @returns {!object} the request object.
 */
function _validateReq (req) {
  if (req.method !== 'POST') {
    throw new Error('Unsupported HTTP method ' + req.method +
        '; use method POST');
  } else if (typeof req.get('content-type') === 'undefined') {
    throw new Error('HTTP content-type missing');
  }
  return req;
}
// [END functions_start_instance_http]
// [END functions_stop_instance_http]
