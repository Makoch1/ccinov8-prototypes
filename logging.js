// This js file sets up the logging functionality for the prototypes, which allows us
// to keep track of button presses, and other interactions. Additionally, also sends to a
// google form once the user closes the window.

const FORM_URL = 'https://form2lead.com/api/v1/f/frm_Zw5XicVrBcFfFO-c7nl7oREi';

const sessionId = localStorage.getItem('session-id')
    ? localStorage.getItem('session-id')
    : crypto.randomUUID();

let interactionData = localStorage.getItem('interaction-data')
    ? JSON.parse(localStorage.getItem('interaction-data'))
    : {};

// generic function that logs an interaction, and increments the counter
// Use within eventListeners like onClick, etc.
function logInteraction(interactionKey) {
    interactionData[interactionKey] = interactionData[interactionKey]
        ? interactionData[interactionKey] + 1
        : 1;

    localStorage.setItem('interaction-data', JSON.stringify(interactionData));

    console.log('Interaction ', interactionKey, ' counter: ', interactionData[interactionKey]);
}

// sends the logs once user switches tabs, apps, navigates away, closes tab, etc.
// see: https://stackoverflow.com/questions/13443503/run-javascript-code-on-window-close-or-page-refresh
document.addEventListener('visibilitychange', function() {
    if (Object.keys(interactionData).length == 0) return;

    if (document.visibilityState == 'hidden') { 
        const payload = {
            sessionId: sessionId,
            prototypeId: 'charge-and-go',
            ...interactionData
        };

        const formData = new FormData();
        for (var key in payload) {
            formData.append(key, payload[key]);
        }

        fetch(FORM_URL, {
            method: 'POST',
            body: formData,
            headers: {
                "Accept": 'application/json'
            },
            keepalive: true
        })
        .then(res => res.json())
        .then(data => {
            localStorage.removeItem('interaction-data');
            interactionData = {};
            console.log('sent!');
        })
        .catch(error => console.error("Error sending data: ", error));
    }
});

