const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (data) => {
  const html = Mustache.render(messageTemplate, {
    message: data.msg,
    createdAt: moment(data.createdAt).format('h:m:s a'),
    name: data.name,
  });
  console.log(data);
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  const messageText = $messageFormInput.value;
  $messageFormInput.value = '';
  $messageFormInput.focus();
  socket.emit('sendMesaage', messageText, (error) => {
    $messageFormButton.removeAttribute('disabled');
    if (error) {
      return console.log(error);
    }

    console.log('message was delivered!');
  });
});

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  $locationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      },
      (status) => {
        if (status) {
          console.log('Location shared');
          $locationButton.removeAttribute('disabled');
          return;
        }

        console.log('Something went wrong');
      },
    );
  });
});

socket.on('locationMessage', (data) => {
  const html = Mustache.render(locationTemplate, {
    url: data.msg,
    createdAt: moment(data.createdAt).format('h:m:s a'),
    name: data.name,
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});
