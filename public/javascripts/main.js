document.addEventListener('DOMContentLoaded', () => {
  const peer = new Peer({
   // key: 'lwjd5qra8257b9', // cant sign up for free key :/
    config: {
      iceServers: [
        {
          url: 'stun:stun.l.google.com:19302' // add TURN server for users behind symmetric NATs
        }
      ]
    },
    debug: 3
  });

  let conn;
  let peerName;

  peer.on('open', (id) => {
    document.querySelector('#my-id').innerText = id;
  });

  function showSnackbar(textToShow) {
    const snacbar = document.querySelector('#snackbar');
    snacbar.innerText = textToShow;
    snacbar.className = 'show';
    setTimeout(() => {
      snacbar.className = snacbar.className.replace('show', '');
    }, 3000);
  }

  function disabledPeersNameInput() {
    document.querySelector('#peer-name').setAttribute('disabled', '');
    document.querySelector('#peer-name-bttn').setAttribute('disabled', '');
  }

  function showNextElement(time = 50) {
    const hiddenElements = document.querySelectorAll('.to-hide');
    hiddenElements[0].classList.remove('hidden');
    setTimeout(() => {
      hiddenElements[0].classList.remove('invisible');
    }, time);
  }

  function hideElement(time = 2000) {
    setTimeout(() => {
      const elementsToHide = document.querySelectorAll('.to-hide');
      elementsToHide[0].classList.remove('to-hide');
      elementsToHide[0].classList.add('invisible');
      setTimeout(() => {
        elementsToHide[0].classList.add('hidden');
      }, 1000);
    }, time);
  }

  function simpleAnimation() {
    if (document.querySelector('.to-hide').tagName === 'DIV') {
      showNextElement();
      // clearInterval();
    } else {
      showNextElement();
      hideElement();
    }
  }
  // simpleAnimation();
  window.onload = () => {
    // setInterval(() => {
    simpleAnimation();
    setTimeout(() => {
      simpleAnimation();
    }, 3200);
    setTimeout(() => {
      simpleAnimation();
    }, 6400);
    // }, 1100);
  };

  function showNextStep() {
    hideElement(50);
    setTimeout(() => {
      showNextElement();
    }, 1050);
  }

  function checkTheName() {
    let name = document.querySelector('#peer-name').value;
    name = name.trim();
    if (name !== '') {
      showSnackbar(`Hello ${name}!`);
      disabledPeersNameInput();
      showNextStep();
    } else {
      showSnackbar('What is your name?');
    }
  }

  document.querySelector('#peer-name-bttn').addEventListener('click', checkTheName);

  function disabledElements() {
    document.querySelector('#make-call').setAttribute('disabled', '');
    document.querySelector('#callto-id').setAttribute('disabled', '');
  }

  /*
  function enabledElements() {
    document.querySelector('#data-to-send').removeAttribute('disabled');
    document.querySelector('#send-data-bttn').removeAttribute('disabled');
  }
*/

  function setDataConnection() {
    const anotherPeersId = document.querySelector('#callto-id').value;
    peerName = document.querySelector('#peer-name').value;
    if (anotherPeersId === '') {
      showSnackbar('Peer id can not be empty!');
    } else if (anotherPeersId === peer.id) {
      showSnackbar('Do not call to yourself!');
      document.querySelector('#callto-id').value = '';
    } else {
      conn = peer.connect(anotherPeersId, {
        metadata: {
          username: peerName
        }
      });
    }
  }

  function thereIsMessage() {
    let message = document.querySelector('#data-to-send').value;
    let isMessage = false;
    message = message.trim();
    if (message !== '') {
      isMessage = true;
    }
    return isMessage;
  }

  function createDivForMessage(from, message) {
    const divForUserMessage = document.createElement('div');
    divForUserMessage.classList.add('user-message');
    divForUserMessage.innerText = `${from}: ${message}`;
    document.querySelector('#message-box').appendChild(divForUserMessage);
  }

  function sendSomeData() {
    const message = document.querySelector('#data-to-send').value;
    // console.log(`connection info - peer id: ${peer.id}`);
    const data = {
      from: peerName,
      text: message
    };
    conn.send(data);
    createDivForMessage(data.from, data.text);
  }

  function clearSendTextBox() {
    document.querySelector('#data-to-send').value = '';
  }

  function getLastMessage() {
    const allMessages = document.querySelectorAll('.user-message');
    const lastMessage = allMessages[allMessages.length - 1];
    return lastMessage;
  }

  function showLastMessageOnTheBottom() {
    const lastMessage = getLastMessage();
    lastMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function sendMessage() {
    if (thereIsMessage() === true) {
      sendSomeData();
      clearSendTextBox();
      showLastMessageOnTheBottom();
    }
  }

  document.querySelector('#make-call').addEventListener('click', setDataConnection);
  document.querySelector('#send-data-bttn').addEventListener('click', sendMessage);


  function showWelcomeMessage() {
    const welcomeMessage = 'Welcome on peer to peer simmple chat!';
    document.querySelector('#message-box').children[0].innerText = welcomeMessage;
  }

  function checkThePeer(connection) {
    if (document.querySelector('#callto-id').value === ''
      || document.querySelector('#callto-id').value !== connection.peer) {
      document.querySelector('#callto-id').value = connection.peer;
      setDataConnection();
    }
  }

  peer.on('connection', (connection) => {
    conn = connection;
    checkThePeer(conn);
    disabledElements();
    showNextStep();
    showWelcomeMessage();
    showSnackbar('A connection has been established');

    conn.on('data', (message) => {
      createDivForMessage(message.from, message.text);
      showLastMessageOnTheBottom();
    });

    function showErrorOnLastMessage() {
      const lastMessage = getLastMessage();
      lastMessage.classList.add('error');
    }

    function disabledChat() {
      document.querySelector('#data-to-send').setAttribute('disabled', '');
      document.querySelector('#send-data-bttn').setAttribute('disabled', '');
      showErrorOnLastMessage();
    }

    conn.on('close', () => {
      showSnackbar('Connection closed');
      createDivForMessage('Error', 'Connection closed');
      disabledChat();
    });
  });


  peer.on('disconnected', () => {
    showSnackbar('Connection has been lost');
    // peer.reconnect();
  });

  function clearPeerId() {
    document.querySelector('#callto-id').value = '';
  }

  peer.on('error', (err) => {
    showSnackbar(`An error ocurred with peer: ${err}`);
    if (err.type === 'peer-unavailable') {
      setTimeout(() => {
        showSnackbar('Pass right peer id!');
        clearPeerId();
      }, 3500);
    }
  });

  function pressTheButton(target) {
    target.nextElementSibling.click();
  }

  function listenForEnter(e) {
    if (e.keyCode === 13) {
      pressTheButton(e.target);
    }
  }

  document.querySelectorAll('input[type=text').forEach((input) => {
    input.addEventListener('keydown', listenForEnter);
  });

  function copyPeerId() {
    const peerToCopy = document.querySelector('#my-id').innerText;
    const textarea = document.createElement('textarea');
    textarea.classList.add('temp-texarea');
    document.body.appendChild(textarea);
    textarea.value = peerToCopy;
    textarea.select();
    try {
      const status = document.execCommand('copy');
      if (!status) {
        showSnackbar('Cannot copy peerId - copy it by yourself');
      } else {
        showSnackbar(`You copied: ${peerToCopy}`);
      }
    } catch (err) {
      showSnackbar(`Failed to copy + ${err}`);
    }
    textarea.remove();
  }

  document.querySelector('#copy-bttn').addEventListener('click', copyPeerId);

  /*
  function fullScreenModeOnOf() {
    const chatWindow = document.querySelector('.data-container');
    const resizeBttn = document.querySelector('#data-container-resize-bttn');
    if (resizeBttn.value !== '+') {
      resizeBttn.value = '+';
      chatWindow.classList.remove('fullWindow');
      setTimeout(() => {
        showLastMessageOnTheBottom();
      }, 1500);
    } else {
      resizeBttn.value = '-';
      chatWindow.classList.add('fullWindow');
      setTimeout(() => {
        showLastMessageOnTheBottom();
        window.scroll({ behavior: 'smooth', top: document.body.scrollHeight });
        // document.querySelector('body').scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 1700);
    }
  }
  document.querySelector('#data-container-resize-bttn').addEventListener('click', fullScreenModeOnOf);
  */

  document.body.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });
  document.body.addEventListener('keydown', () => {
    document.body.classList.remove('using-mouse');
  });
});
