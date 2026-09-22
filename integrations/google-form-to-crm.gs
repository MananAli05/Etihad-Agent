/**
 * Etihad Garden - Google Form to CRM
 *
 * Posts each Google Form submission to the Sara backend, which writes it to
 * the same leads table the website form, chatbot and voice agent use. Leads
 * are keyed on phone number, so the same person enquiring twice enriches one
 * row instead of creating a duplicate.
 *
 * SETUP
 *   1. Open the form, then the three-dot menu > Apps Script.
 *   2. Replace everything in Code.gs with this file and Save.
 *   3. Run > installTrigger, and approve the permission prompt once.
 *   4. Submit a test response and check the CRM.
 *
 * Question titles below must match the form exactly. Rename a question on the
 * form and the matching entry here has to change with it.
 */

var ENDPOINT = 'https://etihad-agent.vercel.app/api/leads';

var FIELDS = {
  name: 'Full Name',
  phone: 'Phone Number',
  email: 'Email',
  city: 'City',
  interest: 'Primary Interest',
  budget: 'Estimated Budget',
  plot_size: 'Preferred Plot Size',
  phase_preference: 'Phase Preference',
  message: 'Additional Message'
};

/** Run once, by hand, to attach the submit trigger. */
function installTrigger() {
  var form = FormApp.getActiveForm();

  // Drop any trigger from an earlier install so responses are not sent twice.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
  Logger.log('Trigger installed for: ' + form.getTitle());
}

function onFormSubmit(e) {
  var answers = e && e.namedValues ? e.namedValues : {};

  var payload = { source: 'google_form' };
  Object.keys(FIELDS).forEach(function (key) {
    payload[key] = readAnswer(answers, FIELDS[key]);
  });

  if (!payload.name || !payload.phone) {
    // leads.phone is NOT NULL: without a number the response cannot become a
    // lead, and the sales team would have no way to follow it up anyway.
    Logger.log('Skipped - missing name or phone: ' + JSON.stringify(payload));
    return;
  }

  var response = UrlFetchApp.fetch(ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  if (code >= 200 && code < 300) {
    Logger.log('Lead sent: ' + payload.name + ' / ' + payload.phone);
  } else {
    // Logged rather than thrown: a failure here must not show the person an
    // error on a form they already submitted successfully.
    Logger.log('Failed HTTP ' + code + ': ' + response.getContentText());
  }
}

/** Google gives every answer as an array, and unanswered ones as ['']. */
function readAnswer(answers, title) {
  var value = answers[title];
  if (!value) return '';
  var text = Array.isArray(value) ? value.join(', ') : String(value);
  return text.trim();
}
