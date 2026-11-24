// This js file sets up the logging functionality for the prototypes, which allows us
// to keep track of button presses, and other interactions. Additionally, also sends to a
// google form once the user closes the window.

const FORM_URL = 'https://form2lead.com/api/v1/f/frm_Zw5XicVrBcFfFO-c7nl7oREi';

let sessionId = sessionStorage.getItem('session-id')
if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session-id', sessionId);
}

// function to get the latest sessionStorage data
function getInteractionData() {
    try {
        return JSON.parse(sessionStorage.getItem('interaction-data')) || {};
    } catch {
        return {};
    }
}

// generic function that logs an interaction, and increments the counter
// Use within eventListeners like onClick, etc.
function logInteraction(interactionKey) {
    const interactionData = getInteractionData();
    interactionData[interactionKey] = (interactionData[interactionKey] || 0) + 1;

    sessionStorage.setItem('interaction-data', JSON.stringify(interactionData));
    console.log('Interaction ', interactionKey, ' counter: ', interactionData[interactionKey]);
}

// sends the logs once user switches tabs, apps, navigates away, closes tab, etc.
// see: https://stackoverflow.com/questions/13443503/run-javascript-code-on-window-close-or-page-refresh
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState !== 'hidden') return;

    const interactionData = getInteractionData();
    if (Object.keys(interactionData).length == 0) return;

    const payload = {
        sessionId: sessionId,
        prototypeId: 'charge-and-go',
        ...interactionData
    };

    const formData = new FormData();
    for (const key in payload) {
        formData.append(key, payload[key]);
    }

    // clear interactionData
    sessionStorage.removeItem('interaction-data');

    fetch(FORM_URL, {
        method: 'POST',
        body: formData,
        headers: {
            "Accept": 'application/json'
        },
        keepalive: true
    })
    .then(res => res.json())
    .then(data => console.log('data sent!'))
    .catch(error => console.error("Error sending data: ", error));
});

