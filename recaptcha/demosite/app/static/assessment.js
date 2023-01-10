const createAssessmentRequest = (token, action, sitekey) => {
  return fetch('/create_assessment', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({token, action, sitekey}),
  });
};

function assessRecaptcha(element, event) {
  event.preventDefault();
  grecaptcha.enterprise.ready(() => {
    grecaptcha.enterprise
      .execute(element.getAttribute('data-sitekey'), {
        action: element.getAttribute('data-action'),
      })
      .then(token => {
        return createAssessmentRequest(
          token,
          element.getAttribute('data-action'),
          element.getAttribute('data-sitekey')
        );
      })
      .then(res => res.json())
      .then(res => {
        if (!res) {
          addMessage('Error: request without data');
          return;
        }

        if (!res.error && res.data) {
          document.getElementById('scoreButton').innerText = res.data.score;
          return;
        }

        if (res.error) {
          addMessage(`Server error: ${res.error}`);
        }
      })
      .catch(res => {
        addMessage(`Server error: ${res}`);
      });
  });
}

const verifyCallback = function (token) {
  const recaptchaDiv = document.getElementById('recaptcha_render_div');

  createAssessmentRequest(
    token,
    recaptchaDiv.getAttribute('data-action'),
    recaptchaDiv.getAttribute('data-sitekey')
  )
    .then(res => res.json())
    .then(res => {
      if (!res) {
        addMessage('Error: request without data');
        return;
      }

      if (!res.error && res.data) {
        document.getElementById('scoreButton').innerText = res.data.score;
        return;
      }

      if (res.error) {
        addMessage(`Server error: ${res.error}`);
      }
    })
    .catch(res => {
      addMessage(`Server error: ${res}`);
    });
};

const onloadCallback = function (event) {
  event.preventDefault();
  document.getElementById('submitBtn').style.display = 'none';
  const recaptcha_render_div = document.getElementById('recaptcha_render_div');
  recaptcha_render_div.style.display = 'block';
  grecaptcha.enterprise.render(recaptcha_render_div, {
    sitekey: recaptcha_render_div.getAttribute('data-sitekey'),
    callback: verifyCallback,
    theme: 'light',
  });
};

function addMessage(message) {
  const myDiv = document.createElement('div');
  myDiv.id = 'div_id';
  myDiv.innerHTML = message + '<p>';
  document.body.appendChild(myDiv);
}
