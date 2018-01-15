// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});


// Service Worker
if (!window.Promise) {
    window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function(err) {
            console.log(err);
        });
}
