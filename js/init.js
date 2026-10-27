// js/init.js - UI initialization and navigation handling

document.addEventListener('DOMContentLoaded', () => {
  // Screen navigation helper
  const showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  };

  // Abort/countdown back to home
  const btnAbortCountdown = document.getElementById('btn-abort-countdown');
  if (btnAbortCountdown) {
    btnAbortCountdown.addEventListener('click', () => showScreen('screen-home'));
  }

  // Abort round back to home (will show exit confirm modal)
  const btnAbortRound = document.getElementById('btn-abort-round');
  if (btnAbortRound) {
    btnAbortRound.addEventListener('click', () => {
      const modal = document.getElementById('modal-exit-confirm');
      if (modal) modal.classList.add('active');
    });
  }

  // Exit confirmation modal buttons
  const btnExitYes = document.getElementById('btn-exit-yes');
  const btnExitNo = document.getElementById('btn-exit-no');
  if (btnExitYes) {
    btnExitYes.addEventListener('click', () => {
      // Close the web app / unload
      window.close();
    });
  }
  if (btnExitNo) {
    btnExitNo.addEventListener('click', () => {
      const modal = document.getElementById('modal-exit-confirm');
      if (modal) modal.classList.remove('active');
    });
  }

  // Exit confirmation on page unload (mobile back button)
  window.addEventListener('beforeunload', (e) => {
    const modal = document.getElementById('modal-exit-confirm');
    if (modal && !modal.classList.contains('active')) {
      e.preventDefault();
      e.returnValue = '';
      modal.classList.add('active');
      return '';
    }
  });
});
