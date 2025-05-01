// Placeholder for advanced emoji picker functionality
// You can integrate a library like Emoji Mart or similar here
// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const emojiBtn = document.getElementById('emoji-btn');
    const msgInput = document.getElementById('msg');
  
    // Create the emoji picker element
    const picker = document.createElement('emoji-picker');
    picker.style.position = 'absolute';
    picker.style.bottom = '60px';
    picker.style.right = '20px';
    picker.style.display = 'none';
    document.body.appendChild(picker);
  
    // Toggle the visibility of the emoji picker
    emojiBtn.addEventListener('click', () => {
      picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    });
  
    // Add the selected emoji to the message input
    picker.addEventListener('emoji-click', event => {
      msgInput.value += event.detail.unicode;
      picker.style.display = 'none';
      msgInput.focus();
    });
  
    // Hide the emoji picker when clicking outside
    document.addEventListener('click', (event) => {
      if (!picker.contains(event.target) && event.target !== emojiBtn) {
        picker.style.display = 'none';
      }
    });
  });
  